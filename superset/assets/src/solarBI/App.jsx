import React from 'react';
import { hot } from 'react-hot-loader';
import thunk from 'redux-thunk';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import { initFeatureFlags } from 'src/featureFlags';
import MapView from './components/MapView';
import ToastPresenter from '../messageToasts/containers/ToastPresenter';
import { initEnhancer } from '../reduxUtils';
import getInitialState from './reducers/getInitialState';
import rootReducer from './reducers/index';

import setupApp from '../setup/setupApp';
import setupPlugins from '../setup/setupPlugins';

setupApp();
setupPlugins();

const container = document.getElementById('app');
const bootstrapData = JSON.parse(container.getAttribute('data-bootstrap'));
initFeatureFlags(bootstrapData.common.feature_flags);
const initState = getInitialState(bootstrapData);

const store = createStore(
  rootReducer,
  initState,
  compose(
    applyMiddleware(thunk),
    initEnhancer(false),
  ),
);

const App = () => (
  <Provider store={store}>
    <div>
      <MapView />
      <ToastPresenter />
    </div>
  </Provider>
);

export default hot(module)(App);
