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
import { SupersetClient } from "@superset-ui/connection";
import { Logger, LOG_ACTIONS_LOAD_CHART } from "../../logger";
import getClientErrorObject from "../../utils/getClientErrorObject";
import {
  getExploreUrlAndPayload,
  getURIDirectory
} from "../../explore/exploreUtils";
import {
  saveSliceFailed,
  saveSliceSuccess
} from "../../explore/actions/saveModalActions";
import {
  addSuccessToast as addSuccessToastAction,
  addDangerToast as addDangerToastAction,
  addInfoToast as addInfoToastAction
} from "../../messageToasts/actions/index";
import { t } from "@superset-ui/translation";
import URI from "urijs";

export const SOLAR_UPDATE_STARTED = "SOLAR_UPDATE_STARTED";
export function solarUpdateStarted(queryController, latestQueryFormData, key) {
  return {
    type: SOLAR_UPDATE_STARTED,
    queryController,
    latestQueryFormData,
    key
  };
}

export const addInfoToast = addInfoToastAction;
export const addSuccessToast = addSuccessToastAction;
export const addDangerToast = addDangerToastAction;

export const SOLAR_UPDATE_SUCCEEDED = "SOLAR_UPDATE_SUCCEEDED";
export function solarUpdateSucceeded(queryResponse, key) {
  return { type: SOLAR_UPDATE_SUCCEEDED, queryResponse, key };
}

export const SOLAR_UPDATE_TIMEOUT = "SOLAR_UPDATE_TIMEOUT";
export function solarUpdateTimeout(statusText, timeout, key) {
  return { type: SOLAR_UPDATE_TIMEOUT, statusText, timeout, key };
}

export const SOLAR_UPDATE_STOPPED = "SOLAR_UPDATE_STOPPED";
export function solarUpdateStopped(key) {
  return { type: SOLAR_UPDATE_STOPPED, key };
}

export const SOLAR_UPDATE_FAILED = "SOLAR_UPDATE_FAILED";
export function solarUpdateFailed(queryResponse, key) {
  return { type: SOLAR_UPDATE_FAILED, queryResponse, key };
}

export const FETCH_SOLAR_DATA = "FETCH_SOLAR_DATA";
export function fetchSolarData(formData, force = false, timeout = 60, key) {
  return dispatch => {
    const url = "/superset/explore_json/"+formData['datasource_type']+'/'+formData['datasource_id']+"/";
    const logStart = Logger.getTimestamp();
    const controller = new AbortController();
    const { signal } = controller;
    dispatch(solarUpdateStarted(controller, formData, key));

    return SupersetClient.post({
      url,
      postPayload: { form_data: formData },
      signal,
      timeout: timeout * 1000
    })
      .then(({ json }) => {
        Logger.append(LOG_ACTIONS_LOAD_CHART, {
          slice_id: key,
          is_cached: json.is_cached,
          force_refresh: force,
          row_count: json.rowcount,
          datasource: formData.datasource,
          start_offset: logStart,
          duration: Logger.getTimestamp() - logStart,
          has_extra_filters:
            formData.extra_filters && formData.extra_filters.length > 0,
          viz_type: formData.viz_type
        });
        dispatch(addSuccessToastAction(t("Successfully fetch data")));
        return dispatch(solarUpdateSucceeded(json, key));
      })
      .catch(response => {
        const appendErrorLog = errorDetails => {
          Logger.append(LOG_ACTIONS_LOAD_CHART, {
            slice_id: key,
            has_err: true,
            error_details: errorDetails,
            datasource: formData.datasource,
            start_offset: logStart,
            duration: Logger.getTimestamp() - logStart
          });
        };

        if (response.statusText === "timeout") {
          appendErrorLog("timeout");
          dispatch(addDangerToast(t("Fetching timeout!")));
          return dispatch(
            solarUpdateTimeout(response.statusText, timeout, key)
          );
        } else if (response.name === "AbortError") {
          appendErrorLog("abort");
          dispatch(addDangerToast(t("Fetching abort!")));
          return dispatch(solarUpdateStopped(key));
        }
        return getClientErrorObject(response).then(parsedResponse => {
          appendErrorLog(parsedResponse.error);
          dispatch(addDangerToast(t("Fetching failed!")));
          return dispatch(solarUpdateFailed(parsedResponse, key));
        });
      });
  };
}

export const SAVE_SOLAR_DATA_SUCCESS = "SAVE_SOLAR_DATA_SUCCESS";
export function saveSolarDataSuccess(data) {
  return { type: SAVE_SOLAR_DATA_SUCCESS, data };
}

export const SAVE_SOLAR_DATA_FAILED = "SAVE_SOLAR_DATA_FAILED";
export function saveSolarDataFailed() {
  return { type: SAVE_SOLAR_DATA_FAILED };
}

export function saveSolarData(formData, requestParams) {
  return dispatch => {
    const directory = "/superset/solar/";
    const payload = {
      ...formData,
      endpointType: "base",
      requestParams
    };

    let uri = new URI([location.protocol, "//", location.host].join(""));
    const search = uri.search(true);
    const paramNames = Object.keys(requestParams);
    if (paramNames.length) {
      paramNames.forEach(name => {
        if (requestParams.hasOwnProperty(name)) {
          search[name] = requestParams[name];
        }
      });
    }
    uri = uri.search(search).directory(directory);

    return SupersetClient.post({
      url: uri.toString(),
      postPayload: { form_data: payload }
    })
      .then(({ json }) => dispatch(saveSolarDataSuccess(json)))
      .catch(() => dispatch(saveSolarDataFailed()));
  };
}
