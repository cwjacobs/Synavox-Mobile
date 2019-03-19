import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData, Observable } from "tns-core-modules/data/observable";
import { NavigatedData, Page } from "tns-core-modules/ui/page";

import { ItemEventData, ListView } from "tns-core-modules/ui/list-view";
import { HomeViewModel } from "./home-view-model";
import { TestData } from "../data-models/test-data"
import { MedicineBinding, MedicineBindingList } from "../data-models/medicine-binding";
import { AudioPlayer } from '../audio-player/audio-player';

let language: string = null;
let viewModel: HomeViewModel = null;
let audioPlayer: AudioPlayer = null;
let medicineBindings: MedicineBindingList = null;

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

    if (medicineBindings === null) {
        language = "English";
        medicineBindings = new MedicineBindingList(testData.getStaticEnTestData());
    }
    viewModel.set("myMedicineList", medicineBindings.medicineBindingList);
}

export function onItemTap(args: ItemEventData) {
    let audioPath = medicineBindings.medicineBindingList[args.index].audioPath;
    AudioPlayer.useAudio(audioPath);
    AudioPlayer.togglePlay();
}

export function onStopTap(args: EventData) {
    let audioPlayer: AudioPlayer = new AudioPlayer();
    AudioPlayer.pausePlay();
};

export function onEnglishTap(args: EventData) {
    let testData = new TestData();
    medicineBindings.setCurrentMedicineBindings(testData.getStaticEnTestData());
    viewModel.set("myMedicineList", medicineBindings.medicineBindingList);

    language = "English";
};

export function onSpanishTap(args: EventData) {
    let testData = new TestData();
    medicineBindings.setCurrentMedicineBindings(testData.getStaticSpTestData());
    viewModel.set("myMedicineList", medicineBindings.medicineBindingList);

    language = "Spanish";
};

export function getCurrentLanguage(): string {
    return language;
};

export function setCurrentBindings(list: MedicineBinding[]) {
    medicineBindings.setCurrentMedicineBindings(list);
};

export function getCurrentBindings(): MedicineBinding[] {
    return medicineBindings.medicineBindingList;
};

function findAudio(fTagId: string): string {
    let audioPath: string = "not-found";
    let testData: TestData = new TestData();
    medicineBindings.medicineBindingList.forEach(value => {
        if (value.tagId === fTagId) {
            audioPath = value.audioPath;
        }
    })
    return audioPath;
}
