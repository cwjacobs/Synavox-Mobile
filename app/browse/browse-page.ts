import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData } from "tns-core-modules/data/observable";
import { NavigatedData, Page } from "tns-core-modules/ui/page";

import { WebView, LoadEventData } from "tns-core-modules/ui/web-view";

import { BrowseViewModel } from "./browse-view-model";

import { ItemEventData } from "tns-core-modules/ui/list-view/list-view";
import { topmost } from "tns-core-modules/ui/frame/frame";
import { AppRootViewModel } from "~/app-root/app-root-view-model";
import { I18N } from "~/utilities/i18n";

import { TestData } from "~/data-models/test-data";
import { Settings } from "~/settings/settings";
import { AudioPlayer } from "~/audio-player/audio-player";

import * as dialog from "tns-core-modules/ui/dialogs";

let settings: Settings = Settings.getInstance();
let audioPlayer: AudioPlayer = AudioPlayer.getInstance();

let page: Page = null;
let viewModel: BrowseViewModel = null;

let appRootContext: AppRootViewModel = null;
let isUserBrowsing: boolean;

let column: number = null;
let medicineName: string = null;

// Page Text
let i18n = I18N.getInstance();

export function onNavigatingTo(args: NavigatedData) {
    page = <Page>args.object;
    viewModel = new BrowseViewModel();
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
    if (appRootContext == null) {
        appRootContext = new AppRootViewModel();
    }

    isUserBrowsing = false;
    viewModel.set("isUserBrowsing", isUserBrowsing);
    viewModel.set("medicineList", settings.currentMedicineCabinet.medicines);

    // Set text to active language
    setActiveLanguageText();
}

export function onItemTap(args: ItemEventData) {
    let button: any = args.object;

    column = button.id.substring(0, 1);
    medicineName = button.id.substring(1);

    let wvsMedicineSrc: string = TestData.getResourceURL(medicineName, column);
    if (!wvsMedicineSrc) {
        wvsMedicineSrc = TestData.getDefaultURL(medicineName);
    }

    if (Settings.isDebugBuild) {
        console.log(wvsMedicineSrc);
    }
    viewModel.set("webViewSrc", wvsMedicineSrc);
    submit(args);

    isUserBrowsing = true;
    viewModel.set("isUserBrowsing", isUserBrowsing);
}

export function onWebViewLoaded(webargs) {
    const page: Page = <Page>webargs.object.page;
    const vm = page.bindingContext;
    const webview: WebView = <WebView>webargs.object;
    vm.set("result", "WebView is still loading...");
    vm.set("enabled", false);

    webview.on(WebView.loadFinishedEvent, (args: LoadEventData) => {
        let message = "";
        if (Settings.isDebugBuild) {
            if (!args.error) {
                message = `WebView finished loading of ${args.url}`;
            } else {
                message = `Error loading ${args.url} : ${args.error}`;
            }
        }

        vm.set("result", message);
        if (Settings.isDebugBuild) {
            console.log(`WebView message - ${message}`);
        }
    });
};

// changing WebView source
export function submit(args) {
    const text = viewModel.get("webViewSrc");

    viewModel.set("enabled", false);
    if (text.substring(0, 4) === "http") {
        viewModel.set("webViewSrc", text);
        //textField.dismissSoftInput();
    } else {
        dialog.alert("Please, add `http://` or `https://` in front of the URL string")
            .then(() => {
                if (Settings.isDebugBuild) {
                    console.log("Dialog closed!");
                }
            });
    }
} ``

export function onGoBackTap() {
    const componentRoute = "browse/browse-page";
    const componentTitle = "Browse";

    appRootContext.selectedPage = componentTitle;

    topmost().navigate({
        moduleName: componentRoute,
        transition: {
            name: "fade"
        }
    });
}

// Does not actual work...
export function onSaveTap() {
    // alert(i18n.saved);
    const text = viewModel.get("webViewSrc");

    dialog.alert({
        title: i18n.saved,
        message: medicineName + " " + i18n.bookmarkUpdatedMsg,
        okButtonText: i18n.ok,
    })

    // TBD: hook the actual current website and save as button property
}

let trumpOn: boolean = false;
export function onLogoTap() {
    if (!trumpOn) {
        let magaDoses: number = settings.currentMedicineCabinet.getDailyDosesRequired("TRUMP");
        if (magaDoses === 5) {
            trumpOn = true;
            audioPlayer.playFrom("~/audio/en/rally.mp3");
        }
    }
    else {
        trumpOn = false;
        audioPlayer.stop();
    }
}

function setActiveLanguageText(): void {
    viewModel.set("i18nPageTitle", i18n.browsePageTitle);
    viewModel.set("i18nSynavoxSubPageTitle", i18n.synavoxSubPageTitle);

    viewModel.set("i18nMedicineListTitle", settings.currentMedicineCabinet.ownerTitle);
    viewModel.set("i18nBackButtonText", i18n.browseBack);
    viewModel.set("i18nSaveButtonText", i18n.browseSave);
};

