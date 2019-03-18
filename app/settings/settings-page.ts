import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData } from "tns-core-modules/data/observable";
import { NavigatedData, Page } from "tns-core-modules/ui/page";

import { SettingsViewModel } from "./settings-view-model";

let page: Page = null;
let languageDir: string = "en";
let language: string = "English";
let viewModel: SettingsViewModel = null;

export function onNavigatingTo(args: NavigatedData) {
    page = <Page>args.object;
    viewModel = new SettingsViewModel(page);

    page.bindingContext = viewModel;
}

export function onLoaded(args: NavigatedData) {
}

export function onEnglishTap(args: NavigatedData) {
    alert("English");
    languageDir = "en";
    language = "English";
    viewModel.set("language", language);
}

export function onSpanishTap(args: NavigatedData) {
    alert("Spanish");
    languageDir = "sp";
    language = "Spanish";
    viewModel.set("language", language);
}

export function onDrawerButtonTap(args: EventData) {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
}

export function getLanguageDirectory(): string {
    return languageDir;
}

