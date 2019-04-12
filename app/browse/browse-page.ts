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

let webViewSrcModel = null;

let i18NPageTitle: string = null;
let i18NMedicineListTitle: string = null;
let i18NEditButtonText: string = null;
let i18NSaveButtonText: string = null;

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
    // alert("onTap");

    let button: any = args.object;
    // alert(button.text);
    // alert("id = " + button.id);

    let column: number = button.id.substring(0, 1);
    let medicineName: string = button.id.substring(1);
    // alert("column = " + column);
    // alert("medicineName = " + medicineName);

    webViewSrcModel = Test.Dataset.getWebViewSrcArray();
    let wvsMedicineNameIndex: number = findMedicineNameIndex(medicineName);
    let wvsMedicineName: string = webViewSrcModel[wvsMedicineNameIndex].medicineName;
    // alert("wvsMedicineName = " + wvsMedicineName);
    let wvsMedicineSrc: string = webViewSrcModel[wvsMedicineNameIndex].srcLinks[column].webViewSrc;
    // alert("wvsMedicineSrc = " + wvsMedicineSrc);


    viewModel.set("webViewSrc", wvsMedicineSrc);
    submit(args);
};

export function onItemTap(args: ItemEventData) {
    // alert("onItemTap");

    viewModel.set("webViewSrc", "https://www.drugs.com/lisinopril.html");
    //submit(args);
};

export function onWebViewLoaded(webargs) {
    // alert("onWebViewLoaded");

    const page: Page = <Page>webargs.object.page;
    const vm = page.bindingContext;
    const webview: WebView = <WebView>webargs.object;
    // vm.set("result", "WebView is still loading...");
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

        // alert(message);
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
}

function setActiveLanguageText(): void {
    let activeLanguage: string = Utility.Language.getActiveLanguage();

    if (activeLanguage === "english") {
        i18NPageTitle = "Browse";
        i18NMedicineListTitle = "My Medicines";
        i18NEditButtonText = "Edit";
        i18NSaveButtonText = "Save";

    }
    else {
        i18NPageTitle = "Navega";
        i18NMedicineListTitle = "Mis Medicamentos";
        i18NEditButtonText = "Editar";
        i18NSaveButtonText = "Salvar";
}

    viewModel.set("i18NPageTitle", i18NPageTitle);
    viewModel.set("i18NMedicineListTitle", i18NMedicineListTitle);
    viewModel.set("i18NEditButtonText", i18NEditButtonText);
    viewModel.set("i18NSaveButtonText", i18NSaveButtonText);
};

function findMedicineNameIndex(medicineName: string): number {
    let i: number = 0;
    let index: number = -1;
    webViewSrcModel.forEach(value => {
        if (value.medicineName === medicineName) {
            index = i;
        }
        else {
            i = i + 1;
        }
    })
    return index;
}

