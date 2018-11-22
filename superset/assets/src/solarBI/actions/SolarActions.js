/* eslint camelcase: 0 */
import {SupersetClient} from '@superset-ui/connection';

import {Logger, LOG_ACTIONS_LOAD_CHART} from '../../logger';

export default function fetchSolarData(formData, force = false, timeout = 60, key, callback) {
    var url = '/superset/explore_json/';

    const logStart = Logger.getTimestamp();
    const controller = new AbortController();
    const {signal} = controller;

    SupersetClient.post({
        url,
        postPayload: {form_data: formData},
        signal,
        timeout: timeout * 1000,
    })
        .then(({json}) => {
            Logger.append(LOG_ACTIONS_LOAD_CHART, {
                slice_id: key,
                is_cached: json.is_cached,
                force_refresh: force,
                row_count: json.rowcount,
                datasource: formData.datasource,
                start_offset: logStart,
                duration: Logger.getTimestamp() - logStart,
                has_extra_filters: formData.extra_filters && formData.extra_filters.length > 0,
                viz_type: formData.viz_type,
            });
            callback({status: 'success',data:json});
        })
        .catch((response) => {
            const appendErrorLog = (errorDetails) => {
                Logger.append(LOG_ACTIONS_LOAD_CHART, {
                    slice_id: key,
                    has_err: true,
                    error_details: errorDetails,
                    datasource: formData.datasource,
                    start_offset: logStart,
                    duration: Logger.getTimestamp() - logStart,
                });
            };

            if (response.statusText === 'timeout') {
                appendErrorLog('timeout');
                callback({status: 'timeout'});
            } else if (response.name === 'AbortError') {
                appendErrorLog('abort');
                callback({status: 'abort'});
            }
            callback({status: 'failed'});
        });
}