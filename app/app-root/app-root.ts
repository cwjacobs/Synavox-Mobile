import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData } from "tns-core-modules/data/observable";
import { topmost } from "tns-core-modules/ui/frame";
import { GridLayout } from "tns-core-modules/ui/layouts/grid-layout";

import { AppRootViewModel } from "./app-root-view-model";

let viewModel: AppRootViewModel = null;

// I-18-N
let i18nHome: string = null;
let i18nDose: string = null;
let i18nPair: string = null;
let i18nShare: string = null;
let i18nBrowse: string = null;
let i18nSearch: string = null;
let i18nSettings: string = null;


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
        i18nHome = "Home";
        i18nDose = "Dose";
        i18nPair = "Pair";
        i18nShare = "Share";
        i18nBrowse = "Browse";
        i18nSearch = "Search";
        i18nSettings = "Settings";
    }
    else {
        i18nHome = "Pantalla de Inicio";
        i18nDose = "Dosis";
        i18nPair = "Partido";
        i18nShare = "Compartir";
        i18nBrowse = "Navega";
        i18nSearch = "Búsqueda";
        i18nSettings = "Configuración";
    }

    viewModel.set("i18nHome", i18nHome);
    viewModel.set("i18nDose", i18nDose);
    viewModel.set("i18nPair", i18nPair);
    viewModel.set("i18nShare", i18nShare);
    viewModel.set("i18nBrowse", i18nBrowse);
    viewModel.set("i18nSearch", i18nSearch);
    viewModel.set("i18nSettings", i18nSettings);
}

