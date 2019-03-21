import { Observable } from "tns-core-modules/data/observable";

import { SelectedPageService } from "../shared/selected-page-service";
import { Page } from "tns-core-modules/ui/page/page";

import { MedicineBinding } from "../data-models/medicine-binding";
import { AudioPlayer } from "~/audio-player/audio-player";

import * as Test from "../data-models/test-data";
import * as Utility from "../utility-functions/utility-functions";


export class PairViewModel extends Observable {
    public tagId: string;

    constructor() {
        super();
        SelectedPageService.getInstance().updateSelectedPage("Pair");
    }
}

