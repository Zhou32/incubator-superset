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
/* eslint camelcase: 0 */
import { SupersetClient } from '@superset-ui/connection';
import { t } from '@superset-ui/translation';
import URI from 'urijs';
import { logEvent } from '../../logger/actions';
import { Logger, LOG_ACTIONS_LOAD_CHART } from '../../logger/LogUtils';
import getClientErrorObject from '../../utils/getClientErrorObject';
import {
  addSuccessToast as addSuccessToastAction,
  addDangerToast as addDangerToastAction,
  addInfoToast as addInfoToastAction,
} from '../../messageToasts/actions/index';

