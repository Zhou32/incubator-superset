import getToastsFromPyFlashMessages from "../../messageToasts/utils/getToastsFromPyFlashMessages";

export default function getInitialState(bootstrapData) {
  return {
    solarBI: {
      ...bootstrapData,
      solarAlert: null,
      solarStatus: "waiting",
      solarStackTrace: null,
      solarUpdateEndTime: null,
      solarUpdateStartTime: 0,
      latestQueryFormData: {},
      queryController: null,
      queryResponse: null,
      triggerQuery: true,
      lastRendered: 0,
      saveModalAlert: null
    },
    messageToasts: getToastsFromPyFlashMessages({}.flash_messages || [])
  };
}
