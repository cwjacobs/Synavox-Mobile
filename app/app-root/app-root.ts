import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData } from "tns-core-modules/data/observable";
import { topmost } from "tns-core-modules/ui/frame";
import { GridLayout } from "tns-core-modules/ui/layouts/grid-layout";

import { AppRootViewModel } from "./app-root-view-model";

import { I18N } from "~/utilities/i18n";

let viewModel: AppRootViewModel = null;

// I-18-N
let i18n = I18N.getInstance();

export function onNavigatingTo(args: EventData): void {
}

export function onLoaded(args: EventData): void {
    const drawerComponent = <RadSideDrawer>args.object;
    viewModel = new AppRootViewModel();
    drawerComponent.bindingContext = viewModel;
    
    appRootI18N();
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

export function appRootI18N(): void {
    viewModel.set("i18nHome", i18n.homeNav);
    viewModel.set("i18nDose", i18n.doseNav);
    viewModel.set("i18nPair", i18n.pairNav);
    viewModel.set("i18nShare", i18n.shareNav);
    viewModel.set("i18nBrowse", i18n.browseNav);
    viewModel.set("i18nWizard", i18n.wizardNav);
    viewModel.set("i18nSettings", i18n.settingsNav);
}

