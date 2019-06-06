import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData } from "tns-core-modules/data/observable";
import { NavigatedData, Page } from "tns-core-modules/ui/page";

import { WebView, LoadEventData } from "tns-core-modules/ui/web-view";
import * as dialogs from "tns-core-modules/ui/dialogs";

import { BrowseViewModel } from "./browse-view-model";
import { MedicineCabinet } from "~/data-models/medicine-cabinet";

// import * as Test from "../data-models/test-data";
import { ItemEventData } from "tns-core-modules/ui/list-view/list-view";
import { topmost } from "tns-core-modules/ui/frame/frame";
import { AppRootViewModel } from "~/app-root/app-root-view-model";
import { I18N } from "~/utilities/i18n";

import { TestData } from "~/data-models/test-data";
let testData: TestData = new TestData();

import { Settings } from "~/settings/settings";
let settings: Settings = Settings.getInstance();

import { AudioPlayer } from "~/audio-player/audio-player";
let audioPlayer: AudioPlayer = AudioPlayer.getInstance();

let page: Page = null;
let viewModel: BrowseViewModel = null;

let appRootContext: AppRootViewModel = null;
let isUserBrowsing: boolean;
let webViewSrcModel = null;

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
    viewModel.set("myMedicineList", settings.currentMedicineCabinet.medicines);

    // Set text to active language
    setActiveLanguageText();
}

export function onItemTap(args: ItemEventData) {
    let button: any = args.object;

    let column: number = button.id.substring(0, 1);
    let medicineName: string = button.id.substring(1);

    // webViewSrcModel = testData.webViewSrcArray;
    // let index: number = settings.currentMedicineCabinet.getMedicineBindingIndex(medicineName);
    // let wvsMedicineSrc: string = webViewSrcModel[index].srcLinks[column].webViewSrc;
    let wvsMedicineSrc: string = TestData.getResourceURL(medicineName, column);

    viewModel.set("webViewSrc", wvsMedicineSrc);
    submit(args);

    isUserBrowsing = true;
    viewModel.set("isUserBrowsing", isUserBrowsing);
};

export function onWebViewLoaded(webargs) {
    const page: Page = <Page>webargs.object.page;
    const vm = page.bindingContext;
    const webview: WebView = <WebView>webargs.object;
    vm.set("result", "WebView is still loading...");
    vm.set("enabled", false);

    webview.on(WebView.loadFinishedEvent, (args: LoadEventData) => {
        let message = "";
        if (!args.error) {
            message = `WebView finished loading of ${args.url}`;
        } else {
            message = `Error loading ${args.url} : ${args.error}`;
        }

        vm.set("result", message);
        console.log(`WebView message - ${message}`);
    });
};

// changing WebView source
export function submit(args) {
    // alert("submit");

    // const page: Page = <Page>args.object.page;
    // const vm = page.bindingContext;
    // const textField: TextField = <TextField>args.object;
    // const text = textField.text;
    const text = viewModel.get("webViewSrc");

    viewModel.set("enabled", false);
    if (text.substring(0, 4) === "http") {
        viewModel.set("webViewSrc", text);
        //textField.dismissSoftInput();
    } else {
        dialogs.alert("Please, add `http://` or `https://` in front of the URL string")
            .then(() => {
                console.log("Dialog closed!");
            });
    }
}``

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

export function onSaveTap() {
    alert(i18n.saved);
    // TBD: hook the actual current website and save as button property
}

function setActiveLanguageText(): void {
    viewModel.set("i18nPageTitle", i18n.browsePageTitle);
    viewModel.set("i18nSynavoxSubPageTitle", i18n.synavoxSubPageTitle);

    viewModel.set("i18nMedicineListTitle", settings.currentMedicineCabinet.ownerTitle);
    viewModel.set("i18nBackButtonText", i18n.browseBack);
    viewModel.set("i18nSaveButtonText", i18n.browseSave);

};

