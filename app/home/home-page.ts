import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData, Observable } from "tns-core-modules/data/observable";
import { NavigatedData, Page, Color } from "tns-core-modules/ui/page";
import { ListView, ItemEventData } from "tns-core-modules/ui/list-view/list-view";
import { Label } from "tns-core-modules/ui/label/label";
import { HomeViewModel } from "./home-view-model";
import { confirm } from "tns-core-modules/ui/dialogs";
import { MedicineCabinet, MedicineBinding } from "~/data-models/medicine-cabinet";
import { Button } from "tns-core-modules/ui/button/button";
import { TabView, TabViewItem, SelectedIndexChangedEventData } from "tns-core-modules/ui/tab-view";

import { I18N } from "~/utilities/i18n";
import { RFID } from "~/utilities/rfid";
import { TestData } from "~/data-models/test-data";
import { Settings } from "~/settings/settings";
import { AudioPlayer } from "~/audio-player/audio-player";
import { TextField } from "tns-core-modules/ui/text-field/text-field";
import { VR } from "~/utilities/vr";

let i18n: I18N = I18N.getInstance();
let audioPlayer: AudioPlayer = AudioPlayer.getInstance();

// Individual medicine lists
let myMedicineCabinet: MedicineCabinet = new MedicineCabinet(TestData.myMedicineCabinet.owner, TestData.myMedicineCabinet.medicines);
let momMedicineCabinet: MedicineCabinet = new MedicineCabinet(TestData.momMedicineCabinet.owner, TestData.momMedicineCabinet.medicines);
let dadMedicineCabinet: MedicineCabinet = new MedicineCabinet(TestData.dadMedicineCabinet.owner, TestData.dadMedicineCabinet.medicines);

// Init default app Settings
let settings: Settings = Settings.getInstance();
settings.isAudioEnabled = true;
settings.currentTab = 0;

settings.currentMedicineCabinet = myMedicineCabinet;

let medicineCabinets: MedicineCabinet[] = [myMedicineCabinet, momMedicineCabinet, dadMedicineCabinet];

// Page scope medicine lists, point local medicineList to shared datastore
let tempMedicineCabinet: MedicineCabinet;

// Voice (Speech) Recognition
let vr: VR = VR.getInstance(); // Will set settings._isSpeechRecognitionAvailable in private constructor.

// NFC tag methods
let rfid: RFID = RFID.getInstance();

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

let isTabsViewInitialized: boolean = false;

export function onDeleteMedTap() {
    const deleteButton: any = getDeleteButton();

    if (deleteButton.color.hex.toUpperCase() === primaryOff.toUpperCase()) {
        alert(getI18NCannotDeleteLastMedicineMsg());
        return;
    }

    let medicineName: string = viewModel.get("currentMedicineName");

    let confirmMsg: string = getI18NDeleteMedicineConfirmMsg(medicineName);
    confirm(confirmMsg).then((isConfirmed) => {
        if (isConfirmed) {
            settings.currentMedicineCabinet.deleteMedicineBinding(medicineName);
            settings.currentMedicineName = settings.currentMedicineCabinet.medicines[0].medicineName;
            updateViewModelGlobals();

            const listView: ListView = page.getViewById<ListView>("medicineList");
            listView.refresh();

            if (settings.currentMedicineCabinet.medicines.length === 1) {
                deleteButton.color = primaryOff;
            }

            displayCurrentDoses();
            displayDosesPerDayInstructions(settings.currentMedicineCabinet.getDailyDosesRequired(settings.currentMedicineName));
        }
    });
}

export function onAddMedTap() {
    let isAddingNewMedicine: boolean = true;
    viewModel.set("isAddingNewMedicine", isAddingNewMedicine);
    viewModel.set("i18nSave", i18n.save);
    viewModel.set("i18nCancel", i18n.cancel);

    viewModel.set("currentMedicineName", "");
    viewModel.set("i18nDailyInstructions", "");
    clearCurrentDoses();

    // Request medicine name
    alert(i18n.enterMedicneName);
    setTimeout(() => {
        if (settings.isSpeechRecognitionAvailable) {
            vr.startListening();
        }
    }, 1000);
}

export function onSpeechRecognition_home(transcription: string) {
    const input: TextField = page.getViewById<TextField>("current-medicine-name");
    input.text = capitalizeFirstLetter(transcription);
    viewModel.set("currentMedicineName", input.text);
}

export function onSaveNewMedicineTap() {
    let isAddingNewMedicine: boolean = false;
    viewModel.set("isAddingNewMedicine", isAddingNewMedicine);

    let binding: MedicineBinding = new MedicineBinding();

    binding.tagId = "-1";
    binding.dailyDoses = 0;
    binding.dailyRequiredDoses = 0;
    binding.medicineName = viewModel.get("currentMedicineName");
    if (!binding.medicineName) {
        alert(i18n.selectMedicineMsg);
        return;
    }

    settings.currentMedicineCabinet.addMedicineBinding(binding);
    settings.currentMedicineName = binding.medicineName;

    isEditingAvailable = true;
    viewModel.set("isEditingAvailable", isEditingAvailable);

    isEditingDosesTakenToday = false;
    viewModel.set("isEditingDosesTakenToday", isEditingDosesTakenToday);

    const listView: ListView = page.getViewById<ListView>("medicineList");
    listView.refresh();

    alert(i18n.enterDosesPrescribed + binding.medicineName);

    changeTotalDosesPerDay();

    const deleteButton: any = getDeleteButton();
    deleteButton.color = primaryOn;
}

export function onCancelNewMedicineTap() {
    let isAddingNewMedicine: boolean = false;
    viewModel.set("isAddingNewMedicine", isAddingNewMedicine);

    viewModel.set("currentMedicineName", settings.currentMedicineName);

    displayCurrentDoses();
    displayDosesPerDayInstructions(settings.currentMedicineCabinet.getDailyDosesRequired(settings.currentMedicineName));

    vr.stopListening();
}

export function onLogoTap() {
    alert(Settings.version);
}

export function onTabsLoaded() {
    viewModel.set("tabSelectedIndex", settings.currentTab);
}

export function onSelectedIndexChanged(args: SelectedIndexChangedEventData) {
    if ((isTabsViewInitialized) && (!settings.isNewBinding) && (!settings.isConfirmingDose)) {
        clearListDosesTakenToday();

        settings.currentTab = args.newIndex;
        settings.currentMedicineCabinet = medicineCabinets[settings.currentTab];
        setMedicineCabinetOwnerInfo();

        settings.currentMedicineName = settings.currentMedicineCabinet.getMedicineBindingByIndex(0).medicineName;

        // Update view-model settings
        // Call after all "settings" have been updated
        updateViewModelGlobals();

        // Display text in selected language
        setActiveLanguageText();

        const listView: ListView = page.getViewById<ListView>("medicineList");
        listView.refresh();

        displayCurrentDoses();

        displayDosesPerDayInstructions(settings.currentMedicineCabinet.getDailyDosesRequired(settings.currentMedicineName));

        setTimeout(() => {
            let isUiComplete: boolean = false;
            isUiComplete = displayCurrentListDoses();
            if (!isUiComplete) {
                setTimeout(() => {
                    displayCurrentListDoses();
                }, 400);
            }
        }, 200);
    }
    isTabsViewInitialized = true;
}

export function onNavigatingTo(args: NavigatedData) {
    page = <Page>args.object;
    settings.currentPage = "home";
    viewModel = new HomeViewModel();
    page.bindingContext = viewModel;
}

export function onNavigatingFrom() {
    audioPlayer.stop();
}

export function onDrawerButtonTap(args: EventData) {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
}

export function onLoaded(args: EventData) {
    setTimeout(() => {
        let isUiComplete: boolean = false;
        isUiComplete = displayCurrentListDoses();
        if (!isUiComplete) {
            setTimeout(() => {
                displayCurrentListDoses();
            }, 200);
        }
    }, 400);

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
        viewModel.set("currentMedicineName", settings.currentMedicineName);
        registerDoseTaken(settings.currentMedicineName);
    }
    else {
        if (!settings.currentMedicineName) {
            settings.currentMedicineName = settings.currentMedicineCabinet.getMedicineBindingByIndex(0).medicineName;
        }
        viewModel.set("currentMedicineName", settings.currentMedicineName);
        displayCurrentDoses();
    }

    setMedicineCabinetOwnerInfo();

    displayDosesPerDayInstructions(settings.currentMedicineCabinet.getDailyDosesRequired(settings.currentMedicineName));

    // Call after all "settings" have been updated
    updateViewModelGlobals();

    // Set text to active language
    setActiveLanguageText();

    // startTagListener checks if listener is active before starting
    rfid.startTagListener();
};

export function onChangeTotalDosesPerDayTap(args: EventData) {
    changeTotalDosesPerDay();
}

export function onSaveTotalDosesPerDayTap() {
    // Save changes
    medicineCabinets[settings.currentTab] = new MedicineCabinet(tempMedicineCabinet.owner, tempMedicineCabinet.medicines);
    settings.currentMedicineCabinet = medicineCabinets[settings.currentTab];;
    tempMedicineCabinet = null;

    isEditingTotalDosesPerDay = false;
    viewModel.set("isEditingTotalDosesPerDay", isEditingTotalDosesPerDay);

    let editDosesTakenTodayButton: Button = page.getViewById("edit-doses-taken-today");
    editDosesTakenTodayButton.backgroundColor = primaryOn;

    let currentMedicineNameView: any = page.getViewById("current-medicine-name");
    currentMedicineNameView.color = primaryOn;

    displayCurrentDoses();
    displayCurrentListDoses();

    let medicineName: string = viewModel.get("currentMedicineName");
    displayDosesPerDayInstructions(settings.currentMedicineCabinet.getDailyDosesRequired(medicineName));
}

export function onCancelTotalDosesPerDayTap() {
    tempMedicineCabinet = null;

    isEditingTotalDosesPerDay = false;
    viewModel.set("isEditingTotalDosesPerDay", isEditingTotalDosesPerDay);

    let editDosesTakenTodayButton: Button = page.getViewById("edit-doses-taken-today");
    editDosesTakenTodayButton.backgroundColor = primaryOn;

    let currentMedicineNameView: any = page.getViewById("current-medicine-name");
    currentMedicineNameView.color = primaryOn;

    displayCurrentDoses();
    displayCurrentListDoses();

    let medicineName: string = viewModel.get("currentMedicineName");
    displayDosesPerDayInstructions(settings.currentMedicineCabinet.getDailyDosesRequired(medicineName));
}

export function onChangeDosesTakenTodayTap(args: EventData) {
    if ((isEditingAvailable) && (!isEditingTotalDosesPerDay)) {
        // Copy list to temp list for editing
        tempMedicineCabinet = new MedicineCabinet(settings.currentMedicineCabinet.owner, settings.currentMedicineCabinet.medicines);

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

        let dosesTakenToday: number = tempMedicineCabinet.getDosesTakenToday(medicineName);
        let dailyDosesRequired: number = tempMedicineCabinet.getDailyDosesRequired(medicineName);

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
    medicineCabinets[settings.currentTab] = new MedicineCabinet(tempMedicineCabinet.owner, tempMedicineCabinet.medicines);
    settings.currentMedicineCabinet = medicineCabinets[settings.currentTab];;
    tempMedicineCabinet = null;

    isEditingDosesTakenToday = false;
    viewModel.set("isEditingDosesTakenToday", isEditingDosesTakenToday);

    let editTotalDosesPerDayButton: Button = page.getViewById("edit-total-required-doses");
    editTotalDosesPerDayButton.backgroundColor = secondaryOn;

    let currentMedicineNameView: any = page.getViewById("current-medicine-name");
    currentMedicineNameView.color = primaryOn;

    displayCurrentDoses();
    displayCurrentListDoses();

    let medicineName: string = viewModel.get("currentMedicineName");
    displayDosesPerDayInstructions(settings.currentMedicineCabinet.getDailyDosesRequired(medicineName));
}

export function onCancelDosesTakenTodayTap() {
    tempMedicineCabinet = null;

    isEditingDosesTakenToday = false;
    viewModel.set("isEditingDosesTakenToday", isEditingDosesTakenToday);

    let editTotalDosesPerDayButton: Button = page.getViewById("edit-total-required-doses");
    editTotalDosesPerDayButton.backgroundColor = secondaryOn;

    let currentMedicineNameView: any = page.getViewById("current-medicine-name");
    currentMedicineNameView.color = primaryOn;

    displayCurrentDoses();
    displayCurrentListDoses();

    let medicineName: string = viewModel.get("currentMedicineName");
    displayDosesPerDayInstructions(settings.currentMedicineCabinet.getDailyDosesRequired(medicineName));
}

export function current1(args: ItemEventData) {
    let indicator: any = page.getViewById("current1");
    if ((!isEditingDosesTakenToday) && (!isEditingTotalDosesPerDay) && (indicator.color.name === "red")) {
        alert("Call a doctor!!!");
    }
    else {
        adjustDoses(indicator);
    }
}

export function current2(args: ItemEventData) {
    let indicator: any = page.getViewById("current2");
    if ((!isEditingDosesTakenToday) && (!isEditingTotalDosesPerDay) && (indicator.color.name === "red")) {
        alert("Call a doctor!!!");
    }
    else {
        adjustDoses(indicator);
    }
}

export function current3(args: ItemEventData) {
    let indicator: any = page.getViewById("current3");
    if ((!isEditingDosesTakenToday) && (!isEditingTotalDosesPerDay) && (indicator.color.name === "red")) {
        alert("Call a doctor!!!");
    }
    else {
        adjustDoses(indicator);
    }
}

export function current4(args: ItemEventData) {
    let indicator: any = page.getViewById("current4");
    if ((!isEditingDosesTakenToday) && (!isEditingTotalDosesPerDay) && (indicator.color.name === "red")) {
        alert("Call a doctor!!!");
    }
    else {
        adjustDoses(indicator);
    }
}

export function current5(args: ItemEventData) {
    let indicator: any = page.getViewById("current5");
    if ((!isEditingDosesTakenToday) && (!isEditingTotalDosesPerDay) && (indicator.color.name === "red")) {
        alert("Call a doctor!!!");
    }
    else {
        adjustDoses(indicator);
    }
}

export function onItemTap(args: ItemEventData) {
    let medicineName: string = settings.currentMedicineCabinet.medicines[args.index].medicineName;
    settings.currentMedicineName = medicineName;
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
    displayDosesPerDayInstructions(settings.currentMedicineCabinet.medicines[args.index].dailyRequiredDoses);

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

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getDeleteButton(): any {
    const medicineDeleteButtonIds: string[] = ["delete-t1-medicine", "delete-t2-medicine", "delete-t3-medicine"]

    let deleteButtonId: string = medicineDeleteButtonIds[settings.currentTab];
    let deleteButton: any = page.getViewById(deleteButtonId);
    return deleteButton
}

function setMedicineCabinetOwnerInfo() {
    let medicineCabinetOwners: string[] = [i18n.me, i18n.mom, i18n.dad];
    let owner: string = medicineCabinetOwners[settings.currentTab];
    settings.currentMedicineCabinet.owner = capitalizeFirstLetter(owner);

    let medicineCabinetOwnerTitles: string[] = [i18n.myMedicineCabinet, i18n.momsMedicineCabinet, i18n.dadsMedicineCabinet];
    let ownerMedicineCabinetText: string = medicineCabinetOwnerTitles[settings.currentTab];
    settings.currentMedicineCabinet.ownerTitle = ownerMedicineCabinetText;
}

function changeTotalDosesPerDay() {
    if ((isEditingAvailable) && (!isEditingDosesTakenToday)) {
        // Copy list to temp list for editing
        tempMedicineCabinet = new MedicineCabinet(settings.currentMedicineCabinet.owner, settings.currentMedicineCabinet.medicines);

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
        let dailyRequiredDoses: number = tempMedicineCabinet.getDailyDosesRequired(medicineName);

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

function clearCurrentDoses() {
    let doseIndicatorIdBase: string = "current";

    // Iterate over each display position
    let maxDosesDisplayed: number = 6;
    for (let i = 1; i < maxDosesDisplayed; i++) {
        // Get the view id for the current indicator
        let doseIndicatorId: string = doseIndicatorIdBase + i.toString(10);
        let doseIndicator: Label = page.getViewById(doseIndicatorId);
        doseIndicator.color = new Color("white");
    }
}

function clearListDosesTakenToday() {
    settings.currentMedicineCabinet.medicines.forEach((medicine) => {
        let dosesTakenToday: number = medicine.dailyDoses;
        let dailyDosesRequired: number = medicine.dailyRequiredDoses;
        let doseIndicatorIdBase: string = medicine.medicineName;

        // Iterate over each display position
        let maxDosesDisplayed: number = 6;
        for (let i = 1; i < maxDosesDisplayed; i++) {
            // Get the view id for the current indicator
            let doseIndicatorId: string = doseIndicatorIdBase + i.toString(10);
            let doseIndicator: any = page.getViewById<any>(doseIndicatorId);
            doseIndicator.color = new Color("white");
        }
    })
}

function displayCurrentDoses() {
    let doseIndicatorIdBase: string = "current";
    let medicineName: string = viewModel.get("currentMedicineName");

    let dosesTakenToday: number = settings.currentMedicineCabinet.getDosesTakenToday(medicineName);
    let dailyDosesRequired: number = settings.currentMedicineCabinet.getDailyDosesRequired(medicineName);

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

    let dosesTakenToday: number = tempMedicineCabinet.getDosesTakenToday(medicineName);
    let dailyDosesRequired: number = tempMedicineCabinet.getDailyDosesRequired(medicineName);

    let doseAdjustment: number = toggleIndicator(indicator);
    dosesTakenToday += doseAdjustment;

    let dose: number = getIndicatorDoseNumber(indicator.id);
    if (doseAdjustment === 1) {
        // Adding a dose
        if (dose <= dailyDosesRequired) {
            indicator.color = primaryOn;
        }
        else {
            indicator.color = alertOn;
        }
    }
    else {
        // Subtracting a dose
        if (dose <= dailyDosesRequired) {
            indicator.color = primaryOff;
        }
        else {
            indicator.color = alertOff;
        }
    }

    // Data store behind list is being updated, but we won't display it until save is pressed
    tempMedicineCabinet.setDosesTakenToday(medicineName, dosesTakenToday);
    displayDosesTakenMsg(dosesTakenToday);
}

function getIndicatorDoseNumber(indicator: string): number {
    let dose: number = Number(indicator.slice(-1));
    return dose;
}

function adustDailyDoseRequirement(indicator: any) {
    let medicineName: string = viewModel.get("currentMedicineName");
    let dailyDosesRequired: number = tempMedicineCabinet.getDailyDosesRequired(medicineName);

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
    tempMedicineCabinet.setDailyDoseRequirement(medicineName, dailyDosesRequired);
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

function displayCurrentListDoses(): boolean {
    let isUiComplete: boolean = true;
    settings.currentMedicineCabinet.medicines.forEach((medicine) => {
        let dosesTakenToday: number = medicine.dailyDoses;
        let dailyDosesRequired: number = medicine.dailyRequiredDoses;
        let doseIndicatorIdBase: string = medicine.medicineName;

        // Iterate over each display position
        let maxDosesDisplayed: number = 6;
        for (let i = 1; i < maxDosesDisplayed; i++) {
            // Get the view id for the current indicator
            let doseIndicatorId: string = doseIndicatorIdBase + i.toString(10);
            // console.log("doseIndicatorId: " + doseIndicatorId);

            let doseIndicator: any = page.getViewById<any>(doseIndicatorId);
            if (!doseIndicator) {
                isUiComplete = false;
                return isUiComplete;
            }
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
        alert(i18n.enterDosesPrescribed + settings.currentMedicineName);
    }
    return isUiComplete;
}

function registerDoseTaken(medicineName: string): void {
    let confirmMsg: string = getI18NConfirmMsg(medicineName);
    confirm(confirmMsg).then((isConfirmed) => {
        if (isConfirmed) {
            let _activeMedicineList: MedicineCabinet;
            if (settings.isConfirmingDose) {
                // Scanned a tag if here
                _activeMedicineList = settings.currentMedicineCabinet;
            }
            else {
                // User changing doses if here
                _activeMedicineList = tempMedicineCabinet;
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

function updateViewModelGlobals() {
    setTimeout(() => {
        let deleteButton: any = getDeleteButton();
        if (settings.currentMedicineCabinet.medicines.length === 1) {
            deleteButton.color = primaryOff;
        }
        else {
            deleteButton.color = primaryOn;
        }
    }, 400);

    viewModel.set("tabSelectedIndex", settings.currentTab);
    viewModel.set("myMedicineList", settings.currentMedicineCabinet.medicines);
    viewModel.set("currentMedicineName", settings.currentMedicineName);

    viewModel.set("isAudioEnabled", settings.isAudioEnabled);
}

function setActiveLanguageText(): void {
    viewModel.set("i18nSynavoxSubPageTitle", i18n.synavoxSubPageTitle);

    viewModel.set("i18nMedicineCabinetOwnerTitle", settings.currentMedicineCabinet.ownerTitle);
    viewModel.set("i18nSynavoxSubPageTitle", i18n.synavoxSubPageTitle);

    viewModel.set("i18nMyMedicines", i18n.myMedicines);

    viewModel.set("i18nMe", i18n.me);
    viewModel.set("i18nMom", i18n.mom);
    viewModel.set("i18nDad", i18n.dad);

    viewModel.set("i18nMyPrescriptions", i18n.myPrescriptions);
    viewModel.set("i18nMomsPrescriptions", i18n.momsPrescriptions);
    viewModel.set("i18nDadsPrescriptions", i18n.dadsPrescriptions);

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

function getI18NCannotDeleteLastMedicineMsg(): string {
    let confirmMsg: string = i18n.getCannotDeleteLastMedicineMsg();
    return confirmMsg;
}

function getI18NDeleteMedicineConfirmMsg(medicineName: string): string {
    let confirmMsg: string = i18n.getDeleteMedicineConfirmMsg(medicineName);
    return confirmMsg;
}

