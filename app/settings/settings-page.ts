import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData } from "tns-core-modules/data/observable";
import { NavigatedData, Page } from "tns-core-modules/ui/page";

import { SettingsViewModel } from "./settings-view-model";

import { I18N } from "~/utilities/i18n";
import { AudioPlayer } from "~/audio-player/audio-player";
import { appRootI18N } from "~/app-root/app-root";

let page: Page = null;
let viewModel: SettingsViewModel = null;

// Page Text
let i18n = I18N.getInstance();

// Audio Playback
let audioPlayer = AudioPlayer.getInstance();

export function onNavigatingTo(args: NavigatedData) {
    page = <Page>args.object;
    viewModel = new SettingsViewModel();

    page.bindingContext = viewModel;
}

export function onNavigatingFrom(args: NavigatedData) {
    audioPlayer.stop();
}

export function onLoaded(args: NavigatedData) {
    if(i18n.activeLanguage.toLowerCase() === "english") {
        viewModel.set("isSpButtonEnabled", true);
        viewModel.set("isEnButtonEnabled", false);
    }
    else {
        viewModel.set("isEnButtonEnabled", true);
        viewModel.set("isSpButtonEnabled", false);

    }
    setI18N();
}

export function onEnglishTap(args: NavigatedData) {
    let isEnButtonEnabled: boolean = viewModel.get("isEnButtonEnabled");
    if (isEnButtonEnabled) {
        i18n.activeLanguage = "english";
        viewModel.set("isEnButtonEnabled", false);
        viewModel.set("isSpButtonEnabled", true);
        setI18N();
    }
}

export function onSpanishTap(args: NavigatedData) {
    let isSpButtonEnabled: boolean = viewModel.get("isSpButtonEnabled");
    if (isSpButtonEnabled) {
        i18n.activeLanguage = "spanish";
        viewModel.set("isSpButtonEnabled", false);
        viewModel.set("isEnButtonEnabled", true);
        setI18N();
    }
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
    viewModel.set("i18nInstalledLanguagesText", i18n.installedLanguageSetting);
    viewModel.set("i18nEnglishButtonText", i18n.english);
    viewModel.set("i18nSpanishButtonText", i18n.spanish);

    appRootI18N();
}
