/**
 * Imports
 */
const inquirer = require('inquirer');
const generate = require('../generate/');

module.exports = {

  /**
   * Generate questions
   */
  question: (type = "", name = "") => {

    if (type && name) return generate.init(type, name);

    inquirer
      .prompt(
        [{
            message: "What do you want to generate?",
            type: "list",
            name: "type",
            choices: ["Component", "Directive", "Page"]
          },
          {
            message: 'How would you like to name the file?',
            type: 'input',
            name: 'name',
            validate: response => response !== ''
          }
        ]
      ).then(answers => generate.init(answers.type, answers.name));

  }

}