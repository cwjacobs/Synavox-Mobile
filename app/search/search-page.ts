import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData } from "tns-core-modules/data/observable";
import { NavigatedData, Page } from "tns-core-modules/ui/page";

import { MedicineBinding } from "../data-models/medicine-binding";

import { SearchViewModel } from "./search-view-model";
import * as Test from "../data-models/test-data";
import * as Utility from "../utility-functions/utility-functions";

let viewModel: SearchViewModel = null;

let i18nPageTitle: string = null;
let i18nMedicineListTitle: string = null;

export function onNavigatingTo(args: NavigatedData) {
    const page = <Page>args.object;
    viewModel = new SearchViewModel();
    page.bindingContext = viewModel;
}

export function onNavigatingFrom(args: NavigatedData) {
}

export function onDrawerButtonTap(args: EventData) {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
}

export function onLoaded(args: EventData) {
    viewModel.set("myMedicineList", Test.Dataset.getCurrentTestData());
    setActiveLanguageText();
}

export function onSelect(args: EventData) {
    alert("onSelect");
}

export function onSearchTapped(args: EventData) {
    alert("onSearchTapped");
}

function setActiveLanguageText(): void {
    let activeLanguage: string = Utility.Language.getActiveLanguage();

    if (activeLanguage === "english") {
        i18nPageTitle = "Search";
        i18nMedicineListTitle = "My Medicines";
    }
    else {
        i18nPageTitle = "Búsqueda";
        i18nMedicineListTitle = "Mis Medicamentos";
    }

    viewModel.set("i18nPageTitle", i18nPageTitle);
    viewModel.set("i18nMedicineListTitle", i18nMedicineListTitle);
};


