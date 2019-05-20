#!/usr/bin/env node

'use strict';

/**
 * Imports
 */
const commander = require('commander');
const init = require('./lib/questions/init');
const generate = require('./lib/questions/generate');
const cmd = require('child_process');

/**
 * Server port
 */
process.env.PORT = 3301;

/**
 * Commander version and description
 */
commander
	.version('1.0.0')
	.description('Command-line interface to init a new Frontfy Project and more!')
	.usage('[command]');

/**
 * Commander init method
 */
commander
	.command('init')
	.alias('i')
	.description('Init a new Frontfy Project')
	.action(async () => {

		// Questions about project 
		const {
			name
		} = await init.questionsAboutProject();

		// Questions about repository
		await init.questionsAboutRepository(name);

		// Questions about initialization
		await init.questionsAboutInitialization(name);

	});

/**
 * Commander generate method
 */
commander
	.command('generate [type] [name]')
	.alias('g')
	.description('Generate page, components or directives')
	.action((type, name) => generate.question(type, name));

/**
 * Commander method doesn't exist
 */
commander
	.command('*')
	.action((args) => {

		console.log(`The '${args}' method does not exist in this application. See the command --help below: \n`);

		cmd.exec('frontfy -h', (error, stdout, stderr) => console.log(stdout));

	});

/**
 * Commander launcher
 */
commander.parse(process.argv);