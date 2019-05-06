/**
* Imports
*/
const fs = require('fs-extra');
const project = process.cwd();
const alerts = require('../helpers/alerts');
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

			if (fs.existsSync(projectPath)) {

				return alerts.error(`A project with this name already exists in this folder`);

			} else {

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

					cmd.exec(`git clone --depth=1 ${url} . && rm -rf .git`, { cwd: projectPath }, (error, stdout, stderr) => {

						if (error) return reject(new Error('Error on running "git clone". Error: \n', error));
						spinner.succeed('Project downloaded from remote server');

						resolve();

					});

				});

			}

			function createEnvFile() {

				return new Promise(async (resolve, reject) => {

					await fileSystem
						.copy(`${projectPath}/config/.env.example`, `${projectPath}/config/.env`);

					resolve();

				});

			}

			function installDependencies() {

				return new Promise((resolve, reject) => {

					spinner.start('Installing dependencies may take a few minutes...');

					cmd.exec('npm install', { cwd: projectPath }, (error, stdout, stderr) => {

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

			const server = await initializeServer();

			getAuthorization()
				.then(async (authorization) => {

					if (authorization) {

						await createRepository(opts.name, opts.owner, authorization);
						await closeServer();

						resolve();

					} else {

						await closeServer();
						return reject();

					}

				}).catch(async (err) => {
					await closeServer();
					return reject();
				});

			// Initialize Express
			function initializeServer() {

				return new Promise((resolve, reject) => {

					const app = express();

					app.use(cookieParser());
					app.use(express.json());
					app.use(express.urlencoded({ extended: true }));
					app.use(require(path.resolve(`${__dirname}/routes/bitbucket/index.js`)));

					return resolve(app.listen(process.env.PORT));

				});

			};

			// Get OAuth Consumer Authorization
			function getAuthorization() {

				return new Promise((resolve, reject) => {

					spinner.start('Making the authorization on Bitbucket... dont cancel this until is done.');

					setTimeout(() => {

						axios({
							url: `http://localhost:${process.env.PORT}/authorize`,
							method: 'post'
						}).then(() => {

							let countTokenVerification = 0;
							let countTokenVerificationLimit = 10;

							const tokenVerify = setInterval(() => {

								let access_token = process.env.frontfy_bitbucket_access_token;

								if (access_token) {

									if (access_token == "error") {

										clearInterval(tokenVerify);
										spinner.fail('Bitbucket credentials were not authorized');
										resolve(false);

									} else {

										clearInterval(tokenVerify);
										spinner.succeed('Repository authorization granted');
										return resolve(access_token);

									}

								}

								countTokenVerification++;

								if (countTokenVerification === countTokenVerificationLimit) {
									clearInterval(tokenVerify);
									spinner.fail('Bitbucket credentials were not authorized');
									return resolve(false);
								}

							}, 1500);

						}).catch(err => {

							spinner.fail('Bitbucket credentials were not authorized');
							return reject();

						});

					}, 4000);

				});

			}

			// Initialize version control
			function initializeGit() {

				return new Promise((resolve, reject) => {

					const projectPath = `${project}/${opts.name}`;

					cmd.exec('git init', { cwd: projectPath }, (error, stdout, stderr) => {

						if (error) {
							spinner.fail('Error on running "git init"');
							return reject();
						}

						resolve();

					});

				});

			}

			// Create a new repository on Bitbucket and make first commit
			function createRepository(name, owner, authorization) {

				return new Promise(async (resolve, reject) => {

					spinner.start('Starting repository creation on Bitbucket...');

					axios({
						url: `http://localhost:${process.env.PORT}/create-repository`,
						method: 'post',
						data: {
							name,
							owner,
							authorization
						}
					}).then(async (response) => {

						if (response.data.error) {

							const message = response.data.data.error.message;
							spinner.fail(message);

							return reject(response);

						} else {

							const projectPath = `${project}/${name}`;
							const url = `git@bitbucket.org:${owner}/${name}.git`;

							await initializeGit();

							cmd.exec(`git remote add origin ${url}`, { cwd: projectPath }, (error, stdout, stderr) => {
								if (error) {
									spinner.fail('Error on running "git remote add origin <url>"');
									return reject(error);
								}
							});

							cmd.exec(`git add . && git commit -m "Initial commit" && git push -u origin master`, { cwd: projectPath }, (error, stdout, stderr) => {
								if (error) {
									spinner.fail('Error on running "git push origin master".');
									return reject(error);
								}
							});

							spinner.succeed('Repository created');

							return resolve(response);

						}

					}).catch(err => {

						spinner.fail(err);

						return reject(err);

					});

				});

			}

			// Close Express
			function closeServer() {

				return new Promise((resolve, reject) => {

					server.close(() => {
						return resolve();
					});

				})

			}

		});

	},

	/**
	* Create a config file
	*/
	config: (key = "", secret = "") => {

		return new Promise(async (resolve, reject) => {

			const file = path.resolve(`${realRootPath}config.json`);
			const fileContent = {
				key,
				secret
			}

			await fileSystem.createFile(file, JSON.stringify(fileContent));

			resolve();

		});

	},

	/**
	* Run the project
	*/
	server: (name) => {

		return new Promise(async (resolve, reject) => {

			let running = false;

			const projectPath = `${project}/${name}`;
			const spawn = cmd.spawn('npm', ['run', 'build'], { cwd: projectPath });

			spinner.start('Running...');

			spawn.stdout.on('data', (data) => {

				if (data.toString().match('Ready!')) {

					clearTimeout(runningServerTimer);

					runningServerTimer = setTimeout(() => {

						spinner.succeed('Project running! PS: Remember to configurate the .env file in /config and restart the app.');

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