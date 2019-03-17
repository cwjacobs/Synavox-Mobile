import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData, Observable } from "tns-core-modules/data/observable";
import { NavigatedData, Page } from "tns-core-modules/ui/page";

import { ItemEventData, ListView } from "tns-core-modules/ui/list-view";
import { HomeViewModel } from "./home-view-model";
import { TestData } from "../data-models/test-data"
import { MedicineBinding } from "../data-models/medicine-binding";
import { AudioPlayer } from '../audio-player/audio-player';

let viewModel: HomeViewModel = null;
let audioPlayer: AudioPlayer = null;
let medicineBindings: MedicineBinding[] = null;

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
    audioPlayer = new AudioPlayer();

    medicineBindings = testData.getStaticTestData();
    viewModel.set("myMedicineList", medicineBindings);
}

export function onItemTap(args: ItemEventData) {
    let audioPath = medicineBindings[args.index].audioPath;
    AudioPlayer.useAudio(audioPath);
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
