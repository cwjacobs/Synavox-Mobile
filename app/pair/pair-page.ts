import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData } from "tns-core-modules/data/observable";
import { NavigatedData, Page } from "tns-core-modules/ui/page";

import { PairViewModel } from "./pair-view-model";

let page: Page = null;
let viewModel: PairViewModel = null;

export function onNavigatingTo(args: NavigatedData) {
    page = <Page>args.object;
    viewModel = new PairViewModel(page);

    page.bindingContext = viewModel;
}

export function onLoaded(args: EventData) {
    viewModel.doStartTagListener();
};

export function onDrawerButtonTap(args: EventData) {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
};

export function onItemTap(args: EventData) {
};
