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
// import { t } from '@superset-ui/translation';
// import { now } from '../../modules/dates';
import * as actions from '../actions/billingActions';

export default function (state = {}, action) {
  const actionHandlers = {
    [actions.CHANG_PLAN_STARTED]() {
      return {
        ...state,
        plan_change: 'changing',
      };
    },
    [actions.CHANGE_PLAN_SUCCEEDED]() {
      return {
        ...state,
        plan_change: 'success',
        plan_id: action.res.plan_id,
        pm_id: action.res.pm_id,
      };
    },
    [actions.CHANGE_PLAN_FAILED]() {
      return {
        ...state,
        plan_change: 'fail',
      };
    },
    [actions.CHANGE_BILLING_DETAIL_STARTED]() {
      return {
        ...state,
        detail_change: 'changing',
      };
    },
    [actions.CHANGE_BILLING_DETAIL_SUCCESSDED]() {
      return {
        ...state,
        detail_change: 'success',
      };
    },
    [actions.CHANGE_BILLING_DETAIL_FAILED]() {
      return {
        ...state,
        detail_change: 'fail',
      };
    },
  };

  if (action.type in actionHandlers) {
    return actionHandlers[action.type]();
  }

  return state;
}
