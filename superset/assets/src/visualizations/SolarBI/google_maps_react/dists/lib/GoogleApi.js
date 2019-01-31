/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports'], factory);
  } else if (typeof exports !== 'undefined') {
    factory(exports);
  } else {
    const mod = {
      exports: {},
    };
    factory(mod.exports);
    global.GoogleApi = mod.exports;
  }
})(this, function (exports) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true,
  });
  const GoogleApi = exports.GoogleApi = function GoogleApi(opts) {
    opts = opts || {};

    if (!opts.hasOwnProperty('apiKey')) {
      throw new Error('You must pass an apiKey to use GoogleApi');
    }

    const apiKey = opts.apiKey;
    const libraries = opts.libraries || ['places'];
    const client = opts.client;
    const URL = opts.url || 'https://maps.googleapis.com/maps/api/js';

    const googleVersion = opts.version || '3.31';

    // const script = null;
    // const google = typeof window !== 'undefined' && window.google || null;
    // const loading = false;
    const channel = null;
    const language = opts.language;
    const region = opts.region || null;

    // var onLoadEvents = [];

    const url = function url() {
      // const url = URL;
      const params = {
        key: apiKey,
        callback: 'CALLBACK_NAME',
        libraries: libraries.join(','),
        client,
        v: googleVersion,
        channel,
        language,
        region,
      };

      const paramStr = Object.keys(params).filter(function (k) {
        return !!params[k];
      }).map(function (k) {
        return k + '=' + params[k];
      }).join('&');

      return URL + '?' + paramStr;
    };

    return url();
  };

  exports.default = GoogleApi;
});
