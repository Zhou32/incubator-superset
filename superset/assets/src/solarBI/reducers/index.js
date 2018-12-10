import { combineReducers } from "redux";

import solarBI from "./solarReducer";
import messageToasts from "../../messageToasts/reducers/index";

export default combineReducers({
  solarBI,
  messageToasts
});
