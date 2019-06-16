import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData } from "tns-core-modules/data/observable";
import { NavigatedData, Page } from "tns-core-modules/ui/page";
import { confirm } from "tns-core-modules/ui/dialogs";

import { I18N } from "~/utilities/i18n";
import { RFID } from "~/utilities/rfid"

import { WizardViewModel } from "./wizard-view-model";
import { MedicineBinding } from "~/data-models/medicine-cabinet";

import { ItemEventData } from "tns-core-modules/ui/list-view/list-view";
import { ListPicker } from "tns-core-modules/ui/list-picker/list-picker";

import { Settings } from "~/settings/settings";
import { AudioPlayer } from "~/audio-player/audio-player";

import { navigateTo } from "~/app-root/app-root";

let i18n: I18N = I18N.getInstance();
let rfid = RFID.getInstance();
let settings: Settings = Settings.getInstance();
let audioPlayer: AudioPlayer = AudioPlayer.getInstance();

let medicineName: string = null;

let viewModel: WizardViewModel = null;

let medicineTagPairs: MedicineBinding[] = null;

export function onNavigatingTo(args: NavigatedData) {
    const page = <Page>args.object;
    viewModel = new WizardViewModel();
    page.bindingContext = viewModel;
}

export function onNavigatingFrom(args: NavigatedData) {
    audioPlayer.stop();
}

export function onDrawerButtonTap(args: EventData) {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
}

export function onLoaded(args: EventData) {
    medicineTagPairs = settings.currentMedicineCabinet.medicines;

    viewModel.set("i18nMedicineListTitle", i18n.synavoxSubPageTitle);
    setActiveLanguageText();

    // Two ways to get here, tag is scanned or user navigated here
    if (rfid.isTagScanned) {
        rfid.isTagScanned = false; // Scan is handled

        viewModel.set("isSelectingAction", true);
        viewModel.set("isSelectingMedicine", false);
        viewModel.set("i18nScannedOrSelected", i18n.scannedMsg);

        if (settings.isNewBinding) {
            settings.currentMedicineName = "";
            let confirmMsg: string = i18n.newTagMsg;
            confirm(confirmMsg).then((isConfirmed) => {
                if (isConfirmed) {
                    settings.isNewBinding = true; // Informs pair-page that this is a new medicine/tag binding
                    navigateTo("NewTag", "xition/new-tag/new-tag-page");
                }
                else {
                    settings.isNewBinding = false;
                    letUserSelectMedicine();
                }
            });
        }
        else {
            let pairedMedicineName: string = getPairedMedicineName(settings.currentTagId, medicineTagPairs);
            settings.currentMedicineName = pairedMedicineName;

            viewModel.set("isSelectingAction", true);
            viewModel.set("isMedicineDisplayed", true);

            viewModel.set("isSelectingMedicine", false);
            viewModel.set("currentMedicineName", pairedMedicineName);
        }
    }
    else {
        // User navigated here, or no current medicine, allow user to select
        letUserSelectMedicine();
    }
}

export function onAlwaysPlayTap() {
    settings.isAlwaysPlayAudio = !settings.isAlwaysPlayAudio;
    viewModel.set("isAlwaysPlayAudio", settings.isAlwaysPlayAudio);
    if (settings.isAlwaysPlayAudio) {
        settings.isAlwaysConfirmDose = false;
        viewModel.set("isAlwaysConfirmDose", settings.isAlwaysConfirmDose);
    }
}

export function onAlwaysConfirmTap() {
    settings.isAlwaysConfirmDose = !settings.isAlwaysConfirmDose;
    viewModel.set("isAlwaysConfirmDose", settings.isAlwaysConfirmDose);
    if (settings.isAlwaysConfirmDose) {
        settings.isAlwaysPlayAudio = false;
        viewModel.set("isAlwaysPlayAudio", settings.isAlwaysPlayAudio);
    }
}

export function onHomeTap() {
    const pageTitle = "Home";
    const pageRoute = "home/home-page";
    navigateTo(pageTitle, pageRoute);
}

export function onConfirmDoseTakenTap() {
    settings.currentMedicineName = viewModel.get("currentMedicineName");
    settings.isConfirmingDose = true;

    const pageTitle = "Home";
    const pageRoute = "home/home-page";
    navigateTo(pageTitle, pageRoute);
}

export function onPairTap() {
    const pageTitle = "Pair";
    const pageRoute = "pair/pair-page";
    navigateTo(pageTitle, pageRoute);
}

// Audio control functions
export function onPlayTap(args: ItemEventData) {
    if (settings.isAudioEnabled) {
        let medicineName: string = viewModel.get("currentMedicineName");
        if (!medicineName) {
            alert(i18n.selectMedicineMsg);
            return;
        }
        audioPlayer.play(medicineName);
    }
};

export function onStopTap(args: EventData) {
    audioPlayer.stop();
};

export function onListPickerLoaded(args: EventData) {
    const listPicker = <ListPicker>args.object;
    listPicker.on("selectedIndexChange", (lpargs) => {
        viewModel.set("index", listPicker.selectedIndex);
        medicineName = (<any>listPicker).selectedValue;

        // console.log(`ListPicker selected value: ${(<any>listPicker).selectedValue}`);
        // console.log(`ListPicker selected index: ${listPicker.selectedIndex}`);
    });
};

export function onSelectMedicineTap(args: EventData) {
    settings.currentMedicineName = medicineName;

    viewModel.set("isSelectingAction", true);
    viewModel.set("isMedicineDisplayed", true);

    viewModel.set("isSelectingMedicine", false);
    viewModel.set("currentMedicineName", medicineName);
}

function letUserSelectMedicine() {
    let myMedicineNamesList: string[] = getMedicineNames(medicineTagPairs);
    viewModel.set("myMedicineNamesList", myMedicineNamesList);
    viewModel.set("isSelectingMedicine", true);
    viewModel.set("index", 1);

    viewModel.set("isMedicineDisplayed", false);
    viewModel.set("isSelectingAction", false);
    viewModel.set("i18nScannedOrSelected", i18n.selectedMsg);
}

function setActiveLanguageText(): void {
    viewModel.set("i18nPageTitle", i18n.wizardPageTitle);
    viewModel.set("i18nSynavoxSubPageTitle", i18n.synavoxSubPageTitle);

    viewModel.set("i18nMedicineCabinetOwnerTitle", settings.currentMedicineCabinet.ownerTitle);

    viewModel.set("i18nSelect", i18n.select);
    viewModel.set("i18nScrollInstructions", i18n.scrollInstructions);

    viewModel.set("i18nTookADose", i18n.action_tookADose);
    viewModel.set("i18nConfirmDoseTaken", i18n.confirmDoseTaken);
    viewModel.set("isAlwaysConfirmDose", settings.isAlwaysConfirmDose);
    viewModel.set("i18nAlwaysConfirmDose", i18n.action_alwaysConfirmDose);

    viewModel.set("i18nHearAudio", i18n.action_hearAudio);
    viewModel.set("isAlwaysPlayAudio", settings.isAlwaysPlayAudio);
    viewModel.set("i18nAlwaysPlayAudio", i18n.action_alwaysPlayAudio);
};

function getMedicineNames(medicineTagPairs: MedicineBinding[]): string[] {
    let medicineNames: string[] = [];
    medicineTagPairs.forEach((pair) => {
        medicineNames.push((pair.medicineName));
    })
    return medicineNames;
}

function getPairedMedicineName(tagId: string, medicineBindingList: MedicineBinding[]): string {
    let pairedMedicineName: string;
    let index: number = findTagIdIndex(tagId, medicineBindingList);
    if (index === -1) {
        pairedMedicineName = null; // tagId not found in list of paired Tags / Medicines
    }
    else {
        pairedMedicineName = medicineBindingList[index].medicineName;
    }
    return pairedMedicineName;
}

function findTagIdIndex(tagId: string, list: MedicineBinding[]): number {
    let i: number = 0;
    let index: number = -1;
    list.forEach(value => {
        if (value.tagId === tagId) {
            index = i;
        }
        else {
            i = i + 1;
        }
    })
    return index;
}


