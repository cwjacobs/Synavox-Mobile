import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData } from "tns-core-modules/data/observable";
import { NavigatedData, Page } from "tns-core-modules/ui/page";
import { ListView, ItemEventData } from "tns-core-modules/ui/list-view/list-view";

import { PairViewModel } from "./pair-view-model";
import { MedicineBinding, MedicineCabinet } from "../data-models/medicine-cabinet";

// For Dialogs Branch
import { confirm } from "tns-core-modules/ui/dialogs";
import { RFID } from "~/utilities/rfid";
import { I18N } from "~/utilities/i18n";
import { Settings } from "~/settings/settings";
import { AudioPlayer } from "~/audio-player/audio-player";

import { navigateTo } from "~/app-root/app-root";
import { TextField } from "tns-core-modules/ui/text-field/text-field";
import { VR } from "~/utilities/vr";

let i18n = I18N.getInstance();
let settings: Settings = Settings.getInstance();
let audioPlayer: AudioPlayer = AudioPlayer.getInstance();

let page: Page = null;
let viewModel: PairViewModel = null;


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

export function onSpeechRecognition_pair(transcription: string) {
    const input: TextField = page.getViewById<TextField>("medicineName-input");
    input.text = capitalizeFirstLetter(transcription);
    settings.currentMedicineName = removeSpecialCharacters(input.text);
    viewModel.set("currentMedicineName", settings.currentMedicineName);
}

function removeSpecialCharacters(src: string): string {
    let dst: string = src.replace(/[^a-zA-Z]/g, "");
    return dst;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function onNavigatingTo(args: NavigatedData) {
    page = <Page>args.object;
    viewModel = new PairViewModel();
    page.bindingContext = viewModel;

    // if (!settings) {
    //     settings = Settings.getInstance();
    //     let settingsString: string = JSON.stringify(settings.currentMedicineCabinet);
    // }
}

export function onNavigatingFrom(args: NavigatedData) {
    audioPlayer.stop();
}

export function onDrawerButtonTap(args: EventData) {
    // Reset global new tag binding flag
    settings.isNewBinding = false;

    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
};

export function onLoaded(args: EventData) {
    settings = Settings.getInstance();
    settings.currentPage = "pair";

    if (settings.isNewBinding) {
        // Request medicine name
        // alert(i18n.enterPairMedicneName);
        setTimeout(() => {
            if (settings.isSpeechRecognitionAvailable) {
                VR.getInstance().startListening();
            }
        }, 1000);

        const input: TextField = page.getViewById<TextField>("medicineName-input");
        input.focus();
    }
    else {
        if (settings.currentMedicineName) {
            settings.currentTagId = settings.currentMedicineCabinet.getMedicineBinding(settings.currentMedicineName).tagId;
        }
    }

    // Update view-model settings
    updateViewModelGlobals();

    // Set text to active language
    setActiveLanguageText();
};

export function onItemTap(args: ItemEventData) {
    settings.currentMedicineName = settings.currentMedicineCabinet.medicines[args.index].medicineName;

    if (!settings.isNewBinding) {
        settings.currentTagId = settings.currentMedicineCabinet.medicines[args.index].tagId;
    }

    // Update view-model settings
    updateViewModelGlobals();

    setActiveLanguageText();
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

    let confirmMsg: string = getParingUpdateConfirmMsg(binding.medicineName);
    confirm(confirmMsg).then((isConfirmed) => {
        if (isConfirmed) {
            let index: number = settings.currentMedicineCabinet.getMedicineBindingIndex(binding.medicineName);

            if (index != -1) { // Delete current binding
                settings.currentMedicineCabinet.medicines.splice(index, 1);

                const listView: ListView = page.getViewById<ListView>("medicineList");
                listView.refresh();

                settings.currentMedicineName = "";

                // Update view-model settings
                updateViewModelGlobals();
            }
        }
    });
};

export function onSaveTap() {
    settings.isNewBinding = false; // Saved, so this will be complete now
    let binding: MedicineBinding = new MedicineBinding();

    // Use displayed medicine name
    binding.medicineName = viewModel.get("currentMedicineName");
    if (!binding.medicineName) {
        alert(i18n.selectMedicineMsg);
        return;
    }

    // Use displayed tagId
    binding.tagId = viewModel.get("currentTagId");
    if (!binding.tagId) {
        alert(i18n.enterTagIdMsg + binding.medicineName);
        return;
    }

    settings.currentMedicineName = binding.medicineName;
    let index: number = settings.currentMedicineCabinet.getMedicineBindingIndex(binding.medicineName);

    if (index != -1) { // Medicine Name not found, replace a current binding
        binding.dailyDoses = settings.currentMedicineCabinet.medicines[index].dailyDoses;
        binding.dailyRequiredDoses = settings.currentMedicineCabinet.medicines[index].dailyRequiredDoses;
        settings.currentMedicineCabinet.replaceMedicineBinding(index, binding);
        alert(getPairingUpdatedMsg(binding.medicineName));
    }
    else {
        index = settings.currentMedicineCabinet.getMedicineBindingIndexByTagId(binding.tagId);
        if (index != -1) { // Medicine Tag not found, replace a current binding
            binding.dailyDoses = settings.currentMedicineCabinet.medicines[index].dailyDoses;
            binding.dailyRequiredDoses = settings.currentMedicineCabinet.medicines[index].dailyRequiredDoses;
            settings.currentMedicineCabinet.replaceMedicineBinding(index, binding);
            alert(getPairingUpdatedMsg(binding.medicineName));
        }
        else { // Add new binding
            binding.dailyDoses = 0;
            binding.dailyRequiredDoses = 0;
            settings.currentMedicineCabinet.addMedicineBinding(binding);
            settings.isNewBinding = true;

            const pageTitle = "Home";
            const pageRoute = "home/home-page";
            navigateTo(pageTitle, pageRoute);
        }
    }

    // Update view-model settings
    updateViewModelGlobals();

    const listView: ListView = page.getViewById<ListView>("medicineList");
    listView.refresh();
}

export function onClearTap(args: ItemEventData) {
    settings.isNewBinding = false;
    settings.currentTagId = "";
    settings.currentMedicineName = "";

    // Update view-model settings
    updateViewModelGlobals();

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

function updateViewModelGlobals() {
    viewModel.set("isAudioEnabled", settings.isAudioEnabled);
    viewModel.set("medicineList", settings.currentMedicineCabinet.medicines);

    viewModel.set("currentTagId", settings.currentTagId);
    viewModel.set("currentMedicineName", settings.currentMedicineName);
}

function getPairedTagIdMsg(tagId: string): string {
    let msg: string;
    if (tagId === "-1") {
        msg = i18n.tagIsNotPairedText;
        viewModel.set("isTagPaired", false);
    }
    else {
        msg = i18n.pairedTagIdText;
        viewModel.set("isTagPaired", true);
    }
    return msg;
}

function setActiveLanguageText(): void {
    viewModel.set("i18nPageTitle", i18n.pairPageTitle);
    viewModel.set("i18nSynavoxSubPageTitle", i18n.synavoxSubPageTitle);
    viewModel.set("i18nMedicineCabinetOwner", settings.currentMedicineCabinet.ownerTitle);

    let i18nPairedTagIdMsg: string = getPairedTagIdMsg(viewModel.get("currentTagId"));
    viewModel.set("i18nPairedTagIdMsg", i18nPairedTagIdMsg);

    viewModel.set("i18nMedicineNameHint", i18n.pairMedicineNameHint);
    viewModel.set("i18nSaveButtonText", i18n.save);
    viewModel.set("i18nClearButtonText", i18n.clear);
    viewModel.set("i18nDeleteButtonText", i18n.delete);
}

function getPairingUpdatedMsg(medicineName: string): string {
    let confirmMsg: string = i18n.getParingUpdatedMsg(medicineName);
    return confirmMsg;
}

function getParingUpdateConfirmMsg(medicineName: string): string {
    let confirmMsg: string = i18n.getParingUpdateConfirmMsg(medicineName);
    return confirmMsg;
}