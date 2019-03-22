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

let i18NPageTitle: string = null;
let i18NLanguageOptionsTitle: string = null;
let i18NStopButtonText: string = null;
let i18NEnglishButtonText: string = null;
let i18NActiveLanguageText: string = null;
let i18NSpanishButtonText: string = null;
let i18NInstalledLanguagesText: string = null;
let i18NEnableLanguageInstructionsText: string = null;

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
    setI18N();
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
        i18NPageTitle = "Settings";
        i18NLanguageOptionsTitle = "Language Options";
        i18NActiveLanguageText = "Active: English";
        i18NInstalledLanguagesText = "Installed Languages:";
        i18NStopButtonText = "Stop";
        i18NEnglishButtonText = "English";
        i18NSpanishButtonText = "Spanish";
        i18NEnableLanguageInstructionsText = "Press language button to enable or disable it";
    }
    else {
        i18NPageTitle = "Configuración";
        i18NLanguageOptionsTitle = "Opciones de Idioma";
        i18NActiveLanguageText = "Activo: Español";
        i18NInstalledLanguagesText = "Idiomas Instalados:";
        i18NStopButtonText = "Parada";
        i18NEnglishButtonText = "Inglés";
        i18NSpanishButtonText = "Español";
        i18NEnableLanguageInstructionsText = "Pulse el botón de idioma para activarlo o desactivarlo";
    }

    viewModel.set("i18NPageTitle", i18NPageTitle);
    viewModel.set("i18NLanguageOptionsTitle", i18NLanguageOptionsTitle);
    viewModel.set("i18NActiveLanguageText", i18NActiveLanguageText);
    viewModel.set("i18NStopButtonText", i18NStopButtonText);
    viewModel.set("i18NInstalledLanguagesText", i18NInstalledLanguagesText);
    viewModel.set("i18NEnglishButtonText", i18NEnglishButtonText);
    viewModel.set("i18NSpanishButtonText", i18NSpanishButtonText);
    viewModel.set("i18NEnableLanguageInstructionsText", i18NEnableLanguageInstructionsText);
}
