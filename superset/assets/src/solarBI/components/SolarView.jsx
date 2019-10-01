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
/* eslint camelcase: 0 react/jsx-filename-extension: 0 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import MapView from './MapView';
import ResultView from './ResultView';
import WelcomePage from './WelcomePage';
import DemoPage from './DemoPage';

const propTypes = {
  solarBI: PropTypes.object.isRequired,
  // width: PropTypes.string.isRequired,
};

class SolarView extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { entry } = this.props.solarBI;

    return (
      <div>
        {entry === 'demo' && (
          <div>
            <DemoPage />
          </div>
        )}
        {entry === 'result' && (
          <div>
            <WelcomePage />
          </div>
        )}
        {entry === 'add' && (
          <div>
            <MapView />
          </div>
        )}
      </div>

    );
  }

}

SolarView.propTypes = propTypes;

const mapStateToProps = state => ({
  solarBI: state.solarBI,
});

export default connect(
  mapStateToProps,
  {}
)(SolarView);