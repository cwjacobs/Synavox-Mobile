import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData } from "tns-core-modules/data/observable";
import { NavigatedData, Page } from "tns-core-modules/ui/page";
import { ListView, ItemEventData } from "tns-core-modules/ui/list-view/list-view";

import { PairViewModel } from "./pair-view-model";
import { AudioPlayer } from "~/audio-player/audio-player";
import { MedicineBinding } from "../data-models/medicine-binding";

import * as Test from "../data-models/test-data";
import * as Utility from "../utility-functions/utility-functions";

let medicineList: MedicineBinding[] = null;

let page: Page = null;
let viewModel: PairViewModel = null;

export function onNavigatingTo(args: NavigatedData) {
    page = <Page>args.object;
    viewModel = new PairViewModel(page);

    page.bindingContext = viewModel;
}

export function onLoaded(args: EventData) {
    medicineList = Test.Dataset.getCurrentTestData();
    viewModel.set("myMedicineList", medicineList);
    viewModel.set("medicineName", "Atorvastatin");

    viewModel.doStartTagListener();
};

export function onDrawerButtonTap(args: EventData) {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
};

export function onStopTap(args: EventData) {
    let audioPlayer: AudioPlayer = new AudioPlayer();
    AudioPlayer.pausePlay();
};

export function onItemTap(args: ItemEventData) {
    let medicineName = medicineList[args.index].medicineName;
    viewModel.set("medicineName", medicineName);

    let audioPath = Utility.Language.getAudioPath(medicineName);
    AudioPlayer.useAudio(audioPath);
    AudioPlayer.togglePlay();
};

export function onSaveTap(args: ItemEventData) {
    let binding: MedicineBinding = new MedicineBinding();
    binding.tagId = viewModel.get("tagId");
    binding.medicineName = viewModel.get("medicineName");
    // alert(newBinding.tagId + " : " + newBinding.medicineName);

    let index: number = findIndex(binding.medicineName);
    // alert("index: " + index);

    if (index != -1) {
        binding.audioPath = Utility.Language.getAudioPath(binding.medicineName);
        medicineList[index] = binding; // use the util functions to add data to array
    }
    else {
        // let audioRootPath: string = "~/audio/";
        // let audioName: string = (binding.medicineName + ".mp3").toLowerCase();

        // let language: string = getCurrentLanguage();
        // if (language === "English") {
        //     audioRootPath += "en/"
        // }
        // else {
        //     audioRootPath += "sp/"
        // }

        binding.audioPath = Utility.Language.getAudioPath(binding.medicineName);
        
        page.bindingContext.myMedicineList.push({
            tagId: binding.tagId,
            medicineName: binding.medicineName,
            audioPath: binding.audioPath           
        });
    }
    const listView: ListView = page.getViewById<ListView>("medicineList");
    listView.refresh();

    viewModel.set("myMedicines", medicineList);
};

export function onCancelTap(args: ItemEventData) {
    viewModel.set("medicineName", "Atorvastatin");
};


function findIndex(medicineName: string): number {
    let i: number = 0;
    let index: number = -1;
    medicineList.forEach(value => {
        if (value.medicineName === medicineName) {
            index = i;
        }
        else {
            i = i + 1;
        }
    })
    return index;
}
