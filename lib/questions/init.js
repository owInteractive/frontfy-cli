/**
 * Imports
 */
const project = process.cwd();
const inquirer = require('inquirer');
const init = require('../init');
const alerts = require('../helpers/alerts');
const utils = require('../helpers/utils');
const fs = require('fs-extra');
const fileSystem = require('../helpers/file-system');
const path = require('path');
const realRootPath = path.join(path.dirname(fs.realpathSync(__filename)), '../../');
const chalk = require("chalk");
const commonTags = require('common-tags');

module.exports = {

	/**
	 * Question the user about the project
	 */
	questionsAboutProject: () => {

		return new Promise(async (resolve, reject) => {

			exec();

			// Execute the promise
			async function exec() {

				const name = await getProjectName();
				const technology = await getProjectTechnology();

				await init.project(name, technology);

				return resolve({
					name,
					technology
				});

			}

			// Ask the user to get the project name
			function getProjectName() {

				return new Promise((resolve, reject) => {

					exec();

					// Execute the promise
					async function exec() {
						inquirer
							.prompt({
								message: 'How would you like to name the project?',
								type: 'input',
								name: 'name',
								validate: (response) => response !== ''
							}).then(answers => {

								let name = answers.name;

								inquirer
									.prompt({
										message: `Use prefix and suffix on the project name (front.${answers.name}.com.br)?` + chalk.gray(' (Y/n)'),
										type: 'input',
										name: 'usePrefixAndSuffix',
										validate: (response) => {

											if (response === '') {
												return false;
											}

											if (response.toLowerCase() !== 'y' && response.toLowerCase() !== 'n') {
												return false;
											}

											return true;

										}

									}).then(answers => {

										if (answers.usePrefixAndSuffix.toLowerCase() === 'y') name = `front.${name}.com.br`;

										if (fs.existsSync(`${project}/${name}`)) {
											alerts.error(`A project with this name already exists. Try another name!`);
											return exec();
										}

										resolve(name);

									});

							});

					}

				});

			}

			// Ask the user to get the project technology
			function getProjectTechnology() {

				return new Promise((resolve, reject) => {

					inquirer
						.prompt(
							[{
								message: 'What technology do you want to use?',
								type: 'list',
								name: 'technology',
								choices: ['NodeJS', 'PHP']
							}]
						).then(answers => resolve(answers.technology));

				});

			}

		});

	},

	/**
	 * Question the user about the repository
	 */
	questionsAboutRepository: (name) => {

		return new Promise(async (resolve, reject) => {

			exec();

			// Execute the promise
			async function exec() {

				inquirer
					.prompt({
						message: 'Do you like to create a repository?',
						type: "list",
						name: 'repository',
						choices: ["Yes, on Bitbucket.", "Yes, on Github.", "No, thanks."]
					}).then(async (answers) => {

						const response = answers.repository;

						switch (response) {

							case 'No, thanks.':
								resolve();
								break;

							case 'Yes, on Bitbucket.':
								await createRepo('bitbucket');
								resolve();
								break;

							case 'Yes, on Github.':
								await createRepo('github');
								resolve();
								break;

							default:
								alerts.error(`This option doesn't exist. Try a valid option or call --help.`);
								break;

						}

					});

			}

			// Initialize repository creation
			function createRepo(repository) {

				return new Promise(async (resolve, reject) => {

					exec();

					// Execute the promise
					async function exec() {

						let opts = {
							name,
							repository,
							owner: '',
							key: '',
							secret: '',
						}

						let isGithubOrganization = false;

						if (repository === 'github') isGithubOrganization = await isAnOrganization();
						
						if (repository === 'bitbucket' || isGithubOrganization) opts.owner = await getOwner();
						
						let oauthConfig = await getConfigJSON();

						opts.key = oauthConfig.key;
						opts.secret = oauthConfig.secret;

						init
							.repository(opts)
							.then(() => resolve())
							.catch(async (err) => {

								const restart = await tryAgain();

								if (!restart) return resolve();

								setConfigJSON();

								setTimeout(() => exec(), 1000);

							});

					}

					// Asks the user if he wants to try again if some error happened
					function tryAgain() {

						return new Promise((resolve, reject) => {

							inquirer
								.prompt({
									message: `Do you want to try upload your repository on ${utils.jsUcfirst(repository)} again?` + chalk.gray(' (Y/n)'),
									type: 'input',
									name: 'tryAgain',
									validate: (response) => {

										if (response === '') {
											return false;
										}

										if (response.toLowerCase() !== 'y' && response.toLowerCase() !== 'n') {
											return false;
										}

										return true;

									}
								}).then(answers => {

									const result = answers.tryAgain.toLowerCase() === 'y' ? true : false;

									resolve(result);

								});

						});

					}

					// Asks the user if he wants to change your OAuth key and secret
					function changeKeyAndSecret() {

						return new Promise((resolve, reject) => {

							inquirer
								.prompt({
									message: 'Looks like you already have a key and a secret, do you want to continue with them?' + chalk.gray(' (Y/n)'),
									type: 'input',
									name: 'keepKeyAndSecret',
									validate: (response) => {

										if (response === '') {
											return false;
										}

										if (response.toLowerCase() !== 'y' && response.toLowerCase() !== 'n') {
											return false;
										}

										return true;

									}
								}).then(answers => {

									const result = answers.keepKeyAndSecret.toLowerCase() === 'y' ? true : false;

									resolve(result);

								});

						});

					}

					// Asks the user if he is an organization
					function isAnOrganization() {

						return new Promise((resolve, reject) => {

							inquirer
								.prompt({
									message: 'Your Github profile is an organization?' + chalk.gray(' (Y/n)'),
									type: 'input',
									name: 'organization',
									validate: (response) => {
				
										if (response === '') {
											return false;
										}
				
										if (response.toLowerCase() !== 'y' && response.toLowerCase() !== 'n') {
											return false;
										}
				
										return true;
				
									}
								}).then(answers => {

									const result = answers.organization.toLowerCase() === 'y' ? true : false;

									resolve(result);

								});

						});

					}

					// Asks the user who is the owner of the project
					function getOwner() {

						return new Promise((resolve, reject) => {

							inquirer
								.prompt({
									message: 'Who is the owner (username or organization username) of the project?',
									type: 'input',
									name: 'owner',
									default: 'owinteractive',
									validate: response => response !== ''
								}).then(answers => resolve(answers.owner));

						});

					}

					// Asks the user to get your OAuth key and secret
					function getKeyAndSecret() {

						return new Promise((resolve, reject) => {

							let message;

							if (repository === 'bitbucket') {

								message = commonTags.html `
									To authorize the Bitbucket we need your OAuth Client Key and Client Secret. Follow the steps below:

									1) If you don't have one go to Bitbucket (https://bitbucket.org);
									2) Click on your profile picture;
									3) Click on Bitbucket settings;
									4) Click on OAuth;
									5) Click on Add consumer;
									6) Fill the fields: 

										* Name: frontfy
										* Callback URL: http://localhost:3301/oauth-callback
										* Permissions: Check repositories options write and admin
									
									7) Click on Save to get your key and secret.

									${chalk.gray('PS: After doing this once you will not need to do these steps again.')}
								`;

							} else if (repository === 'github') {

								message = commonTags.html `
									To authorize the Github we need your OAuth Client ID and Client Secret. Follow the steps below:

									1) If you don't have one go to Github (https://github.com);
									2) Click on your profile picture;
									3) Click on Settings;
									4) Click on Developer Settings;
									5) Click on Register a new aplication;
									6) Fill the fields: 

										* Application name: frontfy
										* Homepage URL: http://localhost:3301
										* Authorization callback URL: http://localhost:3301/oauth-callback
									
									7) Click on Register application to get your key and secret.

									${chalk.gray('PS: After doing this once you will not need to do these steps again.')}
								`;

							}

							alerts.warning(message);

							inquirer
								.prompt(
									[{
											message: 'Enter with your Client ID/Key: ',
											type: 'input',
											name: 'key',
											validate: response => response !== ''
										},
										{
											message: 'Enter with your Client Secret: ',
											type: 'input',
											name: 'secret',
											validate: response => response !== ''
										}
									]).then(answers => {

									const {
										key,
										secret
									} = answers;

									setConfigJSON(key, secret);

									return resolve({
										key,
										secret
									});

								});

						});

					}

					// Get the OAuth Key and Secret
					function getConfigJSON() {

						return new Promise(async (resolve, reject) => {

							try {

								let file = fs.readFileSync(`${realRootPath}config.json`);
								let {
									key,
									secret
								} = JSON.parse(file);

								if (!key && !secret) throw new Error("Oops! Key and secret are empty.");

								let keepKeyAndSecret = await changeKeyAndSecret();

								if (!keepKeyAndSecret) throw new Error("Oops! Change key and secret for another one.");

								return resolve({
									key,
									secret
								});

							} catch (err) {

								setConfigJSON();

								let {
									key,
									secret
								} = await getKeyAndSecret();

								return resolve({
									key,
									secret
								});

							}

						});

					}

					// Set the OAuth Key and Secret
					function setConfigJSON(key = "", secret = "") {

						return new Promise(async (resolve, reject) => {

							const file = path.resolve(`${realRootPath}config.json`);
							const fileContent = {
								key,
								secret
							}

							await fileSystem.createFile(file, JSON.stringify(fileContent));

							resolve();

						});

					}

				});

			}

		});

	},

	/**
	 * Question the user about the project initialization
	 */
	questionsAboutInitialization: (name) => {

		return new Promise((resolve, reject) => {

			inquirer
				.prompt({
					message: 'Do you like to run the project?' + chalk.gray(' (Y/n)'),
					type: 'input',
					name: 'run',
					validate: (response) => {

						if (response === '') {
							return false;
						}

						if (response.toLowerCase() !== 'y' && response.toLowerCase() !== 'n') {
							return false;
						}

						return true;

					}
				}).then(answers => {

					if (answers.run.toLowerCase() === 'y') {

						return init.run(name);

					} else {

						alerts.success(`All done! Enter "cd ${name} && npm run build" in the console to start the app`);
						resolve();

					}

				});

		});

	}

}