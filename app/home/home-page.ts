import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";

import { NavigatedData, Page } from "tns-core-modules/ui/page";

import { ItemEventData } from "tns-core-modules/ui/list-view";
import { HomeViewModel } from "./home-view-model";
import { AudioPlayer } from '../audio-player/audio-player';

import * as Test from "../data-models/test-data";
import * as Utility from "../utility-functions/utility-functions";
import { MedicineBinding } from "~/data-models/medicine-binding";

import { EventData } from "tns-core-modules/data/observable"; // working with this in nfc-observable branch
// import { NfcTagData, Nfc } from "nativescript-nfc";
import { AppRootViewModel } from "~/app-root/app-root-view-model";
import { appRootI18N } from "~/app-root/app-root";
import { I18N } from "~/utilities/i18n";
import { RFID } from "~/utilities/rfid";


let page: Page = null;
let viewModel: HomeViewModel = null;
let medicineList: MedicineBinding[] = null;

// Singleton class providing RFID via NFC
let rfid: RFID = null;
// let rfid: RFID = RFID.instance;

// Singleton class providing english and spanish text
let i18n = null;

// Audio controls and buttons
let isAudioActive: boolean = false;
let isAudioEnabled: boolean = false;

// let nfc: Nfc = null;
let audioPlayer: AudioPlayer = null;

export function onNavigatingTo(args: NavigatedData) {
    page = <Page>args.object;
    viewModel = new HomeViewModel();
    page.bindingContext = viewModel;
}

export function onDrawerButtonTap() {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
}

export function onLoaded() {
    if (audioPlayer === null) {
        audioPlayer = new AudioPlayer();
    }

    if (rfid === null) {
        rfid = RFID.instance;
        rfid.startTagListener();
    }

    if (i18n === null) {
        i18n = I18N.instance; // Also will set active language to the default value (defined in I18N)
    }

    isAudioActive = false;
    isAudioEnabled = true;
    viewModel.set("isAudioEnabled", isAudioEnabled);

    medicineList = Test.Dataset.getCurrentTestData();
    viewModel.set("myMedicineList", medicineList);

    viewModel.set("isDualLanguageEnabled", i18n.isDualLanguageEnabled);

    // Set text to active language
    setActiveLanguageText();

    // Start the rfid (nfc) tag listener
    // nfc.setOnTagDiscoveredListener((args: NfcTagData) => onTagDiscoveredListener(args));
}

// function onTagDiscoveredListener(nfcTagData: NfcTagData) {
//     if (isAudioEnabled) {
//         let tagId: string = Utility.Helpers.formatTagId(nfcTagData.id);
//         let index: number = findTagIdIndex(tagId);
//         if (index != -1) { // existing tag found, play associated medicine information
//             let medicineName: string = medicineList[index].medicineName;
//             let audioPath = Utility.Language.getAudioPath(medicineName);
//             AudioPlayer.useAudio(audioPath);
//             AudioPlayer.play();
//         }
//         else {
//             alert(i18n.newTagAlert);
//         }
//     }
// }

export function onNavigatingFrom() {
    // Remove this page's listener
    // nfc.setOnTagDiscoveredListener(null);
}

export function onItemTap(args: ItemEventData) {
    if (isAudioEnabled) {
        let audioPath = Utility.Language.getAudioPath(medicineList[args.index].medicineName);
        AudioPlayer.useAudio(audioPath);
        AudioPlayer.togglePlay();
    }
}

export function onEnglishTap() {
    i18n.activeLanguage = "english";
    setActiveLanguageText();
};

export function onSpanishTap() {
    i18n.activeLanguage = "spanish";
    setActiveLanguageText();
};

// Audio control functions
export function onPlayTap(args: ItemEventData) {
    AudioPlayer.togglePlay();
    isAudioActive = !isAudioActive;
};

export function onStopTap(args: EventData) {
    AudioPlayer.pause();
    isAudioActive = false;

    // Forces audio to restart on next play
    AudioPlayer.useAudio("");
};

export function onAudioEnableTap(args: ItemEventData) {
    isAudioEnabled = !isAudioEnabled;
    viewModel.set("isAudioEnabled", isAudioEnabled);
    if (!isAudioEnabled) {
        AudioPlayer.pause();

        // Forces audio to restart on next play
        AudioPlayer.useAudio("");
    }
};

function setActiveLanguageText(): void {
    viewModel.set("i18nPageTitle", i18n.homePageTitle);
    viewModel.set("i18nMedicineListTitle", i18n.myMedicines);
    viewModel.set("i18nEnglishButtonText", i18n.english);
    viewModel.set("i18nSpanishButtonText", i18n.spanish);

    // Call nav page to update nav text
    appRootI18N();
};

function findMedicineNameIndex(medicineName: string): number {
    let i: number = 0;
    let index: number = -1;
    medicineList.forEach(value => {
        if (value.medicineName === medicineName) {
            index = i;
        }
        else {
            i = i + 1;
        }
    })
    return index;
}

function findTagIdIndex(tagId: string): number {
    let i: number = 0;
    let index: number = -1;
    medicineList.forEach(value => {
        if (value.tagId === tagId) {
            index = i;
        }
        else {
            i = i + 1;
        }
    })
    return index;
}
