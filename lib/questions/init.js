/**
* Imports
*/
const inquirer = require('inquirer');
const init = require('../init');
const alerts = require('../helpers/alerts');
const fs = require('fs-extra');
const path = require('path');
const realRootPath = path.join(path.dirname(fs.realpathSync(__filename)), '../../');
const chalk = require("chalk");
const commonTags = require('common-tags');

module.exports = {

	/**
	* Question the user about the new project
	*/
	questionsAboutProject: () => {

		return new Promise((resolve, reject) => {

			inquirer
				.prompt(
					[{
						message: 'How would you like to name the project?',
						type: 'input',
						name: 'name',
						filter: name => name ? `front.${name}.com.br` : '',
						validate: (name) => name !== ''
					}, {
						message: 'What technology do you want to use?',
						type: 'list',
						name: 'technology',
						choices: ['NodeJS', 'PHP']
					}]
				).then(async (answers) => {

					let { name, technology } = answers;

					// This function will create the folder, download the repository and install the dependencies
					await init.project(name, technology);

					return resolve({
						name,
						technology
					});

				});

		});

	},

	/**
	* Question the user about the repository
	*/
	questionsAboutRepository: (name) => {

		return new Promise(async (resolve, reject) => {

			const acceptsNewRepository = () => {

				return new Promise((resolve, reject) => {

					inquirer
						.prompt({
							message: 'Do you like to create a repository in Bitbucket?' + chalk.gray(' (Y/n)'),
							type: 'input',
							name: 'create'
						}).then(async (response) => {

							const result = response.create.toLowerCase() === 'y' ? true : false;

							resolve(result);

						});

				});

			}

			const initializeRepository = () => {

				return new Promise(async (resolve, reject) => {

					async function createRepository() {

						let { owner } = await getOwner();
						let { key, secret } = await getConfiguration();

						if (key && secret) {

							let keepKeyAndSecret = await changeKeyAndSecret();

							if (!keepKeyAndSecret) {

								let response = await getKeyAndSecret();

								key = response.key;
								secret = response.secret;

							}

						} else {

							let response = await getKeyAndSecret();

							key = response.key;
							secret = response.secret;

						}

						let opts = {
							name,
							owner,
							key,
							secret
						}

						init
							.repository(opts)
							.then(() => {
								resolve();
							})
							.catch(async (err) => {

								const restart = await tryAgain();

								if (restart) {

									init.config();

									setTimeout(() => {
										createRepository();
									}, 1000);
									
								} else {

									resolve();

								}

							});

					}

					createRepository();

				});

			}

			const tryAgain = () => {

				return new Promise((resolve, reject) => {

					inquirer
						.prompt({
							message: 'Do you want to try authenticate in Bitbucket again?' + chalk.gray(' (Y/n)'),
							type: 'input',
							name: 'try_again'
						}).then(response => {

							const result = response.try_again.toLowerCase() === 'y' ? true : false;

							resolve(result);

						});

				});

			}

			const changeKeyAndSecret = () => {

				return new Promise((resolve, reject) => {

					inquirer
						.prompt({
							message: 'Looks like you already have a key and a secret, do you want to continue with them?' + chalk.gray(' (Y/n)'),
							type: 'input',
							name: 'continue'
						}).then(response => {

							const result = response.continue.toLowerCase() === 'y' ? true : false;

							resolve(result);

						});

				});

			}

			const getOwner = () => {

				return new Promise((resolve, reject) => {

					inquirer
						.prompt({
							message: 'Who is the owner of the project?',
							type: 'input',
							name: 'owner',
							default: 'owinteractive',
							validate: owner => owner !== ''
						}).then(answers => {

							resolve(answers);

						});

				});

			}

			const getKeyAndSecret = () => {

				return new Promise((resolve, reject) => {

					const message = commonTags.html`
						To authorize the Bitbucket we need your OAuth Key/Secret. 
						If you don't have one go to Bitbucket -> Settings -> OAuth -> OAuth Consumers -> Add consumer.
						Inside the page set: name, callback URL to: http://localhost:3301/oauth-callback and 
						give permission to Repositories (Write and Admin). Save and go ahead!
					`

					alerts.warning(message);

					inquirer
						.prompt(
							[{
								message: 'Enter with your key: ',
								type: 'input',
								name: 'key',
								validate: key => key !== ''
							},
							{
								message: 'Enter with your secret: ',
								type: 'input',
								name: 'secret',
								validate: secret => secret !== ''
							}]).then(answers => {

								const { key, secret } = answers;

								init.config(key, secret);

								return resolve({ key, secret })

							});

				});

			}

			const getConfiguration = () => {

				return new Promise((resolve, reject) => {

					try {

						const file = fs.readFileSync(`${realRootPath}config.json`);

						return resolve(JSON.parse(file));

					} catch (err) {

						init.config();

						return resolve({
							key: "",
							secret: ""
						});

					}

				});

			}

			const accepted = await acceptsNewRepository();

			if (accepted) {
				await initializeRepository();
				resolve();
			} else {
				resolve();
			}

		});

	},

	/**
	* Question the user about the project initialization
	*/
	questionsAboutInitialization: (project) => {

		return new Promise((resolve, reject) => {

			inquirer
				.prompt({
					message: 'Do you like to run the project?' + chalk.gray(' (Y/n)'),
					type: 'input',
					name: 'run'
				}).then(answer => {

					if (answer.run.toLowerCase() === 'y') {

						return init.server(project);

					} else {

						alerts.success(`All done! Enter "cd ${project} && npm run build" in the console to start the app. PS: Remember to configurate the .env file in /config.`);
						resolve();

					}

				});

		});

	}

}