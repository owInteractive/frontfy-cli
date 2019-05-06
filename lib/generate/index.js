/**
* Imports
*/
const fs = require('fs-extra');
const project = process.cwd();
const alerts = require('../helpers/alerts');
const contents = require('../helpers/contents');
const fileSystem = require('../helpers/file-system');

module.exports = {

  /**
	* Generate options
  */
  init: (type, name) => {

    switch (type.toLowerCase()) {
      case 'component':
        module.exports.createComponent(name);
        break;
      case 'directive':
        module.exports.createDirective(name);
        break;
      case 'page':
        module.exports.createPage(name);
        break;
      default:
        alerts.error(`The type ${type} doesn't exist. Try a valid option or call --help.`);
        break;
    }

  },

  /**
	* Generate component
  */
  createComponent: (name) => {

    const basePath = `${project}/src/assets/js/components`;
    const extension = '.vue';
    const content = contents.component();
    const path = `${basePath}/${name}${extension}`;

    if (!fs.existsSync(basePath)) {
      return alerts.error(`Generate is not supported in this project because the base path to component doesn't exist.`);
    }

    if (fs.existsSync(path)) {
      return alerts.error(`This component with the name "${name}" already exist in this folder! Try another name.`);
    }

    fileSystem.save(path, content)
      .then(() => {
        alerts.success(`Success! The component was created!`);
      }).catch(err => alerts.error(err));

  },

  /**
	* Generate directive
  */
  createDirective: (name) => {

    const basePath = `${project}/src/assets/js/directives`;
    const extension = '.js';
    const id = module.exports.createIdentifier(name);
    const content = contents.directive(id);
    const path = `${basePath}/${name}${extension}`;

    if (!fs.existsSync(basePath)) {
      return alerts.error(`Generate is not supported in this project because the base path to directive doesn't exist.`);
    }

    if (fs.existsSync(path)) {
      return alerts.error(`This directive with the name "${name}" already exist in this folder! Try another name.`);
    }

    fileSystem.save(path, content)
      .then(() => {
        alerts.success(`Success! The directive was created!`);
      }).catch(err => alerts.error(err));

  },

  /**
	* Generate page
  */
  createPage: (name) => {

    const basePath = `${project}/src/views/site`;
    const extension = '.ejs';
    const id = module.exports.createIdentifier(name);
    const content = contents.page(id);
    const path = `${basePath}/${name}${extension}`;

    if (!fs.existsSync(basePath)) {
      return alerts.error(`Generate is not supported in this project because the base path to page doesn't exist.`);
    }

    if (fs.existsSync(path)) {
      return alerts.error(`This page with the name "${name}" already exist in this folder! Try another name.`);
    }

    function createPageRoute() {

      return new Promise((resolve, reject) => {

        const path = `${project}/app/routes/site/pages.js`;
        const route = contents.route(name);

        if (!fs.existsSync(path)) {
          return reject(new Error(`We could not create a route for this page because an error occurred: ${err}`));
        }

        const data = fs.readFileSync(path).toString().split("module.exports = router;");
        data.splice(data.length, 0, route);

        const text = data.join("");

        fs.writeFile(path, text, (err) => {
          if (err) return reject(new Error(`We could not create a route for this page because an error occurred: ${err}`));
          resolve();
        });

      });

    }

    function createPageStyle() {

      return new Promise((resolve, reject) => {

        const path = `${project}/src/assets/scss/pages`;
        const extension = ".scss";
        const prefix = "_";
        const id = module.exports.createIdentifier(name);
        const fileContent = contents.style(id);

        let styleFilePath;

        if (!fs.existsSync(path)) {
          return reject(new Error(`We could not create a style for this page because an error occurred: ${err}`));
        }

        if (name.match('/')) {

          let nameSplitted = name.split('/');
          let fileName = prefix + nameSplitted.pop();
          let folder;

          folder = nameSplitted.length > 1 ? nameSplitted.join('/') : nameSplitted.join('') + '/';
          styleFilePath = path + '/' + folder + fileName + extension;

        } else {

          styleFilePath = path + '/' + prefix + name + extension;

        }

        fs.open(`${path}/glob${extension}`, 'a', (err, file) => {

          if (err) return reject(new Error(`We could not create a style for this page because an error occurred: ${err}`));

          fs.appendFile(file, `@import "${name}";\n`, 'utf8', (err) => {

            fs.close(file, (err) => {
              if (err) return reject(new Error(`We could not create a style for this page because an error occurred: ${err}`));
            });

            if (err) return reject(new Error(`We could not create a style for this page because an error occurred: ${err}`));

            fileSystem.save(`${styleFilePath}`, fileContent);
            resolve();

          });

        });

      });

    }

    function createPageScript() {

      return new Promise((resolve, reject) => {

        const path = `${project}/src/assets/js/pages/site`;
        const importPath = `${project}/src/assets/js/app.js`;
        const importContent = `\nrequire('./pages/site/${name}').default();`;
        const extension = ".js";
        const id = module.exports.createIdentifier(name);
        const content = contents.script(id);

        if (!fs.existsSync(path) && !fs.existsSync(importPath)) {
          return reject(new Error(`We could not create a script for this page because an error occurred: ${err}`));
        }

        fileSystem.append(importPath, importContent);

        fileSystem
          .save(`${path}/${name}${extension}`, content)
          .catch(err => reject(new Error(`We could not create a script for this page because an error occurred: ${err}`)));

        resolve();

      });

    }

    createPageRoute()
      .then(() => {

        createPageStyle().catch(err => alerts.error(err));
        createPageScript().catch(err => alerts.error(err));

        fileSystem.save(path, content)
          .then(() => {
            alerts.success(`Success! The page was created!`);
          }).catch(err => alerts.error(err));

      })
      .catch(err => alerts.error(err));

  },

  /**
  * Generate identifier to path
  */
  createIdentifier: (path) => {
    return path.replace('/', '-');
  }

}