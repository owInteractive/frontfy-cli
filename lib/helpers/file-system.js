const fs = require('fs-extra');

module.exports = {

  create: (path) => {

    return new Promise((resolve, reject) => {
      fs.mkdirSync(path);
      resolve();
    });

  },

  save: (path, fileContent) => {

    return new Promise((resolve, reject) => {
      fs.outputFile(path, fileContent, err => {
        if (err) return reject(new Error('Error occured when save the file: ', err));
        resolve();
      });
    });

  },

  append: (path, fileContent) => {

    return new Promise((resolve, reject) => {
      fs.appendFile(path, fileContent, err => {
        if (err) return reject(new Error('Error occured when save the file: ', err));
        resolve();
      });
    });

  },

  createFile: (file, fileContent) => {

    return new Promise((resolve, reject) => {
      fs.writeFileSync(file, fileContent, err => {
        if (err) return reject(new Error('Error occured when create the file: ', err));
        resolve();
      });
    });

  },

  copy: (path, newPath) => {

    return new Promise((resolve, reject) => {
      fs.copy(path, newPath, { overwrite: true }, err => {
        if (err) return reject(new Error(`There was an error copying the files: ${err}`));
        resolve();
      });
    });

  },

  rename: (oldPath, newPath) => {

    return new Promise((resolve, reject) => {
      fs.rename(oldPath, newPath, function (err) {
        if (err) return reject(new Error(`There was an error rename the file: ${err}`));
        resolve();
      });
    });

  },

  read: (path) => {

    return new Promise((resolve, reject) => {
      const file = fs.readFileSync(path, function (err) {
        if (err) return reject(new Error(`There was an error read the file: ${err}`));
      });
      resolve(JSON.parse(file));
    });

  }

}