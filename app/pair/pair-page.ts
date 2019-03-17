import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData } from "tns-core-modules/data/observable";
import { NavigatedData, Page } from "tns-core-modules/ui/page";

import { PairViewModel } from "./pair-view-model";
import { AudioPlayer } from "~/audio-player/audio-player";
import { MedicineBinding } from "../data-models/medicine-binding";
import { TestData } from "../data-models/test-data"

let medicineBindings: MedicineBinding[] = null;

let page: Page = null;
let viewModel: PairViewModel = null;

export function onNavigatingTo(args: NavigatedData) {
    page = <Page>args.object;
    viewModel = new PairViewModel(page);

    page.bindingContext = viewModel;
}

export function onLoaded(args: EventData) {
    let testData = new TestData();
    medicineBindings = testData.getStaticTestData();
    viewModel.set("myMedicineList", medicineBindings);

    viewModel.doStartTagListener();
};

export function onDrawerButtonTap(args: EventData) {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
};

export function onPauseTap(args: EventData) {
    let audioPlayer: AudioPlayer = new AudioPlayer();
    AudioPlayer.pausePlay();
};
