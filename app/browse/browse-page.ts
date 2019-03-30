import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData } from "tns-core-modules/data/observable";
import { NavigatedData, Page } from "tns-core-modules/ui/page";

import { BrowseViewModel } from "./browse-view-model";
import { MedicineBinding } from "~/data-models/medicine-binding";

import * as Test from "../data-models/test-data";
import * as Utility from "../utility-functions/utility-functions";

let page: Page = null;
let viewModel: BrowseViewModel = null;
let medicineList: MedicineBinding[] = null;

let i18NPageTitle: string = null;
let i18NMedicineListTitle: string = null;

export function onNavigatingTo(args: NavigatedData) {
    page = <Page>args.object;
    viewModel = new BrowseViewModel();
    page.bindingContext = viewModel;
}

export function onDrawerButtonTap(args: EventData) {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
}

export function onLoaded() {
    medicineList = Test.Dataset.getCurrentTestData();
    viewModel.set("myMedicineList", medicineList);

    // Set text to active language
    setActiveLanguageText();
}

function setActiveLanguageText(): void {
    let activeLanguage: string = Utility.Language.getActiveLanguage();

    if (activeLanguage === "english") {
        i18NPageTitle = "Home Pharmacist";
        i18NMedicineListTitle = "My Medicines";
    }
    else {
        i18NPageTitle = "Casa Farmacéutico";
        i18NMedicineListTitle = "Mis Medicamentos";
    }

    viewModel.set("i18NPageTitle", i18NPageTitle);
    viewModel.set("i18NMedicineListTitle", i18NMedicineListTitle);
};
