import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData, Observable } from "tns-core-modules/data/observable";
import { NavigatedData, Page } from "tns-core-modules/ui/page";

import { ItemEventData, ListView } from "tns-core-modules/ui/list-view";
import { HomeViewModel } from "./home-view-model";
import { AudioPlayer } from '../audio-player/audio-player';

import * as Test from "../data-models/test-data";
import * as Utility from "../utility-functions/utility-functions";
import { MedicineBinding } from "~/data-models/medicine-binding";

let viewModel: HomeViewModel = null;
let audioPlayer: AudioPlayer = null;
let medicineList: MedicineBinding[] = null;

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
    audioPlayer = new AudioPlayer();
    medicineList = Test.Dataset.getCurrentTestData();
    viewModel.set("myMedicineList", medicineList);

    // Utility.Language.setIsEnglishEnabled(true);
    // Utility.Language.setIsSpanishEnabled(false);
   
    let isDualLanguageEnabled = Utility.Language.getIsDualLanguageEnabled();
    viewModel.set("isDualLanguageEnabled", isDualLanguageEnabled);
}

export function onItemTap(args: ItemEventData) {
    let audioPath = Utility.Language.getAudioPath(medicineList[args.index].medicineName);
    AudioPlayer.useAudio(audioPath);
    AudioPlayer.togglePlay();
}

export function onStopTap(args: EventData) {
    let audioPlayer: AudioPlayer = new AudioPlayer();
    AudioPlayer.pausePlay();
};

export function onEnglishTap(args: EventData) {
    Utility.Language.setActiveLanguage("english");
};

export function onSpanishTap(args: EventData) {
    Utility.Language.setActiveLanguage("spanish");
};
