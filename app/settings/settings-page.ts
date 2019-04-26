import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData } from "tns-core-modules/data/observable";
import { NavigatedData, Page } from "tns-core-modules/ui/page";

import { SettingsViewModel } from "./settings-view-model";
import * as Test from "../data-models/test-data";
import * as Utility from "../utility-functions/utility-functions";
import { Nfc, NfcTagData } from "nativescript-nfc";

import { I18N } from "~/utilities/i18n";

let page: Page = null;
let activeLanguage: string = null;
let viewModel: SettingsViewModel = null;

// Page Text
let i18n = I18N.instance;

let nfc: Nfc = null;

export function onNavigatingTo(args: NavigatedData) {
    page = <Page>args.object;
    viewModel = new SettingsViewModel();

    page.bindingContext = viewModel;
}

export function onLoaded(args: NavigatedData) {
    if (nfc === null) {
        nfc = new Nfc();
    }
    // Start the rfid (nfc) tag listener
    nfc.setOnTagDiscoveredListener((args: NfcTagData) => onTagDiscoveredListener(args));

    let isEnglishEnabled: boolean = i18n.isEnglishEnabled;
    viewModel.set("isEnglishEnabled", isEnglishEnabled);

    let isSpanishEnabled: boolean = i18n.isSpanishEnabled;
    viewModel.set("isSpanishEnabled", isSpanishEnabled);

     // If only one language is enabled, then we make its corresponding button unselectable to prevent disabling the only enabled language.
     // IE: Allow Spanish to be enabled/disabled (make button clickable) if English is enabled, make it unselectable if only Spanish is enabled.
    viewModel.set("isEnButtonEnabled", isSpanishEnabled);
    viewModel.set("isSpButtonEnabled", isEnglishEnabled);

    setI18N();
}

function onTagDiscoveredListener(nfcTagData: NfcTagData) {
    alert("Settings onTagDiscoveredListener");
}

export function onNavigatingFrom() {
    alert("onNavigatingFrom Settings");
    nfc.setOnTagDiscoveredListener(null);
}

export function onEnglishTap(args: NavigatedData) {
    let isSpButtonEnabled: boolean;
    let isEnglishEnabled: boolean = i18n.toggleEnglishEnabled();
    if (!isEnglishEnabled) { // Don't allow both languages to be disabled
        isSpButtonEnabled = false; // set spanish as active language and prevent user from disabling it at the same time.
        i18n.activeLanguage = "spanish";
    }
    else {
        isSpButtonEnabled = true;
    }
    viewModel.set("isEnglishEnabled", isEnglishEnabled);
    viewModel.set("isSpButtonEnabled", isSpButtonEnabled);
    setI18N();
}

export function onSpanishTap(args: NavigatedData) {
    let isEnButtonEnabled: boolean;
    let isSpanishEnabled: boolean = i18n.toggleSpanishEnabled();
    if (!isSpanishEnabled) { // Don't allow both languages to be disabled
        isEnButtonEnabled = false; // set english as active language and prevent user from disabling it at the same time.
        i18n.activeLanguage = "english"; // should probably be doing this from an i18n function
    }
    else {
        isEnButtonEnabled = true;
    }
    viewModel.set("isEnButtonEnabled", isEnButtonEnabled);
    viewModel.set("isSpanishEnabled", isSpanishEnabled);
    setI18N();
}

export function onDrawerButtonTap(args: EventData) {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
}

export function getNfcButtonColor(): string {
    let buttonColor: string = "red";
    // viewModel.set("activeLanguage", buttonColor);
    return buttonColor;
}

function setI18N(): void {
    viewModel.set("i18nPageTitle", i18n.settingsPageTitle);
    viewModel.set("i18nLanguageOptionsTitle", i18n.languageOptionsSetting);
    viewModel.set("i18nActiveLanguageText", i18n.activeLanguageSetting);
    viewModel.set("i18nInstalledLanguagesText", i18n.installedLanguageSetting);
    viewModel.set("i18nEnglishButtonText", i18n.english);
    viewModel.set("i18nSpanishButtonText", i18n.spanish);
    viewModel.set("i18nEnableLanguageInstructionsText", i18n.enableLanguageInstructionsSetting);
}
