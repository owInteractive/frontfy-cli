#!/usr/bin/env node
'use strict';

/**
* Imports
*/
const commander = require('commander');
const init = require('./lib/questions/init');
const generate = require('./lib/questions/generate');

/**
* Server port
*/
process.env.PORT = 3301;

/**
* Commander version and description
*/
commander
	.version('1.0.0')
	.description('FRONTFY - Command-line interface');

/**
* Commander init method
*/
commander
	.command('init')
	.alias('i')
	.description('init a new project')
	.action(async () => {

		// Questions about project 
		const { name } = await init.questionsAboutProject();

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
	.description('generate page or component (only for projects in NodeJS')
	.action((type, name) => generate.question(type, name));

/**
* Commander launch
*/
commander.parse(process.argv);