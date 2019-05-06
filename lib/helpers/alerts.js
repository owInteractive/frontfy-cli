const chalk = require('chalk');
const logSymbols = require('log-symbols');

module.exports = {

  error: message => console.log(logSymbols.error, chalk.red(message)),

  success: message => console.log(logSymbols.success, chalk.green(message)),

  info: message => console.log(logSymbols.info, chalk.gray(message)),

  warning: message => console.log(logSymbols.warning, chalk.yellow(message))

}