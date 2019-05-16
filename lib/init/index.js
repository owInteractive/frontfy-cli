/**
 * Imports
 */
const fs = require('fs-extra');
const project = process.cwd();
const alerts = require('../helpers/alerts');
const utils = require('../helpers/utils');
const fileSystem = require('../helpers/file-system');
const path = require("path");
const ora = require('ora');
const spinner = ora();
const cmd = require('child_process');
const axios = require('axios');
const express = require('express');
const cookieParser = require('cookie-parser');
const realRootPath = path.join(path.dirname(fs.realpathSync(__filename)), '../../');
const chalk = require('chalk');
const opn = require('open');

let runningServerTimer;

module.exports = {

	/**
	 * Create a new project
	 */
	project: (name, technology) => {

		return new Promise(async (resolve, reject) => {

			const projectPath = `${project}/${name}`;

			exec();

			// Execute the promise
			async function exec() {

				spinner.start('Creating project...');

				fileSystem
					.create(projectPath)
					.then(async () => {

						spinner.succeed('Project created');

						await cloneRepository();
						await createEnvFile();
						await installDependencies();

						resolve();

					}).catch(err => {
						alerts.error(err);
						reject(err);
					});

			}

			// Clone the frontfy repository
			function cloneRepository() {

				return new Promise(async (resolve, reject) => {

					let url;

					switch (technology.toLowerCase()) {
						case 'nodejs':
							url = "https://github.com/owfrontend/frontfy.git";
							break;
						case 'php':
							url = "https://github.com/owfrontend/frontfy-php.git";
							break;
						default:
							alerts.error(`This options doesn't exist. Try a valid option or call --help.`);
							break;
					}

					spinner.start('Cloning frontfy from repository...');

					cmd.exec(`git clone --depth=1 ${url} . && rm -rf .git`, {
						cwd: projectPath
					}, (error, stdout, stderr) => {

						if (error) return reject(new Error('Error on running "git clone". Error: \n', error));
						spinner.succeed('Project downloaded from remote server');

						resolve();

					});

				});

			}

			// Create .env file inside project
			function createEnvFile() {

				return new Promise(async (resolve, reject) => {

					await fileSystem
						.copy(`${projectPath}/config/.env.example`, `${projectPath}/config/.env`);

					resolve();

				});

			}

			// Install the project dependencies
			function installDependencies() {

				return new Promise((resolve, reject) => {

					spinner.start('Installing dependencies may take a few minutes...');

					cmd.exec('npm install', {
						cwd: projectPath
					}, (error, stdout, stderr) => {

						if (error) return reject(new Error('Error on running "npm install". Error: \n', error));
						spinner.succeed('Project dependencies have been installed');

						resolve();

					});

				});

			}

		});

	},

	/**
	 * Create a new repository
	 */
	repository: (opts) => {

		return new Promise(async (resolve, reject) => {

			exec();

			// Execute the promise
			async function exec() {

				const server = await initializeServer();

				createRepository()
					.then(async () => {
						await closeServer(server);
						resolve();
					})
					.catch((async (err) => {
						await closeServer(server);
						return reject();
					}));

			}

			// Initialize express server
			function initializeServer() {

				return new Promise((resolve, reject) => {

					const app = express();

					app.use(cookieParser());
					app.use(express.json());
					app.use(express.urlencoded({
						extended: true
					}));
					app.use(require(path.resolve(`${__dirname}/routes/${opts.repository}/index.js`)));

					return resolve(app.listen(process.env.PORT));

				});

			};

			// Close express server
			function closeServer(server) {

				return new Promise((resolve, reject) => {

					server.close(() => resolve());

				});

			}

			// Create a new repository
			function createRepository() {

				return new Promise(async (resolve, reject) => {

					exec();

					// Execute the promise
					async function exec() {

						getAuthorization()
							.then(async (authorization) => {

								if (authorization) {

									await create();
									resolve();

								} else {

									reject();

								}

							}).catch(err => reject());

					}

					// Get OAuth Consumer Authorization
					function getAuthorization() {

						return new Promise((resolve, reject) => {

							spinner.start(`Making the authorization on ${utils.jsUcfirst(opts.repository)}... Make sure you are signed in to your account.`);

							setTimeout(() => {

								axios({
									url: `http://localhost:${process.env.PORT}/authorize`,
									method: 'post'
								}).then(() => {

									let countTokenVerification = 0;
									let countTokenVerificationLimit = 10;

									const tokenVerify = setInterval(() => {

										let access_token = process.env.frontfy_access_token;

										if (access_token) {

											clearInterval(tokenVerify);

											if (access_token === "error") {

												spinner.fail(`${utils.jsUcfirst(opts.repository)} credentials were not authorized`);
												return resolve();

											} else {

												spinner.succeed(`${utils.jsUcfirst(opts.repository)} authorization granted`);
												return resolve(access_token);

											}

										}

										if (countTokenVerification === countTokenVerificationLimit) {

											clearInterval(tokenVerify);

											spinner.fail(`${utils.jsUcfirst(opts.repository)} credentials were not authorized`);
											return resolve();
										}

										countTokenVerification++;

									}, 2000);

								}).catch(err => {

									spinner.fail(`${utils.jsUcfirst(opts.repository)} credentials were not authorized`);
									return resolve();

								});

							}, 5000);

						});

					}

					// Create a new repository on Github or Bitbucket
					function create() {

						return new Promise(async (resolve, reject) => {

							spinner.start('Starting repository creation...');

							const projectPath = `${project}/${opts.name}`;

							axios({
								url: `http://localhost:${process.env.PORT}/create-repository`,
								method: 'post',
								data: {
									name: opts.name,
									owner: opts.owner
								}
							}).then(async (response) => {

								const data = response.data;

								if (data.error) {

									let message;

									if (opts.repository === 'github') message = `${data.data.message} Error: ${data.data.errors[0].message}.`;
									if (opts.repository === 'bitbucket') message = data.data.error.message;

									spinner.fail(message);

									return reject(data);

								} else {

									let linkToRemoteServer;
									let linkToRepo;

									if (opts.repository === 'github') {
										linkToRemoteServer = data.clone_url;
										linkToRepo = data.html_url;
									}

									if (opts.repository === 'bitbucket') {
										linkToRemoteServer = data.links.clone[0].href;
										linkToRepo = data.links.html.href;
									}

									spinner.succeed('Repository created, link to repository: ' + linkToRepo);

									await syncWithRemoteServer(projectPath, linkToRemoteServer);

									return resolve(data);

								}

							}).catch(err => {
								spinner.fail(err);
								return reject(err);
							});

						});

					}

					// Sync project with remote server
					function syncWithRemoteServer(projectPath, remoteServerUrl) {

						return new Promise(async (resolve, reject) => {

							exec();

							// Execute the promise
							async function exec() {

								await gitInit();
								await gitAddRemoteServer();
								await gitAddFiles();
								await gitCommit();
								await gitPush();

								resolve();

							}

							// Run git init
							function gitInit() {

								return new Promise((resolve, reject) => {

									spinner.succeed('Executing: git init');

									cmd.exec('git init', {
										cwd: projectPath
									}, (error, stdout, stderr) => {

										if (error) {
											spinner.fail('Error on running "git init"');
											return reject();
										}

										return resolve();

									});

								});

							}

							// Run git remote add <url>
							function gitAddRemoteServer() {

								return new Promise((resolve, reject) => {

									spinner.succeed(`Executing: git remote add origin`);

									cmd.exec(`git remote add origin ${remoteServerUrl}`, {
										cwd: projectPath
									}, (error, stdout, stderr) => {

										if (error) {

											spinner.fail('Error on running "git remote add origin". Do it manually!');
											return reject(error);

										}

										return resolve();

									});

								});

							}

							// Run git add .
							function gitAddFiles() {

								return new Promise((resolve, reject) => {

									spinner.succeed('Executing: git add .');

									cmd.exec(`git add .`, {
										cwd: projectPath
									}, (error, stdout, stderr) => {

										if (error) {
											spinner.fail('Error on running "git push origin master". Do it manually!');
											return reject(error);
										}

										return resolve();

									});

								});

							}

							// Run git commit
							function gitCommit() {

								return new Promise((resolve, reject) => {

									spinner.succeed('Executing: git commit -m "Initial commit"');

									cmd.exec(`git commit -m "Initial commit"`, {
										cwd: projectPath
									}, (error, stdout, stderr) => {

										if (error) {
											spinner.fail('Error on running "git push origin master". Do it manually!');
											return reject(error);
										}

										return resolve();

									});

								});

							}

							// Run git push origin master
							function gitPush() {

								return new Promise((resolve, reject) => {

									spinner.succeed('Executing: git push -u origin master');

									cmd.exec(`git push -u origin master`, {
										cwd: projectPath
									}, (error, stdout, stderr) => {

										if (error) {
											spinner.fail('Error on running "git push origin master". Do it manually!');
											return reject(error);
										}

										return resolve();

									});

								});

							}

						});

					}

				});

			}

		});

	},

	/**
	 * Run the project
	 */
	run: (name) => {

		return new Promise(async (resolve, reject) => {

			let running = false;

			const projectPath = `${project}/${name}`;
			const spawn = cmd.spawn('npm', ['run', 'build'], {
				cwd: projectPath
			});

			spinner.start('Running...');

			spawn.stdout.on('data', (data) => {

				if (data.toString().match('Ready!')) {

					clearTimeout(runningServerTimer);

					runningServerTimer = setTimeout(() => {

						spinner.succeed('Running... Remember to configurate the .env file in /config and restart the app.');

						console.log(chalk.green(data.toString().trim()));

						if (!running) {
							running = true;
							opn('http://localhost:' + process.env.PORT);
						}

					}, 5000);

				}

			});

			resolve();

		});

	}

}