import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData } from "tns-core-modules/data/observable";
import { NavigatedData, Page } from "tns-core-modules/ui/page";

import { WebView, LoadEventData } from "tns-core-modules/ui/web-view";
import * as dialogs from "tns-core-modules/ui/dialogs";

import { XitionViewModel } from "~/xition/xition-view-model";
import { TextView } from "tns-core-modules/ui/text-view";

// import * as Test from "../data-models/test-data";
import { ItemEventData } from "tns-core-modules/ui/list-view/list-view";
import { topmost } from "tns-core-modules/ui/frame/frame";
import { AppRootViewModel } from "~/app-root/app-root-view-model";
import { I18N } from "~/utilities/i18n";

import { Settings } from "~/settings/settings";
let settings: Settings = Settings.getInstance();

import { AudioPlayer } from "~/audio-player/audio-player";
import { navigateTo } from "~/app-root/app-root";
let audioPlayer: AudioPlayer = AudioPlayer.getInstance();

let page: Page = null;
let viewModel: XitionViewModel = null;

let appRootContext: AppRootViewModel = null;
let isUserBrowsing: boolean;

// Page Text
let i18n = I18N.getInstance();

export function onTextViewLoaded(args) {
    // const textView: TextView = <TextView>args.object;
    // textView.on("textChange", (argstv) => {
    //     console.dir(argstv);
    // });
    setActiveLanguageText();
}

export function onNavigatingTo(args: NavigatedData) {
    page = <Page>args.object;
    viewModel = new XitionViewModel();
    page.bindingContext = viewModel;
}

export function onNavigatingFrom(args: NavigatedData) {
    audioPlayer.stop();
}

export function onDrawerButtonTap(args: EventData) {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
}

export function onLoaded(args: EventData) {
    viewModel.set("isL1", true);
    viewModel.set("isL2", false);
    viewModel.set("isL3", false);
    viewModel.set("isL4", false);

    setActiveLanguageText();
}

export function onNextL1Tap() {
    viewModel.set("isL1", false);
    viewModel.set("isL2", true);
    viewModel.set("isL3", false);
    viewModel.set("isL4", false);

}

// export function onNextL2Tap() {
//     viewModel.set("isL2", false);
//     viewModel.set("isL3", true);
// }

export function onNextL3Tap() {
    settings.isNewBinding = true;

    let pageTitle: string = "Pair";
    let pageRoute: string = "pair/pair-page";
    navigateTo(pageTitle, pageRoute);
}

export function onCancelTap() {
    onNoTap();
}

export function onBackL3Tap() {
    onNextL1Tap();
}

export function onNoTap() {
    settings.isNewBinding = false;

    let pageTitle: string = "Home";
    let pageRoute: string = "home/home-page";
    navigateTo(pageTitle, pageRoute);
}

export function onYesTap() {
    viewModel.set("isL1", false);
    viewModel.set("isL2", false);
    viewModel.set("isL3", true);
    viewModel.set("isL4", false);
}

export function onItemTap(args: ItemEventData) {
}

export function onWebViewLoaded(webargs) {
};

// changing WebView source
export function submit(args) {
} ``

export function onGoBackTap() {
}

export function onSaveTap() {
    alert(i18n.saved);
    // TBD: hook the actual current website and save as button property
}

function getTagIdText(tagId: string): string {
    let text: string = i18n.tagId + ": " + tagId;
    return text;
}

function setActiveLanguageText(): void {

    viewModel.set("i18nPageTitle", i18n.xitionPageTitle);
    viewModel.set("i18nSynavoxSubPageTitle", i18n.synavoxSubPageTitle);

    let tagIdText: string = getTagIdText(settings.currentTagId);
    viewModel.set("i18nNewTagId", tagIdText);

    viewModel.set("i18nNo", i18n.no);
    viewModel.set("i18nYes", i18n.yes);
    viewModel.set("i18nBack", i18n.back);
    viewModel.set("i18nNext", i18n.next);
    viewModel.set("i18nCancel", i18n.cancel);

    viewModel.set("editState", false);
    viewModel.set("i18nNewTagIntro_L1", i18n.newTagIntro_L1);
    viewModel.set("i18nNewTagIntro_L2", i18n.newTagIntro_L2);
    viewModel.set("i18nNewTagIntro_L3", i18n.newTagIntro_L3);
    viewModel.set("i18nNewTagIntro_L4", i18n.newTagIntro_L4);
    viewModel.set("i18nNewTagIntro_L5", i18n.newTagIntro_L5);
};

