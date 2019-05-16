import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData } from "tns-core-modules/data/observable";
import { NavigatedData, Page, Color } from "tns-core-modules/ui/page";
import { ListView, ItemEventData } from "tns-core-modules/ui/list-view/list-view";
import { Label } from "tns-core-modules/ui/label/label";

import { HomeViewModel } from "./home-view-model";
import { AudioPlayer } from "~/audio-player/audio-player";

import * as Utility from "../utility-functions/utility-functions";

// For Dialogs Branch
import { confirm } from "tns-core-modules/ui/dialogs";
import { MedicineBinding, MedicineBindingList } from "~/data-models/medicine-binding";
import { Button } from "tns-core-modules/ui/button/button";

import { I18N } from "~/utilities/i18n";
let i18n: I18N = I18N.getInstance();

import { RFID } from "~/utilities/rfid";
let rfid: RFID = RFID.getInstance();

import { Dataset } from "~/data-models/test-data";
import { Settings } from "~/settings/settings";
let settings: Settings = Settings.getInstance();

// initialize app scope list of medicines from static test data
settings.medicineList = new MedicineBindingList(Dataset.testData);

// Page scope medicine lists, point local medicineList to shared datastore
let medicineList: MedicineBindingList = settings.medicineList;
let tempMedicineList: MedicineBindingList;

let page: Page = null;
let viewModel: HomeViewModel = null;

// Audio controls and buttons
let audioPlayer: AudioPlayer = AudioPlayer.getInstance();
let isAudioActive: boolean = false;
let isAudioEnabled: boolean = false;

// Editing buttons
let isEditingAvailable: boolean = false;
let isEditingDosesTakenToday: boolean = false;
let isEditingTotalDosesPerDay: boolean = false;

let primaryOn: string = "#3A53FF";
let primaryOff: string = "#c1c8f8";

let secondaryOn: string = "#398881";
let secondaryOff: string = "#a4cac7";

let alertOn: string = "#ff0000";
let alertOff: string = "#ffc8c8";

let dailyDoses_old: number = 0;
let dailyRequiredDoses_old: number = 0;

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
    viewModel = new HomeViewModel();
    page.bindingContext = viewModel;
}

export function onNavigatingFrom() {
    AudioPlayer.stop();
}

export function onDrawerButtonTap(args: EventData) {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
};

export function onLoaded(args: EventData) {
    // Current list of paired medications
    viewModel.set("myMedicineList", medicineList.bindings);

    // Get dose numbers for each medicine
    setTimeout(() => {
        displayCurrentListDoses();
    }, 500);

    if (audioPlayer === null) {
        audioPlayer = new AudioPlayer();
    }

    // Initialize editing buttons state
    isEditingAvailable = true;
    viewModel.set("isEditingAvailable", isEditingAvailable);

    isEditingDosesTakenToday = false;
    viewModel.set("isEditingDosesTakenToday", isEditingDosesTakenToday);
    let editDosesTakenTodayButton: Button = page.getViewById("edit-doses-taken-today");
    editDosesTakenTodayButton.backgroundColor = isEditingAvailable ? primaryOn : primaryOff;

    isEditingTotalDosesPerDay = false;
    viewModel.set("isEditingTotalDosesPerDay", isEditingTotalDosesPerDay);
    let editTotalDosesPerDayButton: Button = page.getViewById("edit-total-required-doses");
    editTotalDosesPerDayButton.backgroundColor = isEditingAvailable ? secondaryOn : secondaryOff;

    if (settings.isConfirmingDose) {
        viewModel.set("currentMedicineName", settings.currentMedicine);
        registerDoseTaken(settings.currentMedicine);
    }
    else {
        settings.currentMedicine = medicineList.getMedicineBindingByIndex(1).medicineName;
        viewModel.set("currentMedicineName", settings.currentMedicine);
        displayCurrentDoses();
    }
    displayDosesPerDayInstructions(medicineList.getDailyDosesRequired(settings.currentMedicine));

    // Listener is stopped at each page exit to avoid runing in background... nope. was thinking of audio...
    rfid.startTagListener();

    isAudioActive = false;
    isAudioEnabled = false;
    viewModel.set("isAudioEnabled", isAudioEnabled);

    // Set text to active language
    setActiveLanguageText();
    viewModel.set("isDualLanguageEnabled", i18n.isDualLanguageEnabled);
};

export function onChangeTotalDosesPerDayTap(args: EventData) {
    if ((isEditingAvailable) && (!isEditingDosesTakenToday)) {
        // Copy list to temp list for editing
        tempMedicineList = new MedicineBindingList(medicineList.bindings);

        isEditingTotalDosesPerDay = true;
        viewModel.set("isEditingTotalDosesPerDay", isEditingTotalDosesPerDay);

        let i18nSaveButtonText: string = getI18nSaveButtonText();
        viewModel.set("i18nSaveButtonText", i18nSaveButtonText);

        let i18nCancelButtonText: string = getI18nCancelButtonText();
        viewModel.set("i18nCancelButtonText", i18nCancelButtonText);

        let editDosesTakenTodayButton: Button = page.getViewById("edit-doses-taken-today");
        editDosesTakenTodayButton.backgroundColor = primaryOff;

        let medicineName: string = viewModel.get("currentMedicineName");
        let currentMedicineNameView: any = page.getViewById("current-medicine-name");
        currentMedicineNameView.color = secondaryOn;

        let doseIndicatorBaseId: string = "current";
        let dailyRequiredDoses: number = tempMedicineList.getDailyDosesRequired(medicineName);

        let maxDosesDisplayed: number = 6;
        for (let i = 1; i < maxDosesDisplayed; i++) {
            let doseIndicatorId: string = doseIndicatorBaseId + i.toString(10);
            let doseIndicator: any = page.getViewById<any>(doseIndicatorId);

            if (i <= dailyRequiredDoses) {
                doseIndicator.color = secondaryOn;
            }
            else {
                doseIndicator.color = secondaryOff;
            }
        }
    }
}

export function onSaveTotalDosesPerDayTap() {
    // Commit edits to doses per day

    medicineList = new MedicineBindingList(tempMedicineList.bindings);

    tempMedicineList = null;
    console.dir("medicineList: " + medicineList);
    console.dir("tempMedicineList: " + tempMedicineList);

    isEditingTotalDosesPerDay = false;
    viewModel.set("isEditingTotalDosesPerDay", isEditingTotalDosesPerDay);

    let editDosesTakenTodayButton: Button = page.getViewById("edit-doses-taken-today");
    editDosesTakenTodayButton.backgroundColor = primaryOn;

    let currentMedicineNameView: any = page.getViewById("current-medicine-name");
    currentMedicineNameView.color = primaryOn;

    displayCurrentDoses();
    displayCurrentListDoses();

    let medicineName: string = viewModel.get("currentMedicineName");
    displayDosesPerDayInstructions(medicineList.getDailyDosesRequired(medicineName));
    // setActiveLanguageText();
}

export function onCancelTotalDosesPerDayTap() {
    tempMedicineList = null;
    console.dir("medicineList: " + medicineList);
    console.dir("tempMedicineList: " + tempMedicineList);

    isEditingTotalDosesPerDay = false;
    viewModel.set("isEditingTotalDosesPerDay", isEditingTotalDosesPerDay);

    let editDosesTakenTodayButton: Button = page.getViewById("edit-doses-taken-today");
    editDosesTakenTodayButton.backgroundColor = primaryOn;

    let currentMedicineNameView: any = page.getViewById("current-medicine-name");
    currentMedicineNameView.color = primaryOn;

    displayCurrentDoses();
    displayCurrentListDoses();

    let medicineName: string = viewModel.get("currentMedicineName");
    displayDosesPerDayInstructions(medicineList.getDailyDosesRequired(medicineName));

    //setActiveLanguageText();
}

export function onChangeDosesTakenTodayTap(args: EventData) {
    if ((isEditingAvailable) && (!isEditingTotalDosesPerDay)) {
        // Copy list to temp list for editing
        tempMedicineList = new MedicineBindingList(medicineList.bindings);

        isEditingDosesTakenToday = true;
        viewModel.set("isEditingDosesTakenToday", isEditingDosesTakenToday);

        let i18nSaveButtonText: string = getI18nSaveButtonText();
        viewModel.set("i18nSaveButtonText", i18nSaveButtonText);

        let i18nCancelButtonText: string = getI18nCancelButtonText();
        viewModel.set("i18nCancelButtonText", i18nCancelButtonText);

        let editTotalDosesPerDayButton: Button = page.getViewById("edit-total-required-doses");
        editTotalDosesPerDayButton.backgroundColor = secondaryOff;

        let medicineName: string = viewModel.get("currentMedicineName");
        let currentMedicineNameView: any = page.getViewById("current-medicine-name");
        currentMedicineNameView.color = primaryOn;

        let doseIndicatorBaseId: string = "current";

        let dosesTakenToday: number = tempMedicineList.getDosesTakenToday(medicineName);
        let dailyDosesRequired: number = tempMedicineList.getDailyDosesRequired(medicineName);

        let maxDosesDisplayed: number = 6;
        for (let i = 1; i < maxDosesDisplayed; i++) {
            let doseIndicatorId: string = doseIndicatorBaseId + i.toString(10);
            let doseIndicator: any = page.getViewById<any>(doseIndicatorId);

            if (i <= dosesTakenToday) {
                if (i <= dailyDosesRequired) {
                    doseIndicator.color = primaryOn;
                }
                else {
                    doseIndicator.color = alertOn;
                }
            }
            else {
                if (i <= dailyDosesRequired) {
                    doseIndicator.color = primaryOff;
                }
                else {
                    doseIndicator.color = alertOff;
                }
            }
        }
    }
}

export function onSaveDosesTakenTodayTap() {
    // Save changes
    medicineList = new MedicineBindingList(tempMedicineList.bindings);

    tempMedicineList = null;

    isEditingDosesTakenToday = false;
    viewModel.set("isEditingDosesTakenToday", isEditingDosesTakenToday);

    let editTotalDosesPerDayButton: Button = page.getViewById("edit-total-required-doses");
    editTotalDosesPerDayButton.backgroundColor = secondaryOn;

    let currentMedicineNameView: any = page.getViewById("current-medicine-name");
    currentMedicineNameView.color = primaryOn;

    displayCurrentDoses();
    displayCurrentListDoses();

    let medicineName: string = viewModel.get("currentMedicineName");
    displayDosesPerDayInstructions(medicineList.getDailyDosesRequired(medicineName));

    //setActiveLanguageText();
}

export function onCancelDosesTakenTodayTap() {
    tempMedicineList = null;

    isEditingDosesTakenToday = false;
    viewModel.set("isEditingDosesTakenToday", isEditingDosesTakenToday);

    let editTotalDosesPerDayButton: Button = page.getViewById("edit-total-required-doses");
    editTotalDosesPerDayButton.backgroundColor = secondaryOn;

    let currentMedicineNameView: any = page.getViewById("current-medicine-name");
    currentMedicineNameView.color = primaryOn;

    displayCurrentDoses();
    displayCurrentListDoses();

    let medicineName: string = viewModel.get("currentMedicineName");
    displayDosesPerDayInstructions(medicineList.getDailyDosesRequired(medicineName));

    //setActiveLanguageText();
}

export function current1(args: ItemEventData) {
    let indicator: any = page.getViewById("current1");
    adjustDoses(indicator);
}

export function current2(args: ItemEventData) {
    let indicator: any = page.getViewById("current2");
    adjustDoses(indicator);
}

export function current3(args: ItemEventData) {
    let indicator: any = page.getViewById("current3");
    adjustDoses(indicator);
}

export function current4(args: ItemEventData) {
    let indicator: any = page.getViewById("current4");
    adjustDoses(indicator);
}

export function current5(args: ItemEventData) {
    let indicator: any = page.getViewById("current5");
    adjustDoses(indicator);
}

export function onItemTap(args: ItemEventData) {
    let medicineName: string = medicineList.bindings[args.index].medicineName;
    viewModel.set("currentMedicineName", medicineName);

    let currentMedicineNameView: any = page.getViewById("current-medicine-name");
    currentMedicineNameView.color = primaryOn;

    // Enable editing
    isEditingAvailable = true;

    isEditingDosesTakenToday = false;
    viewModel.set("isEditingDosesTakenToday", isEditingDosesTakenToday);
    let editDosesTakenTodayButton: Button = page.getViewById("edit-doses-taken-today");
    editDosesTakenTodayButton.backgroundColor = primaryOn;

    isEditingTotalDosesPerDay = false;
    viewModel.set("isEditingTotalDosesPerDay", isEditingTotalDosesPerDay);
    let editTotalDosesPerDayButton: Button = page.getViewById("edit-total-required-doses");
    editTotalDosesPerDayButton.backgroundColor = secondaryOn;

    // Get dose numbers for each medicine
    displayCurrentDoses();

    // Display dose instructions
    displayDosesPerDayInstructions(medicineList.bindings[args.index].dailyRequiredDoses);

    let audioPath = Utility.Language.getAudioPath(medicineName);
    AudioPlayer.useAudio(audioPath);
    if (isAudioEnabled) {
        AudioPlayer.play();
    }
};

// Audio control functions
export function onPlayTap(args: ItemEventData) {
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

function displayCurrentDoses() {
    let doseIndicatorIdBase: string = "current";
    let medicineName: string = viewModel.get("currentMedicineName");

    let dosesTakenToday: number = medicineList.getDosesTakenToday(medicineName);
    let dailyDosesRequired: number = medicineList.getDailyDosesRequired(medicineName);

    // Iterate over each display position
    let maxDosesDisplayed: number = 6;
    for (let i = 1; i < maxDosesDisplayed; i++) {
        // Get the view id for the current indicator
        let doseIndicatorId: string = doseIndicatorIdBase + i.toString(10);
        let doseIndicator: Label = page.getViewById(doseIndicatorId);

        if (i <= dailyDosesRequired) {
            // Has not taken too many
            if (i <= dosesTakenToday) {
                doseIndicator.color = new Color(primaryOn);
            }
            else {
                doseIndicator.color = new Color(primaryOff);
            }
        }
        else {
            if ((i > dailyDosesRequired) && (i <= dosesTakenToday)) {
                doseIndicator.color = new Color("red");
            }
            else {
                doseIndicator.color = new Color("white");
            }
        }
    }
}

function toggleIndicator(indicator: any): number {
    let adjustTotal: number = 0;
    let indicatorCurrentColor: string = indicator.color.toString().toLowerCase();

    if (isEditingDosesTakenToday) {
        if (indicatorCurrentColor === primaryOff.toLowerCase() || indicatorCurrentColor === alertOff.toLowerCase()) {
            adjustTotal = 1;
        }
        else {
            adjustTotal = -1;
        }
    }
    else if (isEditingTotalDosesPerDay) {
        if (indicatorCurrentColor === secondaryOff.toLowerCase()) {
            adjustTotal = 1;
        }
        else {
            adjustTotal = -1;
        }
    }
    return adjustTotal;
}

// Uses temp list because we're editing
function adustDailyDoseTaken(indicator: any): void {
    let medicineName: string = viewModel.get("currentMedicineName");

    let dosesTakenToday: number = tempMedicineList.getDosesTakenToday(medicineName);
    let dailyDosesRequired: number = tempMedicineList.getDailyDosesRequired(medicineName);

    let doseAdjustment: number = toggleIndicator(indicator);
    dosesTakenToday += doseAdjustment;

    console.log("dosesTakenToday: " + dosesTakenToday);
    console.log("dailyDosesRequired: " + dailyDosesRequired);

    let dose: number = getIndicatorDoseNumber(indicator.id);
    console.log("dose: " + dose);

    if (doseAdjustment === 1) {
        // Adding a dose
        if (dose <= dailyDosesRequired) {
            indicator.color = primaryOn;
            // console.log("primaryOn");
        }
        else {
            indicator.color = alertOn;
            // console.log("alertOn");
        }
    }
    else {
        // Subtracting a dose
        if (dose <= dailyDosesRequired) {
            indicator.color = primaryOff;
            console.log("primaryOff");
        }
        else {
            indicator.color = alertOff;
            console.log("alertOff");
        }
    }

    // Data store behind list is being updated, but we won't display it until save is pressed
    tempMedicineList.setDosesTakenToday(medicineName, dosesTakenToday);
    displayDosesTakenMsg(dosesTakenToday);
}

function getIndicatorDoseNumber(indicator: string): number {
    let dose: number = Number(indicator.slice(-1));
    return dose;
}

function adustDailyDoseRequirement(indicator: any) {
    let medicineName: string = viewModel.get("currentMedicineName");
    let dailyDosesRequired: number = tempMedicineList.getDailyDosesRequired(medicineName);

    if ((dailyDosesRequired >= 1) && (dailyDosesRequired <= 5)) {
        let adjustedDoses: number = toggleIndicator(indicator);
        dailyDosesRequired += adjustedDoses;

        if (adjustedDoses === 1) {
            indicator.color = secondaryOn;
        }
        else {
            indicator.color = secondaryOff;
        }

        // Data store behind list is being updated, but we won't display it until save is pressed
        tempMedicineList.setDailyDoseRequirement(medicineName, dailyDosesRequired);
        displayDosesPerDayInstructions(dailyDosesRequired);
    }
}

function adjustDoses(indicator: any): void {
    if (isEditingDosesTakenToday) {
        adustDailyDoseTaken(indicator);
    }
    else if (isEditingTotalDosesPerDay) {
        adustDailyDoseRequirement(indicator);
    }
    else {
        alert("we are not editing...");
    }
}

function displayCurrentListDoses() {
    // console.dir(medicineList);
    medicineList.bindings.forEach((medicine: MedicineBinding) => {
        let dosesTakenToday: number = medicine.dailyDoses;
        let doseIndicatorIdBase: string = medicine.medicineName;
        let dailyDosesRequired: number = medicine.dailyRequiredDoses;

        // Iterate over each display position
        let maxDosesDisplayed: number = 6;
        for (let i = 1; i < maxDosesDisplayed; i++) {
            // Get the view id for the current indicator
            let doseIndicatorId: string = doseIndicatorIdBase + i.toString(10);
            // console.log("doseIndicatorId: " + doseIndicatorId);

            let doseIndicator: any = page.getViewById<any>(doseIndicatorId);
            // console.dir("doseIndicator: " + doseIndicator);

            if (i <= dailyDosesRequired) {
                // Has not taken too many
                if (i <= dosesTakenToday) {
                    doseIndicator.color = primaryOn;
                }
                else {
                    doseIndicator.color = primaryOff;
                }
            }
            else {
                if ((i > dailyDosesRequired) && (i <= dosesTakenToday)) {
                    doseIndicator.color = new Color("red");
                }
                else {
                    doseIndicator.color = new Color("white");
                }
            }
        }
    })
}

function registerDoseTaken(medicineName: string): void {
    let confirmMsg: string = getI18NConfirmMsg(medicineName);
    confirm(confirmMsg).then((isConfirmed) => {
        if (isConfirmed) {
            let _activeMedicineList: MedicineBindingList;
            if (settings.isConfirmingDose) {
                // Scanned a tag if here
                _activeMedicineList = medicineList;
                settings.isConfirmingDose = false;
            }
            else {
                // User changing doses if here
                _activeMedicineList = tempMedicineList;
            }
            let dosesTakenToday = _activeMedicineList.getDosesTakenToday(medicineName);
            _activeMedicineList.setDosesTakenToday(medicineName, (dosesTakenToday + 1));
            displayCurrentDoses();
            displayCurrentListDoses();
        }
    });
}

function setActiveLanguageText(): void {
    viewModel.set("i18nPageTitle", i18n.dosePageTitle);

    viewModel.set("i18nMyMedicines", i18n.myMedicines);

    viewModel.set("i18nEditTotalDosesPerDayButtonText", i18n.changeDosesPerDay);

    viewModel.set("i18nEditDosesTakenTodayButtonText", i18n.changeDosesTaken);
}

function displayDosesTakenMsg(dosesTaken: number): void {
    let dosesTakenText = i18n.dosesTaken(dosesTaken);
    viewModel.set("i18nDailyInstructions", dosesTakenText);
}

function displayDosesPerDayInstructions(dosesPerDay: number): void {
    let dosesPerDayText = i18n.dosesPerDay(dosesPerDay);
    viewModel.set("i18nDailyInstructions", dosesPerDayText);
}

function getI18nSaveButtonText(): string {
    return i18n.save;
}

function getI18nCancelButtonText(): string {
    return i18n.cancel;
}

function getI18NConfirmMsg(medicineName: string): string {
    let confirmMsg: string = i18n.doseTakenConfirmMsg(medicineName);
    return confirmMsg;
}

