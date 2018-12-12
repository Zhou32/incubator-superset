import { t } from "@superset-ui/translation";
import { now } from "../../modules/dates";
import * as actions from "../actions/solarActions";

export default function(state = {}, action) {
  const actionHandlers = {
    [actions.SOLAR_UPDATE_STARTED]() {
      return {
        ...state,
        solarStatus: "loading",
        solarStackTrace: null,
        solarAlert: null,
        solarUpdateEndTime: null,
        solarUpdateStartTime: now(),
        queryController: action.queryController
      };
    },
    [actions.SOLAR_UPDATE_SUCCEEDED]() {
      return {
        ...state,
        solarStatus: "success",
        queryResponse: action.queryResponse,
        chartUpdateEndTime: now()
      };
    },
    [actions.SOLAR_UPDATE_TIMEOUT]() {
      return {
        ...state,
        solarStatus: "failed",
        solarAlert:
          `${t("Query timeout")} - ` +
          t(
            `visualization queries are set to timeout at ${
              action.timeout
            } seconds. `
          ) +
          t(
            "Perhaps your data has grown, your database is under unusual load, " +
              "or you are simply querying a data source that is too large " +
              "to be processed within the timeout range. " +
              "If that is the case, we recommend that you summarize your data further."
          ),
        solarUpdateEndTime: now()
      };
    },
    [actions.SOLAR_UPDATE_STOPPED]() {
      return {
        ...state,
        solarStatus: "stopped",
        solarAlert: t("Updating solar was stopped"),
        solarUpdateEndTime: now()
      };
    },
    [actions.SOLAR_UPDATE_FAILED]() {
      return {
        ...state,
        solarStatus: "failed",
        solarAlert: action.queryResponse
          ? action.queryResponse.error
          : t("Nextwork error"),
        solarUpdateEndTime: now(),
        queryResponse: actions.queryResponse,
        solarStackTrace: action.queryResponse
          ? action.queryResponse.stacktrace
          : null
      };
    },
    [actions.SAVE_SOLAR_DATA_SUCCESS](data) {
      return {
        ...state,
        data
      };
    },
    [actions.SAVE_SOLAR_DATA_FAILED]() {
      return {
        ...state,
        saveModalAlert: "Failed to save slice"
      };
    }
  };

  if (action.type in actionHandlers) {
    return actionHandlers[action.type]();
  }

  return state;
}
