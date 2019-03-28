import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";

import { NavigatedData, Page } from "tns-core-modules/ui/page";

import { ItemEventData } from "tns-core-modules/ui/list-view";
import { HomeViewModel } from "./home-view-model";
import { AudioPlayer } from '../audio-player/audio-player';

import * as Test from "../data-models/test-data";
import * as Utility from "../utility-functions/utility-functions";
import { MedicineBinding } from "~/data-models/medicine-binding";

let viewModel: HomeViewModel = null;
let medicineList: MedicineBinding[] = null;

let i18NPageTitle: string = null;
let i18NMedicineListTitle: string = null;
let i18NStopButtonText: string = null;
let i18NEnglishButtonText: string = null;
let i18NSpanishButtonText: string = null;


import { EventData } from "tns-core-modules/data/observable"; // working with this in nfc-observable branch
import { NfcTagData, Nfc } from "nativescript-nfc";
import { AppRootViewModel } from "~/app-root/app-root-view-model";

let nfc: Nfc = null;
let audioPlayer: AudioPlayer = null;

export function onNavigatingTo(args: NavigatedData) {
    const page = <Page>args.object;
    viewModel = new HomeViewModel();
    page.bindingContext = viewModel;
}

export function onDrawerButtonTap() {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
}

export function onLoaded() {
    if (nfc === null) {
        nfc = new Nfc();
    }
    if (audioPlayer === null) {
        audioPlayer = new AudioPlayer();
    }

    setI18N();

    medicineList = Test.Dataset.getCurrentTestData();
    viewModel.set("myMedicineList", medicineList);

    let isDualLanguageEnabled = Utility.Language.getIsDualLanguageEnabled();
    viewModel.set("isDualLanguageEnabled", isDualLanguageEnabled);

    // Start the rfid (nfc) tag listener
    nfc.setOnTagDiscoveredListener((args: NfcTagData) => onTagDiscoveredListener(args));
}

function onTagDiscoveredListener(nfcTagData: NfcTagData) {
    // alert("Tag Id: " + nfcTagData.id.toString());
    alert("Tag Id: " + Utility.Helpers.formatTagId(nfcTagData.id));
}

export function onNavigatingFrom() {
    // Remove this page's listener
    nfc.setOnTagDiscoveredListener(null);
}

export function onItemTap(args: ItemEventData) {
    let audioPath = Utility.Language.getAudioPath(medicineList[args.index].medicineName);
    AudioPlayer.useAudio(audioPath);
    AudioPlayer.togglePlay();
}

export function onStopTap() {
    AudioPlayer.pause();
};

export function onEnglishTap() {
    Utility.Language.setActiveLanguage("english");
    setI18N();
};

export function onSpanishTap() {
    Utility.Language.setActiveLanguage("spanish");
    setI18N();
};

export function getI18NMedicineListTitle() {
    return "mis medicamentos";
}

function setI18N(): void {
    let activeLanguage: string = Utility.Language.getActiveLanguage();

    if (activeLanguage === "english") {
        i18NPageTitle = "Home Pharmacist";
        i18NMedicineListTitle = "My Medicines";
        i18NStopButtonText = "Stop";
        i18NEnglishButtonText = "English";
        i18NSpanishButtonText = "Spanish";
    }
    else {
        i18NPageTitle = "Casa Farmacéutico";
        i18NMedicineListTitle = "Mis Medicamentos";
        i18NStopButtonText = "Parada";
        i18NEnglishButtonText = "Inglés";
        i18NSpanishButtonText = "Español";
    }

    viewModel.set("i18NPageTitle", i18NPageTitle);
    viewModel.set("i18NMedicineListTitle", i18NMedicineListTitle);
    viewModel.set("i18NStopButtonText", i18NStopButtonText);
    viewModel.set("i18NEnglishButtonText", i18NEnglishButtonText);
    viewModel.set("i18NSpanishButtonText", i18NSpanishButtonText);
}

// function formatTagId(data: number[]): string {
//     let formatedId: string = "";
//     data.forEach((value) => { formatedId += value })
//     return formatedId;
// }

