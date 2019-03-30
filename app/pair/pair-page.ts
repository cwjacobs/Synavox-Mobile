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
import { Nfc, NfcTagData } from "nativescript-nfc";

let medicineList: MedicineBinding[] = null;

let page: Page = null;
let viewModel: PairViewModel = null;

let nfc: Nfc = null;
let isTagIdLocked: boolean;
let audioPlayer: AudioPlayer = null;

// Page text
let i18NPageTitle: string = null;
let i18NMedicineNameHint: string = null;

// Page control buttons
let i18NSaveButtonText: string = null;
let i18NCancelButtonText: string = null;
let i18NDeleteButtonText: string = null;

// Audio controls and buttons
let isAudioActive: boolean = false;
let isAudioEnabled: boolean = false;


/***
 * Pairing VM states:
 * 
 *  New tag scanned (pairing in progress)
 *      -- Display and lock new tagId (isTagIdLocked = true)
 *      -- Clear medicine name
 *      -- Allow medicine name to be entered or selected from list
 *
 *  Existing tag scanned (pairing in progress)
 *      -- Display tagId
 *      -- Display associated medicine name
 *      -- Play associated audio
 *
 *  Existing tag scanned (pairing not in progress)
 *      -- Display tagId
 *      -- Display associated medicine name
 *      -- Play associated audio
 *
 ***/

export function onNavigatingTo(args: NavigatedData) {
    page = <Page>args.object;
    viewModel = new PairViewModel();
    page.bindingContext = viewModel;
}

export function onDrawerButtonTap(args: EventData) {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
};

export function onLoaded(args: EventData) {
    if (nfc === null) {
        nfc = new Nfc();
    }

    if (audioPlayer === null) {
        audioPlayer = new AudioPlayer();
    }

    isAudioActive = false;
    isAudioEnabled = false;
    viewModel.set("isAudioEnabled", isAudioEnabled);

    // Initialize "Curent" values blank
    viewModel.set("currentTagId", "");
    viewModel.set("currentMedicineName", "");

    // Current list of paired medications
    medicineList = Test.Dataset.getCurrentTestData();
    viewModel.set("myMedicineList", medicineList);

    // Set text to active language
    setActiveLanguageText();

    // Start the rfid (nfc) tag listener
    nfc.setOnTagDiscoveredListener((args: NfcTagData) => onTagDiscoveredListener(args));
};

function onTagDiscoveredListener(nfcTagData: NfcTagData) {
    isTagIdLocked = false;
    let tagId: string = Utility.Helpers.formatTagId(nfcTagData.id);
    viewModel.set("currentTagId", tagId);

    // See if medicine with this tag already exists in the myMedicineList
    let index: number = findTagIdIndex(tagId);
    if (index != -1) { // existing tag found, display associated medicine name
        let medicineName: string = medicineList[index].medicineName;
        viewModel.set("currentMedicineName", medicineName);

        let audioPath = Utility.Language.getAudioPath(medicineName);
        AudioPlayer.useAudio(audioPath);
        if (isAudioEnabled) {
            AudioPlayer.play();
        }
    }
    else { // New tag, lock tagId display
        isTagIdLocked = true;
        viewModel.set("currentMedicineName", "");
    }
}

export function onNavigatingFrom() {
    // Remove this page's listener
    nfc.setOnTagDiscoveredListener(null);
}

export function onItemTap(args: ItemEventData) {
    let medicineName: string = medicineList[args.index].medicineName;
    viewModel.set("currentMedicineName", medicineName);

    if (!isTagIdLocked) {
        viewModel.set("currentTagId", medicineList[args.index].tagId);
    }

    let audioPath = Utility.Language.getAudioPath(medicineName);
    AudioPlayer.useAudio(audioPath);
    if (isAudioEnabled) {
        AudioPlayer.play();
    }
};

export function onDeleteTap(args: ItemEventData) {
    let binding: MedicineBinding = new MedicineBinding();

    binding.tagId = viewModel.get("currentTagId");
    if (binding.tagId.length === 0) {
        alert("No valid tag id...");
        return;
    }

    binding.medicineName = viewModel.get("currentMedicineName");
    if (binding.medicineName.length === 0) {
        alert("No medicine name...");
        return;
    }

    let index: number = findMedicineNameIndex(binding.medicineName);

    if (index != -1) { // Delete current binding
        medicineList.splice(index, 1);
        alert("medicine deleted from list")
    }

    const listView: ListView = page.getViewById<ListView>("medicineList");
    listView.refresh();

    viewModel.set("myMedicines", medicineList);
};

export function onSaveTap(args: ItemEventData) {
    let binding: MedicineBinding = new MedicineBinding();

    binding.tagId = viewModel.get("currentTagId");
    if (binding.tagId.length === 0) {
        alert("No valid tag id...");
        return;
    }

    binding.medicineName = viewModel.get("currentMedicineName");
    if (binding.medicineName.length === 0) {
        alert("No medicine name...");
        return;
    }

    let index: number = findMedicineNameIndex(binding.medicineName);

    if (index != -1) { // Replace current binding
        binding.audioPath = Utility.Language.getAudioPath(binding.medicineName);
        medicineList[index] = binding;
        alert("medicine replaced in list")
    }
    else {
        index = findTagIdIndex(binding.tagId);
        if (index != -1) { // Replace current binding
            binding.audioPath = Utility.Language.getAudioPath(binding.medicineName);
            medicineList[index] = binding; // use the util functions to add data to array
        }
        else { // Add new binding
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
}

export function onCancelTap(args: ItemEventData) {
    isTagIdLocked = false;
    viewModel.set("currentTagId", "");
    viewModel.set("currentMedicineName", "");
};

// Audio control functions
export function onPlayTap(args: ItemEventData) {
    let tagId: string = viewModel.get("currentTagId");
    if (tagId.length === 0) {
        alert("No valid tag id...");
        return;
    }

    let medicineName: string = viewModel.get("currentMedicineName");
    if (medicineName.length === 0) {
        alert("No medicine name...");
        return;
    }

    AudioPlayer.togglePlay();
    isAudioActive = !isAudioActive;
};

export function onStopTap(args: EventData) {
    AudioPlayer.pause();
    isAudioActive = false;

    // Forces audio to restart on next play
    let medicineName = viewModel.get("currentMedicineName");
    let audioPath = Utility.Language.getAudioPath(medicineName);
    AudioPlayer.useAudio(audioPath);
};

export function onAudioEnableTap(args: ItemEventData) {
    isAudioEnabled = !isAudioEnabled;
    viewModel.set("isAudioEnabled", isAudioEnabled);

    AudioPlayer.pause();
    isAudioActive = false;

    let medicineName = viewModel.get("currentMedicineName");
    let audioPath = Utility.Language.getAudioPath(medicineName);
    AudioPlayer.useAudio(audioPath);
};

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

function setActiveLanguageText(): void {
    let activeLanguage: string = Utility.Language.getActiveLanguage();

    if (activeLanguage === "english") {
        i18NPageTitle = "Pair";
        i18NMedicineNameHint = "Enter Medicine Name";
        i18NDeleteButtonText = "Delete";
        i18NSaveButtonText = "Save";
        i18NCancelButtonText = "Cancel";

    }
    else {
        i18NPageTitle = "Partido";
        i18NMedicineNameHint = "Ingrese el nombre del medicamento";
        i18NDeleteButtonText = "Eliminar";
        i18NSaveButtonText = "Salvar";
        i18NCancelButtonText = "Cancelar";
    }

    viewModel.set("i18NPageTitle", i18NPageTitle);
    viewModel.set("i18NMedicineNameHint", i18NMedicineNameHint);
    viewModel.set("i18NSaveButtonText", i18NSaveButtonText);
    viewModel.set("i18NCancelButtonText", i18NCancelButtonText);
    viewModel.set("i18NDeleteButtonText", i18NDeleteButtonText);
}
