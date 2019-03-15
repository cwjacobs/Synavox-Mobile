import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData, Observable } from "tns-core-modules/data/observable";
import { NavigatedData, Page } from "tns-core-modules/ui/page";
import { ListView } from "tns-core-modules/ui/list-view";

import { HomeViewModel } from "./home-view-model";
import { TestData } from "../data-models/test-data"

import { AudioPlayer } from '../audio-player/audio-player';

let viewModel: HomeViewModel = null;

export function onNavigatingTo(args: NavigatedData) {
    const page = <Page>args.object;
    viewModel = new HomeViewModel();
    page.bindingContext = viewModel;
}

export function onDrawerButtonTap(args: EventData) {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
}

export function onLoaded(args: EventData) {
    let testData = new TestData();
    viewModel.set("myMedicineList", testData.getStaticTestData());
}

export function onItemTap(args: EventData) {
    
    var eventName = args.eventName;

    const listView = <ListView>args.object;;
    console.dir(listView);

    console.dir(args);
    // let audioPlayer = new AudioPlayer();
    // audioPlayer.togglePlay();
}
