import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData } from "tns-core-modules/data/observable";
import { NavigatedData, Page } from "tns-core-modules/ui/page";

import { MedicineBinding } from "../data-models/medicine-binding";

import { SearchViewModel } from "./search-view-model";
import * as Test from "../data-models/test-data";

let viewModel: SearchViewModel = null;

export function onNavigatingTo(args: NavigatedData) {
    const page = <Page>args.object;
    viewModel = new SearchViewModel();
    page.bindingContext = viewModel;
}

export function onDrawerButtonTap(args: EventData) {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
}

export function onLoaded(args: EventData) {
    viewModel.set("myMedicineList", Test.Dataset.getCurrentTestData());
}

export function onSelect(args: EventData) {
    alert("onSelect");
}

export function onSearchTapped(args: EventData) {
    alert("onSearchTapped");
}


