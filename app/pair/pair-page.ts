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

let tagId: string = "";
let i18NPageTitle: string = null;
let i18NStopButtonText: string = null;
let i18NSaveButtonText: string = null;
let i18NCancelButtonText: string = null;
let i18NMedicineNameHint: string = null;

export function onNavigatingTo(args: NavigatedData) {
    page = <Page>args.object;
    viewModel = new PairViewModel();
    page.bindingContext = viewModel;
}

export function onLoaded(args: EventData) {
    medicineList = Test.Dataset.getCurrentTestData();
    viewModel.set("myMedicineList", medicineList);

    setI18N();
    viewModel.set("tagId", tagId);
    viewModel.set("medicineName", "");
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
    let medicineName = viewModel.get("medicineName");
    if (medicineName.length != 0) { // Current medicine name already bound, allow name selection from list but don't change tagId
        tagId = medicineList[args.index].tagId;
        viewModel.set("tagId", tagId);
        viewModel.set("isTagDiscovered", true);
    }
    medicineName = medicineList[args.index].medicineName;
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

    let index: number = findMedicineNameIndex(binding.medicineName);
    // alert("index: " + index);

    if (index != -1) { // Medicine Name found, replace current binding
        binding.audioPath = Utility.Language.getAudioPath(binding.medicineName);
        medicineList[index] = binding; // use the util functions to add data to array
    }
    else { // Medicine Name not found
        index = findTagIdIndex(binding.tagId);
        if (index != -1) { // Tag Id found, replace current binding
            binding.audioPath = Utility.Language.getAudioPath(binding.medicineName);
            medicineList[index] = binding; // use the util functions to add data to array
        }
        else { // Neither Medicine Name nor Tag Id found, add new binding
            binding.audioPath = Utility.Language.getAudioPath(binding.medicineName);

            page.bindingContext.myMedicineList.push({
                tagId: binding.tagId,
                medicineName: binding.medicineName,
                audioPath: binding.audioPath
            });
        }
    }
    const listView: ListView = page.getViewById<ListView>("medicineList");
    listView.refresh();

    viewModel.set("myMedicines", medicineList);
};

export function onCancelTap(args: ItemEventData) {
    viewModel.set("medicineName", "Atorvastatin");
};

export function pairPageSetTagId(tagId: string) {
    if (viewModel != null) {
        viewModel.set("tagId", tagId);
        viewModel.set("isTagDiscovered", true);

        let index: number = findTagIdIndex(tagId);
        if (index != -1) { // Tag binding exists, display medicine name
            viewModel.set("medicineName", medicineList[index].medicineName);
        }
        else { // New tag binding
            viewModel.set("medicineName", "");
            alert("New tag scanned, enter medicine name and press save...")
        }
    }
    else {
        alert("New tag, use Pair page to assign medicine name and audio");
    }
}

function findMedicineNameIndex(medicineName: string): number {
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

function findTagIdIndex(tagId: string): number {
    let i: number = 0;
    let index: number = -1;
    medicineList.forEach(value => {
        if (value.tagId === tagId) {
            index = i;
        }
        else {
            i = i + 1;
        }
    })
    return index;
}

function setI18N(): void {
    let activeLanguage: string = Utility.Language.getActiveLanguage();

    if (activeLanguage === "english") {
        i18NPageTitle = "Pair";
        i18NMedicineNameHint = "Enter Medicine Name";
        i18NStopButtonText = "Stop";
        i18NSaveButtonText = "Save";
        i18NCancelButtonText = "Cancel";
    }
    else {
        i18NPageTitle = "Partido";
        i18NMedicineNameHint = "Ingrese el nombre del medicamento";
        i18NStopButtonText = "Parada";
        i18NSaveButtonText = "Salvar";
        i18NCancelButtonText = "Cancelar";
    }

    viewModel.set("i18NPageTitle", i18NPageTitle);
    viewModel.set("i18NMedicineNameHint", i18NMedicineNameHint);
    viewModel.set("i18NStopButtonText", i18NStopButtonText);
    viewModel.set("i18NSaveButtonText", i18NSaveButtonText);
    viewModel.set("i18NCancelButtonText", i18NCancelButtonText);
}
