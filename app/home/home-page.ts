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

let i18NPageTitle: string = null;
let i18NMedicineListTitle: string = null;
let i18NStopButtonText: string = null;
let i18NEnglishButtonText: string = null;
let i18NSpanishButtonText: string = null;

let activeLanguage: string;

let tagListernerSet: boolean = false;

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
    if (audioPlayer === null) {
        audioPlayer = new AudioPlayer();
    }

    setI18N();
    
    medicineList = Test.Dataset.getCurrentTestData();
    viewModel.set("myMedicineList", medicineList);

    let isDualLanguageEnabled = Utility.Language.getIsDualLanguageEnabled();
    viewModel.set("isDualLanguageEnabled", isDualLanguageEnabled);

    if (!tagListernerSet) {
        tagListernerSet = Utility.Rfid.doStartTagListener();
    }
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
    setI18N();
};

export function onSpanishTap(args: EventData) {
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
