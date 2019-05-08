import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData } from "tns-core-modules/data/observable";
import { NavigatedData, Page, Color } from "tns-core-modules/ui/page";
import { ListView, ItemEventData } from "tns-core-modules/ui/list-view/list-view";
import { Label } from "tns-core-modules/ui/label/label";

import { HomeViewModel } from "./home-view-model";
import { AudioPlayer } from "~/audio-player/audio-player";
// import { MedicineBinding } from "../data-models/medicine-binding";

import * as Test from "../data-models/test-data";
import * as Utility from "../utility-functions/utility-functions";

// For Dialogs Branch
import { confirm } from "tns-core-modules/ui/dialogs";
import { MedicineBinding } from "~/data-models/medicine-binding";
import { Button } from "tns-core-modules/ui/button/button";

import { I18N } from "~/utilities/i18n";
import { RFID } from "~/utilities/rfid";

import { Settings } from "~/settings/settings";
let settings: Settings = Settings.getInstance();

let medicineList: MedicineBinding[] = null;

let page: Page = null;
let viewModel: HomeViewModel = null;

// Singletons
let i18n = I18N.instance;
let rfid: RFID = null;

// Editing buttons
let isEditingAvailable: boolean = false;
let isEditingDosesTakenToday: boolean = false;
let isEditingTotalDosesPerDay: boolean = false;

// Audio controls and buttons
let audioPlayer: AudioPlayer = null;
let isAudioActive: boolean = false;
let isAudioEnabled: boolean = false;

let primaryOn: string = "#3A53FF";
let primaryOff: string = "#c1c8f8";

let secondaryOn: string = "#398881";
let secondaryOff: string = "#a4cac7";

let isAlertActive: boolean = false;
let alertOn: string = "#ff0000";
// There is no alertOff required

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

export function onDrawerButtonTap(args: EventData) {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
};

export function onLoaded(args: EventData) {
    // Get dose numbers for each medicine
    setTimeout(() => {
        displayCurrentListDoses();
    }, 1000);

    // For controlling display of red (alert) or white colored dose indicators
    isAlertActive = false;

    // Current list of paired medications
    medicineList = Test.Dataset.getCurrentTestData();
    viewModel.set("myMedicineList", medicineList);

    if (audioPlayer === null) {
        audioPlayer = new AudioPlayer();
    }

    if (rfid === null) {
        rfid = RFID.instance;
        rfid.startTagListener();
    }

    isAudioActive = false;
    isAudioEnabled = false;
    viewModel.set("isAudioEnabled", isAudioEnabled);

    // Initialize "Curent" values blank
    viewModel.set("currentTagId", "");

    if (settings.isConfirmingDose) {
        settings.isConfirmingDose = false;
        viewModel.set("currentMedicineName", settings.currentMedicine);
        registerDoseTaken(settings.currentMedicine);

        let index: number = findMedicineNameIndex(settings.currentMedicine, medicineList);
        displayDosesPerDayInstructions(medicineList[index].dailyRequiredDoses);
    }
    else {
        viewModel.set("currentMedicineName", "");
    }

    // Initialize editing buttons state
    isEditingAvailable = false;
    viewModel.set("isEditingAvailable", isEditingAvailable);

    isEditingDosesTakenToday = false;
    viewModel.set("isEditingDosesTakenToday", isEditingDosesTakenToday);
    let editDosesTakenTodayButton: Button = page.getViewById("edit-doses-taken-today");
    editDosesTakenTodayButton.backgroundColor = primaryOff;

    isEditingTotalDosesPerDay = false;
    viewModel.set("isEditingTotalDosesPerDay", isEditingTotalDosesPerDay);
    let editTotalDosesPerDayButton: Button = page.getViewById("edit-total-required-doses");
    editTotalDosesPerDayButton.backgroundColor = secondaryOff;

    // Set text to active language
    setActiveLanguageText();
    viewModel.set("isDualLanguageEnabled", i18n.isDualLanguageEnabled);
};

function displayCurrentDoses() {
    let medicineName: string = viewModel.get("currentMedicineName");
    let index: number = findMedicineNameIndex(medicineName, Test.Dataset.getCurrentTestData());
    let doseIndicatorId_Base: string = "current";

    let dailyRequiredDoses: number = medicineList[index].dailyRequiredDoses;
    let dailyDoses: number = medicineList[index].dailyDoses;

    for (let i = 1; i < 6; i++) {
        let doseIndicatorId: string = doseIndicatorId_Base + i.toString(10);
        let doseIndicator: Label = page.getViewById(doseIndicatorId);

        if (i <= dailyRequiredDoses) {
            if (i <= dailyDoses) {
                doseIndicator.color = new Color(primaryOn);
            }
            else {
                doseIndicator.color = new Color(primaryOff);
            }
        }
        else {
            if (isAlertActive) {
                isAlertActive = false;
                doseIndicator.color = new Color("red");
            }
            else {
                doseIndicator.color = new Color("white");
            }
        }
    }
}

export function onEditTotalDosesPerDayTap(args: EventData) {
    if ((isEditingAvailable) && (!isEditingDosesTakenToday)) {
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

        let index: number = findMedicineNameIndex(medicineName, Test.Dataset.getCurrentTestData());
        // index_old = index;

        let doseIndicatorBaseId: string = "current";

        let dailyRequiredDoses: number = medicineList[index].dailyRequiredDoses;
        dailyRequiredDoses_old = dailyRequiredDoses;

        for (let i = 1; i < 6; i++) {
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
    isEditingTotalDosesPerDay = false;
    viewModel.set("isEditingTotalDosesPerDay", isEditingTotalDosesPerDay);

    let editDosesTakenTodayButton: Button = page.getViewById("edit-doses-taken-today");
    editDosesTakenTodayButton.backgroundColor = primaryOn;

    let currentMedicineNameView: any = page.getViewById("current-medicine-name");
    currentMedicineNameView.color = primaryOn;

    medicineList = Test.Dataset.getCurrentTestData();
    let index: number = findMedicineNameIndex(currentMedicineNameView.text, medicineList);

    displayCurrentDoses();
    displayCurrentListDoses();

    displayDosesPerDayInstructions(medicineList[index].dailyRequiredDoses);

    setActiveLanguageText();
}

export function onCancelTotalDosesPerDayTap() {
    isEditingTotalDosesPerDay = false;
    viewModel.set("isEditingTotalDosesPerDay", isEditingTotalDosesPerDay);

    let editDosesTakenTodayButton: Button = page.getViewById("edit-doses-taken-today");
    editDosesTakenTodayButton.backgroundColor = primaryOn;

    let currentMedicineNameView: any = page.getViewById("current-medicine-name");
    currentMedicineNameView.color = primaryOn;

    let medicineName: string = currentMedicineNameView.text;
    medicineList = Test.Dataset.getCurrentTestData();

    let index: number = findMedicineNameIndex(medicineName, medicineList);
    medicineList[index].dailyRequiredDoses = dailyRequiredDoses_old;

    displayCurrentDoses();
    displayCurrentListDoses();

    displayDosesPerDayInstructions(dailyRequiredDoses_old);

    setActiveLanguageText();
}

export function onEditDosesTakenTodayTap(args: EventData) {
    if ((isEditingAvailable) && (!isEditingTotalDosesPerDay)) {
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

        let index: number = findMedicineNameIndex(medicineName, Test.Dataset.getCurrentTestData());

        let doseIndicatorBaseId: string = "current";

        let dailyDoses: number = medicineList[index].dailyDoses;

        for (let i = 1; i < 6; i++) {
            let doseIndicatorId: string = doseIndicatorBaseId + i.toString(10);
            let doseIndicator: any = page.getViewById<any>(doseIndicatorId);

            if (i <= dailyDoses) {
                doseIndicator.color = primaryOn;
            }
            else {
                doseIndicator.color = primaryOff;
            }
        }
    }
}

export function onSaveDosesTakenTodayTap() {
    isEditingDosesTakenToday = false;
    viewModel.set("isEditingDosesTakenToday", isEditingDosesTakenToday);

    let editTotalDosesPerDayButton: Button = page.getViewById("edit-total-required-doses");
    editTotalDosesPerDayButton.backgroundColor = secondaryOn;

    let currentMedicineNameView: any = page.getViewById("current-medicine-name");
    currentMedicineNameView.color = primaryOn;

    medicineList = Test.Dataset.getCurrentTestData();
    let index: number = findMedicineNameIndex(currentMedicineNameView.text, medicineList);

    displayCurrentDoses();
    displayCurrentListDoses();

    displayDosesPerDayInstructions(medicineList[index].dailyRequiredDoses);

    setActiveLanguageText();
}

export function onCancelDosesTakenTodayTap() {
    isEditingDosesTakenToday = false;
    viewModel.set("isEditingDosesTakenToday", isEditingDosesTakenToday);

    let editTotalDosesPerDayButton: Button = page.getViewById("edit-total-required-doses");
    editTotalDosesPerDayButton.backgroundColor = secondaryOn;

    let currentMedicineNameView: any = page.getViewById("current-medicine-name");
    currentMedicineNameView.color = primaryOn;

    let medicineName: string = currentMedicineNameView.text;
    medicineList = Test.Dataset.getCurrentTestData();

    let index: number = findMedicineNameIndex(medicineName, medicineList);
    medicineList[index].dailyDoses = dailyDoses_old;

    displayCurrentDoses();
    displayCurrentListDoses();

    displayDosesPerDayInstructions(dailyRequiredDoses_old);

    setActiveLanguageText();
}

function toggleIndicator(indicator: any): number {
    let adjustTotal: number = 0;

    if (isEditingDosesTakenToday) {
        if (indicator.color.toString().toLowerCase() === primaryOff.toLowerCase()) {
            adjustTotal = 1;
        }
        else {
            adjustTotal = -1;
        }
    }
    else if (isEditingTotalDosesPerDay) {
        if (indicator.color.toString().toLowerCase() === secondaryOff.toLowerCase()) {
            adjustTotal = 1;
        }
        else {
            adjustTotal = -1;
        }
    }
    return adjustTotal;
}

function adustDailyDoseTaken(indicator: any): void {
    let medicineName: string = viewModel.get("currentMedicineName");
    medicineList = Test.Dataset.getCurrentTestData();
    let index: number = findMedicineNameIndex(medicineName, medicineList);
    let dailyDoses: number = medicineList[index].dailyDoses;

    let adjustedDoses: number = toggleIndicator(indicator);
    dailyDoses += adjustedDoses;

    if (adjustedDoses === 1) {
        indicator.color = primaryOn;
    }
    else {
        indicator.color = primaryOff;
    }

    // Data store behind list is being updated, but we won't display it until save is pressed
    medicineList[index].dailyDoses = dailyDoses;
    displayDosesTakenMsg(dailyDoses);
}

function adustDailyDoseRequirement(indicator: any) {
    let medicineName: string = viewModel.get("currentMedicineName");
    medicineList = Test.Dataset.getCurrentTestData();
    let index: number = findMedicineNameIndex(medicineName, medicineList);
    let dailyRequiredDoses: number = medicineList[index].dailyRequiredDoses;

    if ((dailyRequiredDoses >= 1) && (dailyRequiredDoses <= 5)) {
        let adjustedDoses: number = toggleIndicator(indicator);
        dailyRequiredDoses += adjustedDoses;

        if (adjustedDoses === 1) {
            indicator.color = secondaryOn;
        }
        else {
            indicator.color = secondaryOff;
        }

        // Data store behind list is being updated, but we won't display it until save is pressed
        medicineList[index].dailyRequiredDoses = dailyRequiredDoses;
        displayDosesPerDayInstructions(dailyRequiredDoses);
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

function displayCurrentListDoses() {
    medicineList.forEach((value) => {
        let doseIndicatorBaseId: string = value.medicineName;
        for (let i = 1; i < 6; i++) {
            let doseIndicatorId: string = doseIndicatorBaseId + i.toString(10);
            let doseIndicator: any = page.getViewById<any>(doseIndicatorId);

            let dailyRequiredDoses: number = value.dailyRequiredDoses;
            let dailyDoses: number = value.dailyDoses;
            if (i <= dailyRequiredDoses) {
                if (i <= dailyDoses) {
                    doseIndicator.color = primaryOn;
                }
                else {
                    doseIndicator.color = primaryOff;
                }
            }
            else {
                if (isAlertActive) {
                    //isAlertActive = false;
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
    isAlertActive = true;
    let confirmMsg: string = getI18NConfirmMsg(medicineName);
    confirm(confirmMsg).then((isConfirmed) => {
        if (isConfirmed) {
            let index: number = findMedicineNameIndex(medicineName, Test.Dataset.getCurrentTestData());
            medicineList[index].dailyDoses += 1;

            displayCurrentDoses();
            displayCurrentListDoses();
        }
    });
}

// function onTagDiscoveredListener(nfcTagData: NfcTagData) {
//     let tagId: string = Utility.Helpers.formatTagId(nfcTagData.id);
//     let medicineList: MedicineBinding[] = Test.Dataset.getCurrentTestData();

//     // See if medicine with this tag already exists in the myMedicineList
//     let index: number = findTagIdIndex(tagId, medicineList);
//     if (index != -1) { // existing tag found, display associated medicine name
//         let medicineName: string = medicineList[index].medicineName;
//         viewModel.set("currentMedicineName", medicineName);

//         registerDoseTaken(medicineName.toLowerCase());

//         let audioPath = Utility.Language.getAudioPath(medicineName);
//         AudioPlayer.useAudio(audioPath);
//         if (isAudioEnabled) {
//             AudioPlayer.play();
//         }
//     }
//     else { // New tag, lock tagId display
//         viewModel.set("currentMedicineName", "tag not found");
//     }
// }

export function onNavigatingFrom() {
    // Remove this page's listener
    // nfc.setOnTagDiscoveredListener(null);
}

export function onItemTap(args: ItemEventData) {
    let medicineName: string = medicineList[args.index].medicineName;
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
    displayDosesPerDayInstructions(medicineList[args.index].dailyRequiredDoses);

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

function findTagIdIndex(tagId: string, list: MedicineBinding[]): number {
    let i: number = 0;
    let index: number = -1;
    list.forEach(value => {
        if (value.tagId === tagId) {
            index = i;
        }
        else {
            i = i + 1;
        }
    })
    return index;
}

function findMedicineNameIndex(medicineName: string, medicineBindingList: MedicineBinding[]): number {
    let i: number = 0;
    let index: number = -1;
    medicineBindingList.forEach(value => {
        if (value.medicineName.toLocaleLowerCase() === medicineName.toLocaleLowerCase()) {
            index = i;
        }
        else {
            i = i + 1;
        }
    })
    return index;
}

function setActiveLanguageText(): void {
    viewModel.set("i18nPageTitle", i18n.dosePageTitle);

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

