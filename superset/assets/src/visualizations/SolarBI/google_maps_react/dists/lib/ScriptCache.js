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
        define(['exports', './windowOrGlobal'], factory);
    } else if (typeof exports !== 'undefined') {
        factory(exports, require('./windowOrGlobal'));
    } else {
        const mod = {
            exports: {},
        };
        factory(mod.exports, global.windowOrGlobal);
        global.ScriptCache = mod.exports;
    }
}(this, function (exports, window) {


    Object.defineProperty(exports, '__esModule', {
        value: true,
    });
    let counter = 0;
    const scriptMap = typeof window !== 'undefined' && window._scriptMap || new Map();
    const ScriptCache = exports.ScriptCache = (function (global) {
        global._scriptMap = global._scriptMap || scriptMap;
        return function ScriptCache(scripts) {
            const Cache = {};

            Cache._onLoad = function (key) {
                return function (cb) {
                    let registered = true;

                    function unregister() {
                        registered = false;
                    }

                    const stored = scriptMap.get(key);

                    if (stored) {
                        stored.promise.then(function () {
                            if (registered) {
                                stored.error ? cb(stored.error) : cb(null, stored);
                            }

                            return stored;
                        });
                    } else {
                        // TODO:
                    }

                    return unregister;
                };
            };

            Cache._scriptTag = function (key, src) {
                if (!scriptMap.has(key)) {
                    // Server side rendering environments don't always have
                    // access to the `document` global.
                    // In these cases, we're not going to be able to return
                    // a script tag, so just return null.
                    if (typeof document === 'undefined') return null;

                    const tag = document.createElement('script');
                    const promise = new Promise(function (resolve, reject) {
                        // const resolved = false;
                        // const errored = false;
                        const body = document.getElementsByTagName('body')[0];

                        tag.type = 'text/javascript';
                        tag.async = false; // Load in order

                        const cbName = 'loaderCB' + counter++ + Date.now();
                        let cb = 0;

                        const cleanup = function cleanup() {
                            if (global[cbName] && typeof global[cbName] === 'function') {
                                global[cbName] = null;
                                delete global[cbName];
                            }
                        };

                        const handleResult = function handleResult(state) {
                            return function (evt) {
                                const stored = scriptMap.get(key);
                                if (state === 'loaded') {
                                    stored.resolved = true;
                                    resolve(src);
                                    // stored.handlers.forEach(h => h.call(null, stored))
                                    // stored.handlers = []
                                } else if (state === 'error') {
                                    stored.errored = true;
                                    // stored.handlers.forEach(h => h.call(null, stored))
                                    // stored.handlers = [];
                                    reject(evt);
                                }
                                stored.loaded = true;

                                cleanup();
                            };
                        };

                        tag.onload = handleResult('loaded');
                        tag.onerror = handleResult('error');
                        tag.onreadystatechange = function () {
                            handleResult(tag.readyState);
                        };

                        // Pick off callback, if there is one
                        if (src.match(/callback=CALLBACK_NAME/)) {
                            src = src.replace(/(callback=)[^\&]+/, '$1' + cbName);
                            // src = src.replace(/(callback=)[^]+/, '$1' + cbName);
                            cb = window[cbName] = tag.onload;
                        } else {
                            tag.addEventListener('load', tag.onload);
                        }
                        tag.addEventListener('error', tag.onerror);

                        tag.src = src;
                        body.appendChild(tag);

                        return tag;
                    });
                    const initialState = {
                        loaded: false,
                        error: false,
                        promise,
                        tag,
                    };
                    scriptMap.set(key, initialState);
                }
                return scriptMap.get(key);
            };

            // let scriptTags = document.querySelectorAll('script')
            //
            // NodeList.prototype.filter = Array.prototype.filter;
            // NodeList.prototype.map = Array.prototype.map;
            // const initialScripts = scriptTags
            //   .filter(s => !!s.src)
            //   .map(s => s.src.split('?')[0])
            //   .reduce((memo, script) => {
            //     memo[script] = script;
            //     return memo;
            //   }, {});

            Object.keys(scripts).forEach(function (key) {
                const script = scripts[key];

                const tag = window._scriptMap.has(key) ?
                window._scriptMap.get(key).tag : Cache._scriptTag(key, script);

                Cache[key] = {
                    tag,
                    onLoad: Cache._onLoad(key),
                };
            });

            return Cache;
        };
    }(window));

    exports.default = ScriptCache;
}));
