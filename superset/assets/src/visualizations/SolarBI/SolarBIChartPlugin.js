import { t } from "@superset-ui/translation";
// import ChartPlugin from '../core/models/ChartPlugin';
// import ChartMetadata from '../core/models/ChartMetadata';
import { ChartMetadata, ChartPlugin } from "@superset-ui/chart";
import transformProps from "./transformProps";
import thumbnail from "./images/thumbnail.png";

const metadata = new ChartMetadata({
  name: t("Solar Business Intelligence"),
  description: "",
  credits: [""],
  thumbnail
});

export default class SolarBIChartPlugin extends ChartPlugin {
  constructor() {
    super({
      metadata,
      transformProps,
      loadChart: () => import("./SolarBI")
    });
  }
}
