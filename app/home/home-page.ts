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
import { NfcTagData, Nfc } from "nativescript-nfc";
import { AppRootViewModel } from "~/app-root/app-root-view-model";
import { appRootI18N } from "~/app-root/app-root";
import { I18N } from "~/i18n/i18n";


let page: Page = null;
let viewModel: HomeViewModel = null;
let medicineList: MedicineBinding[] = null;

let i18n = I18N.instance;

let i18nPageTitle: string = null;
let i18nMedicineListTitle: string = null;
let i18nEnglishButtonText: string = null;
let i18nSpanishButtonText: string = null;

// Audio controls and buttons
let isAudioActive: boolean = false;
let isAudioEnabled: boolean = false;

let nfc: Nfc = null;
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
    if (nfc === null) {
        nfc = new Nfc();
    }

    if (audioPlayer === null) {
        audioPlayer = new AudioPlayer();
    }

    isAudioActive = false;
    isAudioEnabled = true;
    viewModel.set("isAudioEnabled", isAudioEnabled);

    medicineList = Test.Dataset.getCurrentTestData();
    viewModel.set("myMedicineList", medicineList);

    let isDualLanguageEnabled = Utility.Language.getIsDualLanguageEnabled();
    viewModel.set("isDualLanguageEnabled", isDualLanguageEnabled);

    // Set text to active language
    setActiveLanguageText();

    // Start the rfid (nfc) tag listener
    nfc.setOnTagDiscoveredListener((args: NfcTagData) => onTagDiscoveredListener(args));
}

function onTagDiscoveredListener(nfcTagData: NfcTagData) {
    if (isAudioEnabled) {
        let tagId: string = Utility.Helpers.formatTagId(nfcTagData.id);
        let index: number = findTagIdIndex(tagId);
        if (index != -1) { // existing tag found, play associated medicine information
            let medicineName: string = medicineList[index].medicineName;
            let audioPath = Utility.Language.getAudioPath(medicineName);
            AudioPlayer.useAudio(audioPath);
            AudioPlayer.play();
        }
        else {
            if (Utility.Language.getActiveLanguage() === "english") {
                alert("New tag scanned, use 'Pair' screen to associate with a medicine");
            }
            else {
                alert("Nueva etiqueta escaneada, utilice la pantalla 'Pair' para asociarse con un medicamento");
            }
        }
    }
}

export function onNavigatingFrom() {
    // Remove this page's listener
    nfc.setOnTagDiscoveredListener(null);
}

export function onItemTap(args: ItemEventData) {
    if (isAudioEnabled) {
        let audioPath = Utility.Language.getAudioPath(medicineList[args.index].medicineName);
        AudioPlayer.useAudio(audioPath);
        AudioPlayer.togglePlay();
    }
}

export function onEnglishTap() {
    i18n.activeLanguage = "English";
    Utility.Language.setActiveLanguage("english");
    setActiveLanguageText();
};

export function onSpanishTap() {
    i18n.activeLanguage = "Spanish";
    Utility.Language.setActiveLanguage("spanish");
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
    let activeLanguage: string = Utility.Language.getActiveLanguage();

    if (activeLanguage === "english") {
        i18nPageTitle = "Home Pharmacist";
        i18nMedicineListTitle = "My Medicines";
        i18nEnglishButtonText = "English";
        i18nSpanishButtonText = "Español";
    }
    else {
        i18nPageTitle = "Farmacéutico de Casa";
        i18nMedicineListTitle = "Mis Medicamentos";
        i18nEnglishButtonText = "English";
        i18nSpanishButtonText = "Español";
    }

    viewModel.set("i18nPageTitle", i18nPageTitle);
    viewModel.set("i18nMedicineListTitle", i18nMedicineListTitle);
    viewModel.set("i18nEnglishButtonText", i18nEnglishButtonText);
    viewModel.set("i18nSpanishButtonText", i18nSpanishButtonText);

    appRootI18N(activeLanguage);
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
