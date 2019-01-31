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
    define(['exports', 'react', 'react-dom', './lib/ScriptCache', './lib/GoogleApi'], factory);
  } else if (typeof exports !== 'undefined') {
    factory(exports, require('react'), require('react-dom'), require('./lib/ScriptCache'), require('./lib/GoogleApi'));
  } else {
    const mod = {
      exports: {},
    };
    factory(mod.exports, global.react, global.reactDom, global.ScriptCache, global.GoogleApi);
    global.GoogleApiComponent = mod.exports;
  }
}(this, function (exports, _react, _reactDom, _ScriptCache, _GoogleApi) {


  Object.defineProperty(exports, '__esModule', {
    value: true,
  });
  exports.wrapper = undefined;

  const _react2 = _interopRequireDefault(_react);

  const _reactDom2 = _interopRequireDefault(_reactDom);

  const _GoogleApi2 = _interopRequireDefault(_GoogleApi);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj,
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError('Cannot call a class as a function');
    }
  }

  const _createClass = (function () {
    function defineProperties(target, props) {
      for (let i = 0; i < props.length; i++) {
        const descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ('value' in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }());

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === 'object' || typeof call === 'function') ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
      throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true,
      },
    });
    if (superClass) {
      Object.setPrototypeOf ?
      Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}
  }

  // const defaultMapConfig = {};

  const serialize = function serialize(obj) {
    return JSON.stringify(obj);
  };
  const isSame = function isSame(obj1, obj2) {
    return obj1 === obj2 || serialize(obj1) === serialize(obj2);
  };

  const defaultCreateCache = function defaultCreateCache(options) {
    options = options || {};
    const apiKey = options.apiKey;
    const libraries = options.libraries || ['places'];
    const version = options.version || '3';
    const language = options.language || 'en';
    const url = options.url;
    const client = options.client;
    const region = options.region;

    return (0, _ScriptCache.ScriptCache)({
      google: (0, _GoogleApi2.default)({
        apiKey,
        language,
        libraries,
        version,
        url,
        client,
        region,
      }),
    });
  };

  const DefaultLoadingContainer = function DefaultLoadingContainer() {
    return _react2.default.createElement(
      'div',
      null,
      'Loading...',
    );
  };

  const wrapper = exports.wrapper = function wrapper(input) {
    return function (WrappedComponent) {
      const Wrapper = (function (_React$Component) {
        _inherits(Wrapper, _React$Component);

        function Wrapper(props, context) {
          _classCallCheck(this, Wrapper);

          // Build options from input
          const _this = _possibleConstructorReturn(this, (Wrapper.__proto__ ||
            Object.getPrototypeOf(Wrapper)).call(this, props, context));

          const options = typeof input === 'function' ? input(props) : input;

          // Initialize required Google scripts and other configured options
          _this.initialize(options);

          _this.state = {
            loaded: false,
            map: null,
            google: null,
            options,
          };
          return _this;
        }

        _createClass(Wrapper, [{
          key: 'componentWillReceiveProps',
          value: function componentWillReceiveProps(props) {
            // Do not update input if it's not dynamic
            if (typeof input !== 'function') {
              return;
            }

            // Get options to compare
            const prevOptions = this.state.options;
            const options = typeof input === 'function' ? input(props) : input;

            // Ignore when options are not changed
            if (isSame(options, prevOptions)) {
              return;
            }

            // Initialize with new options
            this.initialize(options);

            // Save new options in component state,
            // and remove information about previous API handlers
            this.setState({
              options,
              loaded: false,
              google: null,
            });
          },
        }, {
          key: 'initialize',
          value: function initialize(options) {
            // Avoid race condition: remove previous 'load' listener
            if (this.unregisterLoadHandler) {
              this.unregisterLoadHandler();
              this.unregisterLoadHandler = null;
            }

            // Load cache factory
            const createCache = options.createCache || defaultCreateCache;

            // Build script
            this.scriptCache = createCache(options);
            this.unregisterLoadHandler = this.scriptCache.google.onLoad(this.onLoad.bind(this));

            // Store information about loading container
            this.LoadingContainer = options.LoadingContainer || DefaultLoadingContainer;
          },
        }, {
          key: 'onLoad',
          value: function onLoad() {
            this._gapi = window.google;

            this.setState({ loaded: true, google: this._gapi });
          },
        }, {
          key: 'render',
          value: function render() {
            const LoadingContainer = this.LoadingContainer;

            if (!this.state.loaded) {
              return _react2.default.createElement(LoadingContainer, null);
            }

            const props = Object.assign({}, this.props, {
              loaded: this.state.loaded,
              google: window.google,
            });

            return _react2.default.createElement(
              'div',
              null,
              _react2.default.createElement(WrappedComponent, props),
              _react2.default.createElement('div', { ref: 'map' }),
            );
          },
        }]);

        return Wrapper;
      }(_react2.default.Component));

      return Wrapper;
    };
  };

  exports.default = wrapper;
}));
