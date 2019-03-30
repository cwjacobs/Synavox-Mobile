import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData } from "tns-core-modules/data/observable";
import { NavigatedData, Page } from "tns-core-modules/ui/page";

import { WebView, LoadEventData } from "tns-core-modules/ui/web-view";
import { TextField } from "tns-core-modules/ui/text-field";
import * as dialogs from "tns-core-modules/ui/dialogs";

import { BrowseViewModel } from "./browse-view-model";
import { MedicineBinding } from "~/data-models/medicine-binding";

import * as Test from "../data-models/test-data";
import * as Utility from "../utility-functions/utility-functions";
import { ItemEventData } from "tns-core-modules/ui/list-view/list-view";

let page: Page = null;
let viewModel: BrowseViewModel = null;
let medicineList: MedicineBinding[] = null;

let i18NPageTitle: string = null;
let i18NMedicineListTitle: string = null;

export function onNavigatingTo(args: NavigatedData) {
    page = <Page>args.object;
    viewModel = new BrowseViewModel();
    page.bindingContext = viewModel;
}

export function onDrawerButtonTap(args: EventData) {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
}

export function onLoaded(args: EventData) {
    medicineList = Test.Dataset.getCurrentTestData();
    viewModel.set("myMedicineList", medicineList);

    // Set text to active language
    setActiveLanguageText();
}

export function onTap(args: ItemEventData) {
    alert("onWebViewLoaded");

    viewModel.set("webViewSrc", "https://www.drugs.com/lisinopril.html");
    submit(args);
};

export function onItemTap(args: ItemEventData) {
    alert("onWebViewLoaded");

    viewModel.set("webViewSrc", "https://www.drugs.com/lisinopril.html");
    submit(args);
};

export function onWebViewLoaded(webargs) {
    alert("onWebViewLoaded");

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
    alert("submit");

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
}
function setActiveLanguageText(): void {
    let activeLanguage: string = Utility.Language.getActiveLanguage();

    if (activeLanguage === "english") {
        i18NPageTitle = "Home Pharmacist";
        i18NMedicineListTitle = "My Medicines";
    }
    else {
        i18NPageTitle = "Casa Farmacéutico";
        i18NMedicineListTitle = "Mis Medicamentos";
    }

    viewModel.set("i18NPageTitle", i18NPageTitle);
    viewModel.set("i18NMedicineListTitle", i18NMedicineListTitle);
};
