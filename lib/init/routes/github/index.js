/**
 * Imports
 */
const express = require('express');
const router = express.Router();
const axios = require('axios');
const path = require('path');
const opn = require('open');
const fs = require('fs-extra');
const realRootPath = path.join(path.dirname(fs.realpathSync(__filename)), '../../../../');

/**
 * Read the config.json
 */
const config = () => {

  return new Promise((resolve, reject) => {

    const file = fs.readFileSync(`${realRootPath}config.json`);

    return resolve(JSON.parse(file));

  });

}

/*
 * This endpoint that authorizes the app for access to the end-user data
 */
router.post('/authorize', async (req, res) => {

  const {
    key
  } = await config();

  opn(`https://github.com/login/oauth/authorize?client_id=${key}&scope=repo`);

  return res.end();

});

/**
 * This endpoint processes the temporary code sent by Github's Authorization Server
 * and exhanges that for an access_token, which can be used to invoke APIs
 */
router.get('/oauth-callback', async (req, res) => {

  const {
    key,
    secret
  } = await config();

  axios({
    method: 'post',
    url: 'https://github.com/login/oauth/access_token',
    headers: {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    data: {
      "client_id": key,
      "client_secret": secret,
      "code": req.query.code,
      "redirect_uri": 'http://localhost:3301/oauth-callback'
    }
  }).then(response => {

    process.env.frontfy_access_token = response.data.access_token;

    res.sendFile(path.resolve(__dirname + '/oauth-callback.html'));

  }).catch(error => {

    process.env.frontfy_access_token = "error";

  });

});

/**
 * This endpoint create a new repository in Github
 */
router.post('/create-repository', async (req, res) => {

  axios({
    url: 'https://github.com/user/repos',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + req.body.authorization,
      'Content-Type': 'application/json'
    },
    data: {
      "name": req.body.name
    }
  }).then(response => {

    res.send(response.data);

  }).catch(error => {

    const response = {
      error: true,
      data: error.response.data
    }

    res.send(response);

  });

});

module.exports = router;