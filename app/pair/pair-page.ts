import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData } from "tns-core-modules/data/observable";
import { NavigatedData, Page } from "tns-core-modules/ui/page";
import { ItemEventData } from "tns-core-modules/ui/list-view/list-view";

import { PairViewModel } from "./pair-view-model";
import { AudioPlayer } from "~/audio-player/audio-player";
import { MedicineBinding } from "../data-models/medicine-binding";
import { TestData } from "../data-models/test-data"

let medicineBindings: MedicineBinding[] = null;

let page: Page = null;
let viewModel: PairViewModel = null;

export function onNavigatingTo(args: NavigatedData) {
    page = <Page>args.object;
    viewModel = new PairViewModel(page);

    page.bindingContext = viewModel;
}

export function onLoaded(args: EventData) {
    let testData = new TestData();
    medicineBindings = testData.getStaticTestData();
    viewModel.set("myMedicineList", medicineBindings);

    viewModel.set("medicineName", "Atorvastatin");

    viewModel.doStartTagListener();
};

export function onDrawerButtonTap(args: EventData) {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
};

export function onPauseTap(args: EventData) {
    let audioPlayer: AudioPlayer = new AudioPlayer();
    AudioPlayer.pausePlay();
};

export function onItemTap(args: ItemEventData) {
    let medicineName = medicineBindings[args.index].medicineName;
    viewModel.set("medicineName", medicineName);
};

export function onSaveTap(args: ItemEventData) {
    let newBinding: MedicineBinding = new MedicineBinding();
    newBinding.tagId = viewModel.get("tagId");
    newBinding.medicineName = viewModel.get("medicineName");
    // alert(newBinding.tagId + " : " + newBinding.medicineName);

    let index: number = findIndex(newBinding.medicineName);
    // alert("index: " + index);

    if (index != -1) {
        newBinding.audioPath = medicineBindings[index].audioPath;
        medicineBindings[index] = newBinding;
    }
    else {
        let audioName: string = (newBinding.medicineName + ".mp3").toLowerCase();
        newBinding.audioPath = "~/audio/" + audioName;
        medicineBindings.push({
            tagId: newBinding.tagId,
            medicineName: newBinding.medicineName,
            audioPath: newBinding.audioPath
        });
    }
    viewModel.set("myMedicines", medicineBindings);
    
    // let medicineName = viewModel.get("medicineName");
    // medicineBindings[args.index].medicineName;
};

export function onCancelTap(args: ItemEventData) {
    viewModel.set("medicineName", "");
};


function findIndex(medicineName: string): number {
    let i: number = 0;
    let index: number = -1;
    medicineBindings.forEach(value => {
        if (value.medicineName === medicineName) {
            index = i;
        }
        else {
            i = i + 1;
        }
    })
    return index;
}
