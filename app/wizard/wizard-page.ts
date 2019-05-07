import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData } from "tns-core-modules/data/observable";
import { NavigatedData, Page } from "tns-core-modules/ui/page";
import { confirm } from "tns-core-modules/ui/dialogs";
import { topmost } from "tns-core-modules/ui/frame/frame";

import { I18N } from "~/utilities/i18n";
import { RFID } from "~/utilities/rfid"

import { WizardViewModel } from "./wizard-view-model";
import { MedicineBinding } from "~/data-models/medicine-binding";
import { AppRootViewModel } from "~/app-root/app-root-view-model";

import * as Test from "../data-models/test-data";
import * as Utility from "../utility-functions/utility-functions";

import { AudioPlayer } from "~/audio-player/audio-player";
import { ItemEventData } from "tns-core-modules/ui/list-view/list-view";
import { ListPicker } from "tns-core-modules/ui/list-picker/list-picker";

let viewModel: WizardViewModel = null;

let medicineTagPairs: MedicineBinding[] = null;

// for browse branch
let appRootContext: AppRootViewModel = null;

// Page Text
let i18n = I18N.instance;

// NFC access
let rfid = RFID.instance;

export function onNavigatingTo(args: NavigatedData) {
    const page = <Page>args.object;
    viewModel = new WizardViewModel();
    page.bindingContext = viewModel;
}

export function onNavigatingFrom(args: NavigatedData) {
}

export function onDrawerButtonTap(args: EventData) {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
}

export function onLoaded(args: EventData) {
    medicineTagPairs = Test.Dataset.getCurrentTestData();
    console.dir("medicineTagPairs: " + medicineTagPairs);

    viewModel.set("myMedicineList", medicineTagPairs);
    setActiveLanguageText();

    viewModel.set("i18nMedicineListTitle", i18n.homePageTitle);
    setActiveLanguageText();

    if (appRootContext == null) {
        appRootContext = new AppRootViewModel();
    }

    if (rfid.tagScanned) {
        viewModel.set("currentTagId", rfid.tagId);
        viewModel.set("isTagDisplayed", true);
        viewModel.set("isSelectingAction", true);
        viewModel.set("isSelectingMedicine", false);
        viewModel.set("i18nScannedOrSelected", i18n.scannedMsg);

        // We're here because a tag was scanned, let's walk the user through next steps...
        rfid.tagScanned = false;
        let pairedMedicineName: string = getPairedMedicineName(rfid.tagId, medicineTagPairs);
        if (!pairedMedicineName) {
            let confirmMsg: string = "New tag discovered. Would you like to pair this tag to a medicine name now?";
            confirm(confirmMsg).then((isConfirmed) => {
                if (isConfirmed) {
                    rfid.newTagScanned = true;
                    navigateTo("Pair", "pair/pair-page");
                }
            });
        }
        else {
            viewModel.set("isSelectingAction", true);
            viewModel.set("isMedicineDisplayed", true);

            viewModel.set("isTagDisplayed", false);
            viewModel.set("isSelectingMedicine", false);
            viewModel.set("currentMedicineName", pairedMedicineName);
            //pairedMedicineWizard(pairedMedicineName);
        }
    }
    else {
        let myMedicineNamesList: string[] = getMedicineNames(medicineTagPairs);
        viewModel.set("myMedicineNamesList", myMedicineNamesList);
        viewModel.set("isSelectingMedicine", true);
        viewModel.set("index", 1);
        
        viewModel.set("isTagDisplayed", false);
        viewModel.set("isMedicineDisplayed", false);
        viewModel.set("isSelectingAction", false);
        viewModel.set("i18nScannedOrSelected", i18n.selectedMsg);

    }
}

function getMedicineNames(medicineTagPairs: MedicineBinding[]): string[] {
    let medicineNames: string[] = [];
    medicineTagPairs.forEach((pair) => {
        medicineNames.push((pair.medicineName));
    })
    return medicineNames;
}

function pairedMedicineWizard(pairedMedicineName: string): void {
    alert("Do pairedMedicineWizard for: " + pairedMedicineName);
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

function findMedicineNameIndex(medicineName: string, medicineBindingList: MedicineBinding[]): number {
    let i: number = 0;
    let index: number = -1;
    medicineBindingList.forEach(value => {
        if (value.medicineName.toLocaleLowerCase() === medicineName.toLocaleLowerCase()) {
            index = i;
        }
        else {
            i = i + 1;
        }
    })
    return index;
}

function navigateTo(componentTitle: string, componentRoute: string): void {
    appRootContext.selectedPage = componentTitle;
    topmost().navigate({
        moduleName: componentRoute,
        transition: {
            name: "fade"
        }
    });
}

export function onAlwaysConfirmTap() {
    alert("onAlwaysConfirmTap");
}

export function onHomeTap() {
    const componentRoute = "home/home-page";
    const componentTitle = "Home";
    navigateTo(componentTitle, componentRoute);
}

export function onDoseTap() {
    const componentRoute = "dose/dose-page";
    const componentTitle = "Dose";
    navigateTo(componentTitle, componentRoute);
}

export function onPairTap() {
    const componentRoute = "pair/pair-page";
    const componentTitle = "Pair";
    navigateTo(componentTitle, componentRoute);
}

// Audio control functions
export function onPlayTap(args: ItemEventData) {
    let pairedMedicineName: string = viewModel.get("currentMedicineName");
    if (pairedMedicineName.length === 0) {
        alert("No medicine name...");
        return;
    }
    let audioPath = Utility.Language.getAudioPath(pairedMedicineName);
    AudioPlayer.useAudio(audioPath);
    AudioPlayer.togglePlay();
};

export function onStopTap(args: EventData) {
    AudioPlayer.pause();

    // Forces audio to restart on next play
    let pairedMedicineName = viewModel.get("currentMedicineName");
    let audioPath = Utility.Language.getAudioPath(pairedMedicineName);
    AudioPlayer.useAudio(audioPath);
};

let medicineName: string = null;

export function onListPickerLoaded(args: EventData) {
    const listPicker = <ListPicker>args.object;
    listPicker.on("selectedIndexChange", (lpargs) => {
        viewModel.set("index", listPicker.selectedIndex);
        medicineName = (<any>listPicker).selectedValue;
        
        console.log(`ListPicker selected value: ${(<any>listPicker).selectedValue}`);
        console.log(`ListPicker selected index: ${listPicker.selectedIndex}`);
    });
};

export function onSelectMedicineTap(args: EventData) {
    viewModel.set("isSelectingAction", true);
    viewModel.set("isMedicineDisplayed", true);

    viewModel.set("isTagDisplayed", false);
    viewModel.set("isSelectingMedicine", false);
    viewModel.set("currentMedicineName", medicineName);
}

function setActiveLanguageText(): void {
    viewModel.set("i18nPageTitle", i18n.searchPageTitle);
    viewModel.set("i18nMedicineListTitle", i18n.myMedicines);
};


