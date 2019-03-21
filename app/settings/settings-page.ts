import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData } from "tns-core-modules/data/observable";
import { NavigatedData, Page } from "tns-core-modules/ui/page";

import { SettingsViewModel } from "./settings-view-model";
import * as Test from "../data-models/test-data";
import * as Utility from "../utility-functions/utility-functions";

let page: Page = null;
let activeLanguage: string = null;
let viewModel: SettingsViewModel = null;

export function onNavigatingTo(args: NavigatedData) {
    page = <Page>args.object;
    viewModel = new SettingsViewModel();

    page.bindingContext = viewModel;
}

export function onLoaded(args: NavigatedData) {
    let isEnglishEnabled = Utility.Language.getIsEnglishEnabled();
    viewModel.set("isEnglishEnabled", isEnglishEnabled);

    let isSpanishEnabled = Utility.Language.getIsSpanishEnabled();
    viewModel.set("isSpanishEnabled", isSpanishEnabled);

    if (isEnglishEnabled) {
        viewModel.set("isSpButtonEnabled", true);
    }

    if (isSpanishEnabled) {
        viewModel.set("isEnButtonEnabled", true);
    }

    setActiveLanguageLabel();
}

export function onEnglishTap(args: NavigatedData) {
    let isSpButtonEnabled: boolean;
    let isEnglishEnabled = Utility.Language.toggleEnglishEnabled();
    if (!isEnglishEnabled) { // Don't allow both languages to be disabled
        isSpButtonEnabled = false;
        viewModel.set("isSpButtonEnabled", isSpButtonEnabled);
        Utility.Language.setActiveLanguage("spanish");
    }
    else {
        isSpButtonEnabled = true;
        viewModel.set("isSpButtonEnabled", isSpButtonEnabled);
    }
    viewModel.set("isEnglishEnabled", isEnglishEnabled);
    setActiveLanguageLabel();

}

export function onSpanishTap(args: NavigatedData) {
    let isEnButtonEnabled: boolean;
    let isSpanishEnabled = Utility.Language.toggleSpanishEnabled();
    if (!isSpanishEnabled) { // Don't allow both languages to be disabled
        isEnButtonEnabled = false;
        viewModel.set("isEnButtonEnabled", isEnButtonEnabled);
        Utility.Language.setActiveLanguage("english");
    }
    else {
        isEnButtonEnabled = true;
        viewModel.set("isEnButtonEnabled", isEnButtonEnabled);
    }
    viewModel.set("isSpanishEnabled", isSpanishEnabled);
    setActiveLanguageLabel();
}

export function onDrawerButtonTap(args: EventData) {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
}

function setActiveLanguageLabel() {
    activeLanguage = Utility.Language.getActiveLanguage();
    let languageText = (activeLanguage === "english") ? "English" : "Spanish";
    viewModel.set("activeLanguage", languageText);
}