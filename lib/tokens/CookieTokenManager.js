// Copyright © 2019 IBM Corp. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
'use strict';

const debug = require('debug')('cloudant:tokens:cookietokenmanager');
const TokenManager = require('./TokenManager');

class CookieTokenManager extends TokenManager {
  constructor(client, jar, sessionUrl, username, password) {
    super(client, jar, sessionUrl);

    this._username = username;
    this._password = password;
  }

  _getToken(callback) {
    debug('Submitting cookie token request.');
    let boundedHandler = this._responseHandler.bind({
      cb: callback
    });
    var req = this._client({
      url: this._sessionUrl,
      method: 'POST',
      json: true,
      body: {
        name: this._username,
        password: this._password
      },
      jar: this._jar
    }, boundedHandler);
    setTimeout(function() {
      debug('Destroying cookie token request');
      req.abort();
    }, 1000);
  }

  _responseHandler(error, response, body) {
    if (error) {
      debug(error);
      this.cb(error);
    } else if (response.statusCode === 200) {
      debug('Successfully renewed session cookie.');
      this.cb(null, response);
    } else {
      let msg = `Failed to get cookie. Status code: ${response.statusCode}`;
      debug(msg);
      this.cb(new Error(msg), response);
    }
  }
}

module.exports = CookieTokenManager;
