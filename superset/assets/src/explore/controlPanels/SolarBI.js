import {t} from "@superset-ui/translation";
import {nonEmpty} from "../validators";
import timeGrainSqlaAnimationOverrides from "./timeGrainSqlaAnimationOverrides";

export default {
    controlPanelSections: [
        {
            label: t('Query'),
            expanded: true,
            controlSetRows: [
                ['spatial_address', 'radius'],
                ['adhoc_filters'],
            ],
        },
        {
            label: t('Advanced'),
            controlSetRows: [
                ['js_columns'],
                ['js_data_mutator'],
                ['js_tooltip'],
                ['js_onclick_href'],
            ],
        },
    ],
};
