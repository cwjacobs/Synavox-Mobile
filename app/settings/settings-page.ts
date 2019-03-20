import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData } from "tns-core-modules/data/observable";
import { NavigatedData, Page } from "tns-core-modules/ui/page";

import { SettingsViewModel } from "./settings-view-model";
import * as Test from "../data-models/test-data";
import * as Utility from "../utility-functions/utility-functions";

let page: Page = null;
let languageDir: string = "en";
let activeLanguage: string = null;
let viewModel: SettingsViewModel = null;

export function onNavigatingTo(args: NavigatedData) {
    page = <Page>args.object;
    viewModel = new SettingsViewModel(page);

    page.bindingContext = viewModel;
}

export function onLoaded(args: NavigatedData) {
    activeLanguage = Utility.Language.getCurrentLanguage();
    let languageText = (activeLanguage === "english") ? "English" : "Spanish";
    viewModel.set("activeLanguage", languageText);
}

export function onEnglishTap(args: NavigatedData) {
    Utility.Language.setCurrentLanguage("english");
    viewModel.set("activeLanguage", "English");
}

export function onSpanishTap(args: NavigatedData) {
    Utility.Language.setCurrentLanguage("spanish");
    viewModel.set("activeLanguage", "Spanish");
}

export function onDrawerButtonTap(args: EventData) {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
}

