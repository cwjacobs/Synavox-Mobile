import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData } from "tns-core-modules/data/observable";
import { topmost } from "tns-core-modules/ui/frame";
import { GridLayout } from "tns-core-modules/ui/layouts/grid-layout";

import { AppRootViewModel } from "./app-root-view-model";

let viewModel: AppRootViewModel = null;

// I-18-N
let i18NHome: string = null;
let i18NDose: string = null;
let i18NPair: string = null;
let i18NShare: string = null;
let i18NBrowse: string = null;
let i18NSearch: string = null;
let i18Settings: string = null;


export function onNavigatingTo(args: EventData): void {
}

export function onLoaded(args: EventData): void {
    const drawerComponent = <RadSideDrawer>args.object;
    viewModel = new AppRootViewModel();
    drawerComponent.bindingContext = viewModel;

    appRootI18N("english");
}

export function onNavigationItemTap(args: EventData): void {
    const component = <GridLayout>args.object;
    const componentRoute = component.get("route");
    const componentTitle = component.get("title");
    const bindingContext = <AppRootViewModel>component.bindingContext;

    bindingContext.selectedPage = componentTitle;

    topmost().navigate({
        moduleName: componentRoute,
        transition: {
            name: "fade"
        }
    });

    const drawerComponent = <RadSideDrawer>app.getRootView();
    drawerComponent.closeDrawer();
}

export function appRootI18N(activeLanguage: string): void {
    if (activeLanguage === "english") {
        i18NHome = "Home";
        i18NDose = "Dose";
        i18NPair = "Pair";
        i18NShare = "Share";
        i18NBrowse = "Browse";
        i18NSearch = "Search";
        i18Settings = "Settings";
    }
    else {
        i18NHome = "Casa";
        i18NDose = "Dosis";
        i18NPair = "Partido";
        i18NShare = "Compartir";
        i18NBrowse = "Navega";
        i18NSearch = "Búsqueda";
        i18Settings = "Configuración";
    }

    viewModel.set("i18NHome", i18NHome);
    viewModel.set("i18NDose", i18NDose);
    viewModel.set("i18NPair", i18NPair);
    viewModel.set("i18NShare", i18NShare);
    viewModel.set("i18NBrowse", i18NBrowse);
    viewModel.set("i18NSearch", i18NSearch);
    viewModel.set("i18Settings", i18Settings);
}

