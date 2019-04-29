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

    viewModel.set("myMedicineList", Test.Dataset.getCurrentTestData());
    setActiveLanguageText();

    if (appRootContext == null) {
        appRootContext = new AppRootViewModel();
    }

    if (rfid.tagScanned) {
        console.log("rfid.tagScanned. tagId: " + rfid.tagId);

        // We're here because a tag was scanned, let's walk the user through next steps...
        rfid.tagScanned = false;
        let pairedMedicineName: string = getPairedMedicineName(rfid.tagId, medicineTagPairs);
        if (!pairedMedicineName) {
            let confirmMsg: string = "TBD-i18n --- New tag discovered. Would you like to pair this tag to a medicine name now?";
            confirm(confirmMsg).then((isConfirmed) => {
                if (isConfirmed) {
                    navigateTo("Pair", "pair/pair-page");
                }
            });
        }
    }
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

export function onSelect(args: EventData) {
    alert("onSelect");
}

export function onSearchTapped(args: EventData) {
    alert("onSearchTapped");
}

function setActiveLanguageText(): void {
    viewModel.set("i18nPageTitle", i18n.searchPageTitle);
    viewModel.set("i18nMedicineListTitle", i18n.myMedicines);
};


