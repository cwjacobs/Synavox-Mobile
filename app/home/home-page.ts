import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData } from "tns-core-modules/data/observable";
import { NavigatedData, Page, Color } from "tns-core-modules/ui/page";
import { ItemEventData } from "tns-core-modules/ui/list-view/list-view";
import { Label } from "tns-core-modules/ui/label/label";
import { HomeViewModel } from "./home-view-model";
import { confirm } from "tns-core-modules/ui/dialogs";
import { MedicineBinding, MedicineBindingList } from "~/data-models/medicine-binding";
import { Button } from "tns-core-modules/ui/button/button";

import { I18N } from "~/utilities/i18n";
import { RFID } from "~/utilities/rfid";
import { Dataset } from "~/data-models/test-data";
import { Settings } from "~/settings/settings";
import { AudioPlayer } from "~/audio-player/audio-player";
import { VR } from "~/utilities/vr";

//let vr: VR = VR.getInstance(); // Will set settings._isSpeechRecognitionAvailable in private constructor.

let i18n: I18N = I18N.getInstance();
let audioPlayer: AudioPlayer = AudioPlayer.getInstance();

// Init default app Settings
let settings: Settings = Settings.getInstance();
settings.isAudioEnabled = true;
settings.medicineList = new MedicineBindingList(Dataset.testData);

// NFC tag methods
let rfid: RFID = RFID.getInstance();

// Page scope medicine lists, point local medicineList to shared datastore
let tempMedicineList: MedicineBindingList;

let page: Page = null;
let viewModel: HomeViewModel = null;

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

// export function onLogoTap(args: EventData) {
//     if(settings.isSpeechRecognitionAvailable) {
//         // let audioPath: string = "~/audio/sounds/success.mp3";
//         // audioPlayer.playFrom(audioPath);
//         vr.startListening();
//     }
// }

export function onNavigatingTo(args: NavigatedData) {
    page = <Page>args.object;
    viewModel = new HomeViewModel();
    page.bindingContext = viewModel;
}

export function onNavigatingFrom() {
    audioPlayer.stop();
}

export function onDrawerButtonTap(args: EventData) {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
};

export function onLoaded(args: EventData) {
    // Get dose numbers for each medicine
    setTimeout(() => {
        displayCurrentListDoses();
    }, 500);

    // Current list of paired medications
    viewModel.set("isAudioEnabled", settings.isAudioEnabled);
    viewModel.set("myMedicineList", settings.medicineList.bindings);

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

    if (!settings.currentMedicine) {
        settings.currentMedicine = settings.medicineList.getMedicineBindingByIndex(1).medicineName;
    }
    viewModel.set("currentMedicineName", settings.currentMedicine);

    if (settings.isConfirmingDose) {
        registerDoseTaken(settings.currentMedicine);
    }
    else {
        displayCurrentDoses();
    }

    displayDosesPerDayInstructions(settings.medicineList.getDailyDosesRequired(settings.currentMedicine));

    // Set text to active language
    setActiveLanguageText();

    // startTagListener checks if listener is active before starting
    rfid.startTagListener();
};

export function onChangeTotalDosesPerDayTap(args: EventData) {
    changeTotalDosesPerDay();
}

export function onSaveTotalDosesPerDayTap() {
    settings.medicineList = new MedicineBindingList(tempMedicineList.bindings);

    tempMedicineList = null;
    console.dir("medicineList: " + settings.medicineList);
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
    displayDosesPerDayInstructions(settings.medicineList.getDailyDosesRequired(medicineName));
}

export function onCancelTotalDosesPerDayTap() {
    tempMedicineList = null;
    console.dir("medicineList: " + settings.medicineList);
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
    displayDosesPerDayInstructions(settings.medicineList.getDailyDosesRequired(medicineName));
}

export function onChangeDosesTakenTodayTap(args: EventData) {
    if ((isEditingAvailable) && (!isEditingTotalDosesPerDay)) {
        // Copy list to temp list for editing
        tempMedicineList = new MedicineBindingList(settings.medicineList.bindings);

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
    settings.medicineList = new MedicineBindingList(tempMedicineList.bindings);

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
    displayDosesPerDayInstructions(settings.medicineList.getDailyDosesRequired(medicineName));
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
    displayDosesPerDayInstructions(settings.medicineList.getDailyDosesRequired(medicineName));
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
    let medicineName: string = settings.medicineList.bindings[args.index].medicineName;
    settings.currentMedicine = medicineName;
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
    displayDosesPerDayInstructions(settings.medicineList.bindings[args.index].dailyRequiredDoses);

    if (settings.isAudioEnabled) {
        audioPlayer.play(medicineName);
    }
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
    settings.isAudioEnabled = !settings.isAudioEnabled;
    viewModel.set("isAudioEnabled", settings.isAudioEnabled);

    if (!settings.isAudioEnabled) {
        audioPlayer.stop();
    }
};

function changeTotalDosesPerDay() {
    if ((isEditingAvailable) && (!isEditingDosesTakenToday)) {
        // Copy list to temp list for editing
        tempMedicineList = new MedicineBindingList(settings.medicineList.bindings);

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

function displayCurrentDoses() {
    let doseIndicatorIdBase: string = "current";
    let medicineName: string = viewModel.get("currentMedicineName");

    let dosesTakenToday: number = settings.medicineList.getDosesTakenToday(medicineName);
    let dailyDosesRequired: number = settings.medicineList.getDailyDosesRequired(medicineName);

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

    if (dailyDosesRequired === 0) {
        dailyDosesRequired = 1;
        indicator.color = secondaryOn;
    }
    else if ((dailyDosesRequired >= 1) && (dailyDosesRequired <= 5)) {
        let adjustedDoses: number = toggleIndicator(indicator);
        dailyDosesRequired += adjustedDoses;

        if (adjustedDoses === 1) {
            indicator.color = secondaryOn;
        }
        else {
            indicator.color = secondaryOff;
        }
    }

    // Data store behind list is being updated, but we won't display it until save is pressed
    tempMedicineList.setDailyDoseRequirement(medicineName, dailyDosesRequired);
    displayDosesPerDayInstructions(dailyDosesRequired);
}

function adjustDoses(indicator: any): void {
    if (isEditingDosesTakenToday) {
        adustDailyDoseTaken(indicator);
    }
    else if (isEditingTotalDosesPerDay) {
        adustDailyDoseRequirement(indicator);
    }
}

function displayCurrentListDoses() {
    settings.medicineList.bindings.forEach((medicine: MedicineBinding) => {
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

    if (settings.isNewBinding) {
        settings.isNewBinding = false;
        changeTotalDosesPerDay();
        alert(i18n.enterDosesPrescribed + settings.currentMedicine);
    }
}

function registerDoseTaken(medicineName: string): void {
    let confirmMsg: string = getI18NConfirmMsg(medicineName);
    confirm(confirmMsg).then((isConfirmed) => {
        if (isConfirmed) {
            let _activeMedicineList: MedicineBindingList;
            if (settings.isConfirmingDose) {
                // Scanned a tag if here
                _activeMedicineList = settings.medicineList;
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
        // Reset trigger whether confirmed or not
        settings.isConfirmingDose = false;
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

