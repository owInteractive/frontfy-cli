/**
 * Imports
 */
const express = require('express');
const router = express.Router();
const axios = require('axios');
const path = require('path');
const opn = require('open');
const querystring = require('querystring');
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

  opn(`https://bitbucket.org/site/oauth2/authorize?client_id=${key}&response_type=code`);

  return res.end();

});

/**
 * This endpoint processes the temporary code sent by Bitbucket's Authorization Server
 * and exhanges that for an access_token, which can be used to invoke APIs
 */
router.get('/oauth-callback', async (req, res) => {

  const {
    key,
    secret
  } = await config();

  const code = req.query.code;
  const basicAuth = new Buffer(`${key}:${secret}`).toString('base64');

  axios({
    method: 'post',
    url: 'https://bitbucket.org/site/oauth2/access_token',
    headers: {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${basicAuth}`,
    },
    data: querystring.stringify({
      grant_type: 'authorization_code',
      code: `${code}`
    })
  }).then(response => {

    process.env.frontfy_access_token = response.data.access_token;

    res.sendFile(path.resolve(__dirname + '/oauth-callback.html'));

  }).catch(error => {

    process.env.frontfy_access_token = "error";

  });

});

/**
 * This endpoint create a new repository in Bitbucket
 */
router.post('/create-repository', async (req, res) => {

  axios({
    url: `https://api.bitbucket.org/2.0/repositories/${req.body.owner}/${req.body.name}`,
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + req.body.authorization,
      'Content-Type': 'application/json'
    },
    data: {
      "scm": "git",
      "is_private": true,
      "has_issues": false,
      "has_wiki": false,
      "fork_policy": "no_public_forks"
    }
  }).then(response => {

    res.send(response.data);

  }).catch(error => {

    const errorResponse = {
      error: true,
      data: error.response.data
    }

    res.send(errorResponse);

  });

});

module.exports = router;