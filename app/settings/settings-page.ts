import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData } from "tns-core-modules/data/observable";
import { NavigatedData, Page } from "tns-core-modules/ui/page";

import { SettingsViewModel } from "./settings-view-model";
import * as Test from "../data-models/test-data";
import * as Utility from "../utility-functions/utility-functions";
import { Nfc, NfcTagData } from "nativescript-nfc";

let page: Page = null;
let activeLanguage: string = null;
let viewModel: SettingsViewModel = null;

let nfc: Nfc = null;
let i18nPageTitle: string = null;
let i18nLanguageOptionsTitle: string = null;
let i18nStopButtonText: string = null;
let i18nEnglishButtonText: string = null;
let i18nActiveLanguageText: string = null;
let i18nSpanishButtonText: string = null;
let i18nInstalledLanguagesText: string = null;
let i18nEnableLanguageInstructionsText: string = null;


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
    setI18N();
    //setActiveLanguageLabel();

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
    setI18N();
    //setActiveLanguageLabel();
}

export function onDrawerButtonTap(args: EventData) {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
}

function setActiveLanguageLabel() {
    activeLanguage = Utility.Language.getActiveLanguage();
    let languageText = (activeLanguage === "english") ? "Active: English" : "Activo: Español";
    viewModel.set("activeLanguage", languageText);
}

export function getNfcButtonColor(): string {
    let buttonColor: string = "red";
    // viewModel.set("activeLanguage", buttonColor);
    return buttonColor;
}

function setI18N(): void {
    let activeLanguage: string = Utility.Language.getActiveLanguage();

    if (activeLanguage === "english") {
        i18nPageTitle = "Settings";
        i18nLanguageOptionsTitle = "Language Options";
        i18nActiveLanguageText = "Active: English";
        i18nInstalledLanguagesText = "Installed Languages:";
        i18nStopButtonText = "Stop";
        i18nEnglishButtonText = "English";
        i18nSpanishButtonText = "Español";
        i18nEnableLanguageInstructionsText = "Press language button to enable or disable it";
    }
    else {
        i18nPageTitle = "Configuración";
        i18nLanguageOptionsTitle = "Opciones de Idioma";
        i18nActiveLanguageText = "Activo: Español";
        i18nInstalledLanguagesText = "Idiomas Instalados:";
        i18nStopButtonText = "Parada";
        i18nEnglishButtonText = "English";
        i18nSpanishButtonText = "Español";
        i18nEnableLanguageInstructionsText = "Pulse el botón de idioma para activarlo o desactivarlo";
    }

    viewModel.set("i18nPageTitle", i18nPageTitle);
    viewModel.set("i18nLanguageOptionsTitle", i18nLanguageOptionsTitle);
    viewModel.set("i18nActiveLanguageText", i18nActiveLanguageText);
    viewModel.set("i18nStopButtonText", i18nStopButtonText);
    viewModel.set("i18nInstalledLanguagesText", i18nInstalledLanguagesText);
    viewModel.set("i18nEnglishButtonText", i18nEnglishButtonText);
    viewModel.set("i18nSpanishButtonText", i18nSpanishButtonText);
    viewModel.set("i18nEnableLanguageInstructionsText", i18nEnableLanguageInstructionsText);
}
