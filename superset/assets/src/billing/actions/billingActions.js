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
// import URI from 'urijs';
// import { logEvent } from '../../logger/actions';
// import { Logger, LOG_ACTIONS_LOAD_CHART } from '../../logger/LogUtils';
// import getClientErrorObject from '../../utils/getClientErrorObject';
import {
  addSuccessToast as addSuccessToastAction,
  addDangerToast as addDangerToastAction,
  addInfoToast as addInfoToastAction,
} from '../../messageToasts/actions/index';

export const addInfoToast = addInfoToastAction;
export const addSuccessToast = addSuccessToastAction;
export const addDangerToast = addDangerToastAction;

export const CHANG_PLAN_STARTED = 'CHANG_PLAN_STARTED';
export function changePlanStarted() {
  return { type: CHANG_PLAN_STARTED };
}

export const CHANGE_PLAN_SUCCEEDED = 'CHANGE_PLAN_SUCCEEDED';
export function changePlanSucceeded(res) {
  return { type: CHANGE_PLAN_SUCCEEDED, res };
}

export const CHANGE_PLAN_FAILED = 'CHANGE_PLAN_FAILED';
export function changePlanFailed() {
  return { type: CHANGE_PLAN_FAILED };
}

export function changePlan(planId, payload, timeout = 60) {
  return (dispatch) => {
    const url = '/billing/change_plan/' + planId + '/';
    const controller = new AbortController();
    const { signal } = controller;
    dispatch(changePlanStarted());

    return SupersetClient.post({
      url,
      postPayload: { form_data: payload },
      signal,
      timeout: timeout * 1000,
    })
      .then(({ json }) => {
        dispatch(changePlanSucceeded(json));
        dispatch(addSuccessToast(t(json.msg)));
      })
      .catch(() => {
        dispatch(changePlanFailed());
        dispatch(addDangerToast(t('Change plan failed.')));
      });
  };
}


export const CHANGE_BILLING_DETAIL_STARTED = 'CHANGE_BILLING_DETAIL_STARTED';
export function changeBillingDetailStarted() {
  return { type: CHANGE_BILLING_DETAIL_STARTED };
}

export const CHANGE_BILLING_DETAIL_SUCCEDED = 'CHANGE_BILLING_DETAIL_SUCCEDED';
export function changeBillingDetailSuccedded(res) {
  return { type: CHANGE_BILLING_DETAIL_SUCCEDED, res };
}

export const CHANGE_BILLING_DETAIL_FAILED = 'CHANGE_BILLING_DETAIL_FAILED';
export function changeBillingDetailFailed() {
  return { type: CHANGE_BILLING_DETAIL_FAILED };
}


export function changeBillDetail(cus_id, payload, timeout = 60) {
  return async (dispatch) => {
    const url = '/billing/change_billing_detail/' + cus_id + '/';
    const controller = new AbortController();
    const { signal } = controller;
    dispatch(changeBillingDetailStarted());

    try {
      const { json } = await SupersetClient.post({
        url,
        postPayload: { form_data: payload },
        signal,
        timeout: timeout * 1000,
      });
      dispatch(changeBillingDetailSuccedded(json));
      dispatch(addSuccessToast(t(json.msg)));
    } catch (e) {
      dispatch(changeBillingDetailFailed());
      dispatch(addDangerToast(t('Update details failed.')));
    }
  };
}


export const CHANGE_CREDIT_CARD_START = 'CHANGE_CREDIT_CARD_START';
export function changeCreditCardStart() {
  return { type: CHANGE_CREDIT_CARD_START };
}

export const CHANGE_CREDIT_CARD_SUCCESS = 'CHANGE_CREDIT_CARD_SUCCESS';
export function changeCreditCardSuccess(res) {
  return { type: CHANGE_CREDIT_CARD_SUCCESS, res };
}

export const CHANGE_CREDIT_CARD_FAIL = 'CHANGE_CREDIT_CARD_FAIL';
export function changeCreditCardFail() {
  return { type: CHANGE_CREDIT_CARD_FAIL };
}
