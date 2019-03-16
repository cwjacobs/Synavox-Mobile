import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData, Observable } from "tns-core-modules/data/observable";
import { NavigatedData, Page } from "tns-core-modules/ui/page";

import { HomeViewModel } from "./home-view-model";
import { TestData } from "../data-models/test-data"
import { MedicineBinding } from "../data-models/medicine-binding";
import { AudioPlayer } from '../audio-player/audio-player';

let viewModel: HomeViewModel = null;

export function onNavigatingTo(args: NavigatedData) {
    const page = <Page>args.object;
    viewModel = new HomeViewModel();
    page.bindingContext = viewModel;
}

export function onDrawerButtonTap(args: EventData) {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
}

export function onLoaded(args: EventData) {
    let testData = new TestData();
    viewModel.set("myMedicineList", testData.getStaticTestData());
}

export function onItemTap(args: EventData) {
    let audioPlayer = new AudioPlayer(findAudio("77-475-106"));
    AudioPlayer.togglePlay();
}

export function onPauseTap(args: EventData) {
    let audioPlayer: AudioPlayer = new AudioPlayer();
    AudioPlayer.pausePlay();
};

function findAudio(fTagId: string): string {
    let audioPath: string = "not-found";
    let testData: TestData = new TestData();
    let medicineBindings: MedicineBinding[] = testData.getStaticTestData();
    medicineBindings.forEach(value => {
        if (value.tagId === fTagId) {
            audioPath = value.audioPath;
        }
    })
    return audioPath;
}
