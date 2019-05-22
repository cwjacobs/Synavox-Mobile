import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData } from "tns-core-modules/data/observable";
import { NavigatedData, Page } from "tns-core-modules/ui/page";
import { ListView, ItemEventData } from "tns-core-modules/ui/list-view/list-view";

import { PairViewModel } from "./pair-view-model";
import { MedicineBinding, MedicineBindingList } from "../data-models/medicine-binding";

// For Dialogs Branch
import { confirm } from "tns-core-modules/ui/dialogs";
import { RFID } from "~/utilities/rfid";
import { I18N } from "~/utilities/i18n";
import { Settings } from "~/settings/settings";
import { AudioPlayer } from "~/audio-player/audio-player";

import { navigateTo } from "~/app-root/app-root";

let rfid = RFID.getInstance();
let i18n = I18N.getInstance();
let settings: Settings = Settings.getInstance();
let audioPlayer: AudioPlayer = AudioPlayer.getInstance();

let page: Page = null;
let viewModel: PairViewModel = null;

let isTagIdLocked: boolean;

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
    audioPlayer.stop();
}

export function onDrawerButtonTap(args: EventData) {
    // Reset new tag management flag
    rfid.manageNewTag = false;

    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
};

export function onLoaded(args: EventData) {
    // Set audio buttons state
    viewModel.set("isAudioEnabled", settings.isAudioEnabled);

    // Current list of paired medications
    viewModel.set("myMedicineList", settings.medicineList.bindings);

    // Set text to active language
    setActiveLanguageText();

    if (rfid.manageNewTag) {
        console.log("rfid.tagScanned: " + rfid.tagScanned + " tagId: " + rfid.tagId);

        // We're here because an unpaired tag was scanned, let's walk the user through next steps...
        // rfid.manageNewTag = false;
        viewModel.set("currentTagId", rfid.tagId);
        alert(i18n.enterMedicneName);
    }
    else {
        if (settings.currentMedicine) {
            settings.currentTagId = settings.medicineList.getMedicineBindingByName(settings.currentMedicine).tagId;
            viewModel.set("currentTagId", settings.currentTagId);
            viewModel.set("currentMedicineName", settings.currentMedicine);
        }
    }
};

export function onItemTap(args: ItemEventData) {
    // Reset new tag management flag
    rfid.manageNewTag = false;

    settings.currentMedicine = settings.medicineList.bindings[args.index].medicineName;
    viewModel.set("currentMedicineName", settings.currentMedicine);

    if (!isTagIdLocked) {
        settings.currentTagId = settings.medicineList.bindings[args.index].tagId;
        viewModel.set("currentTagId", settings.currentTagId);
    }
};

export function onDeleteTap(args: ItemEventData) {
    audioPlayer.stop();

    let binding: MedicineBinding = new MedicineBinding();

    binding.tagId = viewModel.get("currentTagId");
    if (binding.tagId.length === 0) {
        alert(i18n.selectMedicineMsg);
        return;
    }

    binding.medicineName = viewModel.get("currentMedicineName");
    if (binding.medicineName.length === 0) {
        alert(i18n.selectMedicineMsg);
        return;
    }

    let confirmMsg: string = getParingUpdatConfirmMsg(binding.medicineName);
    confirm(confirmMsg).then((isConfirmed) => {
        if (isConfirmed) {
            let index: number = settings.medicineList.getMedicineBindingIndex(binding.medicineName);

            if (index != -1) { // Delete current binding
                settings.medicineList.bindings.splice(index, 1);
                viewModel.set("myMedicines", settings.medicineList);

                const listView: ListView = page.getViewById<ListView>("medicineList");
                listView.refresh();

                settings.currentMedicine = "";
            }
        }
    });
};

export function onSaveTap(args: ItemEventData) {
    let binding: MedicineBinding = new MedicineBinding();

    binding.medicineName = viewModel.get("currentMedicineName");
    if (!binding.medicineName) {
        alert(i18n.selectMedicineMsg);
        return;
    }

    binding.tagId = viewModel.get("currentTagId");
    if (!binding.tagId) {
        alert(i18n.enterTagIdMsg + binding.medicineName);
        return;
    }

    settings.currentMedicine = binding.medicineName;
    let index: number = settings.medicineList.getMedicineBindingIndex(binding.medicineName);

    if (index != -1) { // Replace current binding
        settings.medicineList.bindings[index] = binding; // use the util functions to add data to array
        alert(getPairingUpdatedMsg(binding.medicineName));
    }
    else {
        index = settings.medicineList.getMedicineBindingIndexByTagId(binding.tagId);
        if (index != -1) { // Replace current binding
            settings.medicineList.bindings[index] = binding; // use the util functions to add data to array
            alert(getPairingUpdatedMsg(binding.medicineName));
        }
        else { // Add new binding
            binding.dailyDoses = 0;
            binding.dailyRequiredDoses = 0;
            settings.medicineList.bindings.push(binding); // use the util function to add new binging to array
        }
    }
    viewModel.set("myMedicines", settings.medicineList);

    const listView: ListView = page.getViewById<ListView>("medicineList");
    listView.refresh();

    rfid.manageNewTag = true;
    const pageTitle = "Home";
    const pageRoute = "home/home-page";
    navigateTo(pageTitle, pageRoute);
}

export function onCancelTap(args: ItemEventData) {
    isTagIdLocked = false;
    viewModel.set("currentTagId", "");
    viewModel.set("currentMedicineName", "");
    audioPlayer.stop();
};

// Audio control functions
export function onPlayTap(args: ItemEventData) {
    if (settings.isAudioEnabled) {
        let medicineName: string = viewModel.get("currentMedicineName");
        if (!medicineName) {
            alert(i18n.selectMedicineMsg);
            return;
        }
        audioPlayer.play(medicineName);
    }
};

export function onStopTap(args: EventData) {
    audioPlayer.stop();
};

export function onAudioEnableTap(args: ItemEventData) {
    settings = Settings.getInstance();

    settings.isAudioEnabled = !settings.isAudioEnabled;
    viewModel.set("isAudioEnabled", settings.isAudioEnabled);
    if (!settings.isAudioEnabled) {
        audioPlayer.stop();
    }
};

export function onLogoTap(args: ItemEventData) {
    audioPlayer.play("default");
};


function setActiveLanguageText(): void {
    i18n = I18N.getInstance();

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