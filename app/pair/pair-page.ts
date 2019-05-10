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

// For Dialogs Branch
import { confirm } from "tns-core-modules/ui/dialogs";
import { I18N } from "~/utilities/i18n";
import { RFID } from "~/utilities/rfid";

let medicineList: MedicineBinding[] = null;

let page: Page = null;
let viewModel: PairViewModel = null;

let isTagIdLocked: boolean;

// Page Text
let i18n = I18N.getInstance();

// NFC access
let rfid = RFID.getInstance();

// Audio controls and buttons
let audioPlayer: AudioPlayer = AudioPlayer.getInstance();
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

export function onNavigatingFrom(args: NavigatedData) {
    AudioPlayer.stop();
}

export function onDrawerButtonTap(args: EventData) {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
};

export function onLoaded(args: EventData) {
    isAudioActive = false;
    isAudioEnabled = false;
    viewModel.set("isAudioEnabled", isAudioEnabled);

    if (rfid.newTagScanned) {
        console.log("rfid.tagScanned: " + rfid.tagScanned + " tagId: " + rfid.tagId);
        // We're here because an unpaired tag was scanned, let's walk the user through next steps...
        rfid.newTagScanned = false;
        viewModel.set("currentTagId", rfid.tagId);
        alert("Enter medicine name or select one from your list to replace a current pairing");
    }
    else {
        // Initialize "Curent" values blank
        viewModel.set("currentTagId", "");
        viewModel.set("currentMedicineName", "");
    }

    // Current list of paired medications
    medicineList = Test.Dataset.getCurrentTestData();
    viewModel.set("myMedicineList", medicineList);

    // Set text to active language
    setActiveLanguageText();
};

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

    let confirmMsg: string = getParingUpdatConfirmMsg(binding.medicineName);
    confirm(confirmMsg).then((isConfirmed) => {
        if (isConfirmed) {
            let index: number = findMedicineNameIndex(binding.medicineName);

            if (index != -1) { // Delete current binding
                medicineList.splice(index, 1);
            }

            const listView: ListView = page.getViewById<ListView>("medicineList");
            listView.refresh();
        }
    });
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
        medicineList[index] = binding;
        alert(getPairingUpdatedMsg(binding.medicineName));
    }
    else {
        index = findTagIdIndex(binding.tagId);
        if (index != -1) { // Replace current binding
            medicineList[index] = binding; // use the util functions to add data to array
        }
        else { // Add new binding
            page.bindingContext.myMedicineList.push({
                tagId: binding.tagId,
                medicineName: binding.medicineName,
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
    viewModel.set("i18nPageTitle", i18n.pairPageTitle);
    viewModel.set("i18nMedicineNameHint", i18n.pairMedicineNameHint);
    viewModel.set("i18nSaveButtonText", i18n.save);
    viewModel.set("i18nCancelButtonText", i18n.cancel);
    viewModel.set("i18nDeleteButtonText", i18n.delete);
}

function getPairingUpdatedMsg(medicineName: string): string {
    let confirmMsg: string = i18n.getParingUpdatedMsg(medicineName);
    return confirmMsg;
}

function getParingUpdatConfirmMsg(medicineName: string): string {
    let confirmMsg: string = i18n.getParingUpdatConfirmMsg(medicineName);
    return confirmMsg;
}