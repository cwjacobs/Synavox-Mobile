import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData, Observable } from "tns-core-modules/data/observable";
import { NavigatedData, Page, Color, View } from "tns-core-modules/ui/page";
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
import { AudioRecorder } from "~/audio-recorder/audio-recorder";

import { TextField } from "tns-core-modules/ui/text-field/text-field";
import { VR } from "~/utilities/vr";
import { navigateTo } from "~/app-root/app-root";

let i18n: I18N = I18N.getInstance();
let audioPlayer: AudioPlayer = AudioPlayer.getInstance();
let audioRecorder: AudioRecorder = AudioRecorder.getInstance();

// Individual medicine lists
let myMedicineCabinet: MedicineCabinet = new MedicineCabinet(TestData.myMedicineCabinet.owner, TestData.myMedicineCabinet.medicines);
let momMedicineCabinet: MedicineCabinet = new MedicineCabinet(TestData.momMedicineCabinet.owner, TestData.momMedicineCabinet.medicines);
let dadMedicineCabinet: MedicineCabinet = new MedicineCabinet(TestData.dadMedicineCabinet.owner, TestData.dadMedicineCabinet.medicines);

// Init default app Settings
let settings: Settings = Settings.getInstance();
settings.isAudioEnabled = true;
settings.currentTab = null;

settings.currentMedicineCabinet = null;

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
let isMedicineNameEditable: boolean = false;
let isEditingDosesTakenToday: boolean = false;
let isEditingTotalDosesPerDay: boolean = false;

let primaryOn: string = "#3A53FF";
let primaryOff: string = "#c1c8f8";

// let secondaryOn: string = "#398881";
let secondaryOn: string = "#587e90";
let secondaryOff: string = "#a4cac7";

let alertOn: string = "#7700ff";
let alertOff: string = "#c99aff";

let overdoseOn: string = "#ff0000";
let overdoseOff: string = "#f6a9a9";

const deleteButtonColors_On: string[] = [primaryOn, secondaryOn, alertOn];
const deleteButtonColors_Off: string[] = [primaryOff, secondaryOff, alertOff];

let medsIconDosesPerDayOn: string = "#00fa00";
let medsIconDosesTakenTodayOn: string = "#3affe5";
let medsIconDosesTakenTodayOff: string = "#3ab7ff";

let isTabsViewInitialized: boolean = false;

// import platform = require("tns-core-modules/platform");
import * as dialog from "tns-core-modules/ui/dialogs";
import { async } from "rxjs/internal/scheduler/async";

import audio = require('nativescript-audio');
import fileSystemModule = require('tns-core-modules/file-system');
const audioFolder = fileSystemModule.knownFolders.currentApp().getFolder('recordings');
import platform = require('tns-core-modules/platform');
import { TNSRecorder } from "nativescript-audio";

let audioFileName: string;
let isRecording: boolean = false;

export function onCustomRecord() {
    let pageTitle: string = "CustomAudio";
    let pageRoute: string = "xition/custom-audio/custom-audio-page";
    navigateTo(pageTitle, pageRoute);
}

export function onCustomRecordWizardExit(medicineName: string): audio.TNSRecorder {
    console.log('doRecord Called 1e');
    let recorder = new audio.TNSRecorder();
    /*
    from the sample app
    */
    let androidFormat;
    let androidEncoder;
    if (platform.isAndroid) {
        // static constants are not available, using raw values here
        // androidFormat = android.media.MediaRecorder.OutputFormat.MPEG_4;
        androidFormat = 2;
        // androidEncoder = android.media.MediaRecorder.AudioEncoder.AAC;
        androidEncoder = 3;
    }

    let options = {
        filename: audioFolder.path + '/recording.mp4',
        format: androidFormat,
        encoder: androidEncoder,
        infoCallback: info => {
            //apparently I'm necessary even if blank
        },
        errorCallback: e => {
            console.log('error cb', e);
        }
    };
    audioFileName = options.filename;
    recorder.start(options);
    // console.log('audioFolder.parent.parent.parent.parent.parent.parent: ' + audioFolder.parent.parent.parent.parent.parent.parent.name);
    setTimeout(() => {
        stopRecording(recorder);
    }, 20000);

    return recorder;
};

export function stopRecording(recorder: audio.TNSRecorder): void {
    console.log('calling stop');
    recorder.stop()
        .then(() => {
            console.log('fileSystemModule.File.exists: ' + fileSystemModule.File.exists(audioFileName));
            audioPlayer.playFrom(audioFileName);

            let index: number = settings.currentMedicineCabinet.getMedicineBindingIndex(settings.currentMedicineName);
            if (index !== -1) {
                let medicineBinding: MedicineBinding = settings.currentMedicineCabinet.getMedicineBindingByIndex(index);
                medicineBinding.audioTrack = audioFileName;
                settings.currentMedicineCabinet.replaceMedicineBinding(index, medicineBinding)
            }
            console.log('really done');
        })
        .catch(e => {
            console.log('error stopping', e);
        });
}

function setRecordIconColor() {
    let recordButtonView: Label = page.getViewById("record-custom-button");
    if (!recordButtonView) {
        alert("!recordButtonView...");
        return;
    }
    recordButtonView.color = new Color(Settings.brightIconColors[settings.currentTab]);
}

export function onDeleteMedTap() {
    const deleteButton: any = getDeleteButtonView();

    if (deleteButton.color.hex.toUpperCase() === deleteButtonColors_Off[settings.currentTab].toUpperCase()) {
        dialog.alert({
            title: i18n.tip,
            message: getI18NCannotDeleteLastMedicineMsg(),
            okButtonText: i18n.ok,
        })
        return;
    }

    let medicineName: string = removeSpecialCharacters(viewModel.get("currentMedicineName"));

    let confirmMsg: string = getI18NDeleteMedicineConfirmMsg(medicineName);
    dialog.confirm({
        title: i18n.youAreDeletingMedMsg,
        message: confirmMsg,
        cancelButtonText: i18n.cancel,
        okButtonText: i18n.ok,
    })
        .then((isConfirmed) => {
            console.log("result: " + isConfirmed);
            if (isConfirmed) {
                settings.currentMedicineCabinet.deleteMedicineBinding(medicineName);
                settings.currentMedicineName = settings.currentMedicineCabinet.medicines[0].medicineName;
                updateViewModelGlobals();

                const listView: ListView = page.getViewById<ListView>("medicine-list");
                listView.refresh();

                if (settings.currentMedicineCabinet.medicines.length === 1) {
                    deleteButton.color = deleteButtonColors_Off[settings.currentTab];
                }

                displayCurrentDoses();
                displayDosesPerDayInstructions(settings.currentMedicineCabinet.getDailyDosesRequired(settings.currentMedicineName));
            }
        })
        .catch((e) => { console.log("error: " + e) })
}

export function onAddMedTap() {
    let pageTitle: string = "NoTagMed";
    let pageRoute: string = "xition/add-no-tag-med/add-no-tag-med-page";
    navigateTo(pageTitle, pageRoute);
}

export function onAddMedTapAfterWizard() {
    viewModel.set("isAddingNewMedicine", true);
    viewModel.set("isMedicineNameEditable", true);
    viewModel.set("i18nSave", i18n.save);
    viewModel.set("i18nCancel", i18n.cancel);

    viewModel.set("currentMedicineName", "");
    viewModel.set("i18nDailyInstructions", "");
    clearCurrentDoses();

    // Request medicine name
    setTimeout(() => {
        if (settings.isSpeechRecognitionAvailable) {
            vr.startListening();
        }
    }, 800);
}

export function onStartListeningTap() {
    vr.stopListening();

    setTimeout(() => {
        if (settings.isSpeechRecognitionAvailable) {
            vr.startListening();
            viewModel.set("currentMedicineName", "");
        }
    }, 400);
}

export function onSpeechRecognition_home(transcription: string) {
    const input: TextField = page.getViewById<TextField>("current-medicine-name");
    input.text = capitalizeFirstLetter(removeSpecialCharacters(transcription));
    viewModel.set("currentMedicineName", input.text);
}

export function onSaveNewMedicineTap() {
    vr.stopListening();
    viewModel.set("isAddingNewMedicine", false);
    viewModel.set("isMedicineNameEditable", false);

    let medicineName: string = removeSpecialCharacters(viewModel.get("currentMedicineName"));
    if (medicineName == null) {
        // alert(i18n.selectMedicineMsg);
        dialog.alert({
            title: i18n.selectingMedicineTitle,
            message: i18n.selectMedicineMsg,
            okButtonText: i18n.ok,
        })
        return;
    }

    settings.currentMedicineName = medicineName;

    /* Returns -1 if medicine name not found in medicine list */
    let index: number = settings.currentMedicineCabinet.getMedicineBindingIndex(medicineName);
    if (index === -1) {
        // A new medicine, "medicineName" was not found in list
        let binding: MedicineBinding = new MedicineBinding("-1", medicineName, 0, 0);

        settings.currentMedicineCabinet.addMedicineBinding(binding);
        settings.currentTagId = binding.tagId;
        settings.currentMedicineName = binding.medicineName;
        viewModel.set("medicineList", settings.currentMedicineCabinet.medicines);

        isEditingAvailable = true;
        viewModel.set("isEditingAvailable", isEditingAvailable);

        isEditingDosesTakenToday = false;
        viewModel.set("isEditingDosesTakenToday", isEditingDosesTakenToday);

        const listView: ListView = page.getViewById<ListView>("medicine-list");
        listView.refresh();

        // alert(i18n.enterDosesPrescribed + binding.medicineName);
        dialog.alert({
            title: i18n.dosagePrescribedHeading,
            message: i18n.enterDosesPrescribed + binding.medicineName,
            okButtonText: i18n.ok,
        })

        changeTotalDosesPerDay();

        const deleteButton: any = getDeleteButtonView();
        deleteButton.color = deleteButtonColors_On[settings.currentTab];
    }
    else {
        // An existing medicine, "medicineName" was found in list
        isEditingAvailable = true;
        viewModel.set("isEditingAvailable", isEditingAvailable);

        isEditingDosesTakenToday = false;
        viewModel.set("isEditingDosesTakenToday", isEditingDosesTakenToday);

        displayCurrentDoses();
        displayDosesPerDayInstructions(settings.currentMedicineCabinet.getDailyDosesRequired(settings.currentMedicineName));
    }
}

export function onCancelNewMedicineTap() {
    viewModel.set("isAddingNewMedicine", false);
    viewModel.set("currentMedicineName", settings.currentMedicineName);

    displayCurrentDoses();
    displayDosesPerDayInstructions(settings.currentMedicineCabinet.getDailyDosesRequired(settings.currentMedicineName));

    vr.stopListening();
}

export function onLogoTap() {
    // alert(Settings.version);
    dialog.alert({
        title: "nobleIQ Home Pharmacist",
        message: Settings.version,
        okButtonText: "Dismiss",
    })
}

export function onTabsLoaded() {
    if (!settings.currentTab) {
        settings.currentTab = 0;
    }
    else {
        viewModel.set("tabSelectedIndex", settings.currentTab);
    }
}

export function onSelectedIndexChanged(args: SelectedIndexChangedEventData) {

    if ((isTabsViewInitialized) && (!settings.isNewBinding) && (!settings.isConfirmingDose) && (!settings.isAddingNewMedicine)) {
        clearListDosesTakenToday();

        settings.currentTab = args.newIndex;
        settings.currentMedicineCabinet = medicineCabinets[settings.currentTab];
        setMedicineCabinetOwnerInfo();
        setRecordIconColor();

        settings.currentMedicineName = settings.currentMedicineCabinet.getMedicineBindingByIndex(0).medicineName;

        // Update view-model settings
        // Call after all "settings" have been updated
        updateViewModelGlobals();

        // Display text in selected language
        setActiveLanguageText();

        const listView: ListView = page.getViewById<ListView>("medicine-list");
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
    if (settings.currentMedicineCabinet === null) {
        settings.currentMedicineCabinet = myMedicineCabinet;
    }

    setTimeout(() => {
        let isUiComplete: boolean = false;
        isUiComplete = displayCurrentListDoses();
        if (!isUiComplete) {
            setTimeout(() => {
                displayCurrentListDoses();
            }, 200);
        }
        setRecordIconColor();
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
    // setRecordIconColor();

    // Call after all "settings" have been updated
    updateViewModelGlobals();

    // Set text to active language
    setActiveLanguageText();

    // startTagListener checks if listener is active before starting
    rfid.startTagListener();

    if (settings.isAddingNewMedicine) {
        setTimeout(() => {
            settings.isAddingNewMedicine = false;
            onAddMedTapAfterWizard();
        }, 200);
    }
    else {
        displayDosesPerDayInstructions(settings.currentMedicineCabinet.getDailyDosesRequired(settings.currentMedicineName));
    }
};

export function onChangeTotalDosesPerDayTap(args: EventData) {
    changeTotalDosesPerDay();
}

export function onSaveTotalDosesPerDayTap() {
    // Save changes
    medicineCabinets[settings.currentTab] = new MedicineCabinet(tempMedicineCabinet.owner, tempMedicineCabinet.medicines, tempMedicineCabinet.ownerTitle);
    settings.currentMedicineCabinet = medicineCabinets[settings.currentTab];
    setMedicineCabinetOwnerInfo();

    tempMedicineCabinet = null;

    isEditingTotalDosesPerDay = false;
    viewModel.set("isEditingTotalDosesPerDay", isEditingTotalDosesPerDay);

    let editDosesTakenTodayButton: Button = page.getViewById("edit-doses-taken-today");
    editDosesTakenTodayButton.backgroundColor = primaryOn;

    let currentMedicineNameView: any = page.getViewById("current-medicine-name");
    currentMedicineNameView.color = primaryOn;

    let currentMedicineNameIcon: Label = page.getViewById("current-medicine-name-icon");
    currentMedicineNameIcon.color = new Color(medsIconDosesTakenTodayOff);

    displayCurrentDoses();
    displayCurrentListDoses();

    settings.currentMedicineName = removeSpecialCharacters(viewModel.get("currentMedicineName"));
    displayDosesPerDayInstructions(settings.currentMedicineCabinet.getDailyDosesRequired(settings.currentMedicineName));
}

export function onCancelTotalDosesPerDayTap() {
    tempMedicineCabinet = null;

    isEditingTotalDosesPerDay = false;
    viewModel.set("isEditingTotalDosesPerDay", isEditingTotalDosesPerDay);

    let currentMedicineNameIcon: Label = page.getViewById("current-medicine-name-icon");
    currentMedicineNameIcon.color = new Color(medsIconDosesTakenTodayOff);

    let editDosesTakenTodayButton: Button = page.getViewById("edit-doses-taken-today");
    editDosesTakenTodayButton.backgroundColor = primaryOn;

    let currentMedicineNameView: any = page.getViewById("current-medicine-name");
    currentMedicineNameView.color = primaryOn;

    displayCurrentDoses();
    displayCurrentListDoses();

    let medicineName: string = removeSpecialCharacters(viewModel.get("currentMedicineName"));
    settings.currentMedicineName = removeSpecialCharacters(viewModel.get("currentMedicineName"));

    displayDosesPerDayInstructions(settings.currentMedicineCabinet.getDailyDosesRequired(settings.currentMedicineName));
}

export function onChangeDosesTakenTodayTap(args: EventData) {
    if ((isEditingAvailable) && (!isEditingTotalDosesPerDay)) {
        // Copy list to temp list for editing
        tempMedicineCabinet = new MedicineCabinet(settings.currentMedicineCabinet.owner, settings.currentMedicineCabinet.medicines, settings.currentMedicineCabinet.ownerTitle);

        isEditingDosesTakenToday = true;
        viewModel.set("isEditingDosesTakenToday", isEditingDosesTakenToday);

        let i18nSaveButtonText: string = getI18nSaveButtonText();
        viewModel.set("i18nSaveButtonText", i18nSaveButtonText);

        let i18nCancelButtonText: string = getI18nCancelButtonText();
        viewModel.set("i18nCancelButtonText", i18nCancelButtonText);

        let editTotalDosesPerDayButton: Button = page.getViewById("edit-total-required-doses");
        editTotalDosesPerDayButton.backgroundColor = secondaryOff;

        let currentMedicineNameIcon: Label = page.getViewById("current-medicine-name-icon");
        currentMedicineNameIcon.color = new Color(medsIconDosesTakenTodayOn);

        let medicineName: string = removeSpecialCharacters(viewModel.get("currentMedicineName"));
        let currentMedicineNameView: any = page.getViewById("current-medicine-name");
        currentMedicineNameView.color = primaryOn;


        let dosesTakenToday: number = tempMedicineCabinet.getDosesTakenToday(medicineName);
        let dailyDosesRequired: number = tempMedicineCabinet.getDailyDosesRequired(medicineName);

        let indicatorIdLoopExitIndx: number = 6;
        let doseIndicatorBaseId: string = "current";
        for (let i = 1; i < indicatorIdLoopExitIndx; i++) {
            let doseIndicatorId: string = doseIndicatorBaseId + i.toString(10);
            let doseIndicator: any = page.getViewById<any>(doseIndicatorId);

            if (i <= dosesTakenToday) {
                if (i <= dailyDosesRequired) {
                    doseIndicator.color = primaryOn;
                }
                else {
                    // doseIndicator.color = "lightgreen";
                    doseIndicator.color = overdoseOn;
                }
            }
            else {
                if (i <= dailyDosesRequired) {
                    doseIndicator.color = primaryOff;
                }
                else {
                    doseIndicator.color = overdoseOff;
                }
            }
        }
    }
}

export function onSaveDosesTakenTodayTap() {
    // Save changes
    medicineCabinets[settings.currentTab] = new MedicineCabinet(tempMedicineCabinet.owner, tempMedicineCabinet.medicines, tempMedicineCabinet.ownerTitle);
    settings.currentMedicineCabinet = medicineCabinets[settings.currentTab];
    setMedicineCabinetOwnerInfo();

    tempMedicineCabinet = null;

    isEditingDosesTakenToday = false;
    viewModel.set("isEditingDosesTakenToday", isEditingDosesTakenToday);

    let editTotalDosesPerDayButton: Button = page.getViewById("edit-total-required-doses");
    editTotalDosesPerDayButton.backgroundColor = secondaryOn;

    let currentMedicineNameIcon: Label = page.getViewById("current-medicine-name-icon");
    currentMedicineNameIcon.color = new Color(medsIconDosesTakenTodayOff);

    let currentMedicineNameView: any = page.getViewById("current-medicine-name");
    currentMedicineNameView.color = primaryOn;

    displayCurrentDoses();
    displayCurrentListDoses();

    settings.currentMedicineName = removeSpecialCharacters(viewModel.get("currentMedicineName"));
    displayDosesPerDayInstructions(settings.currentMedicineCabinet.getDailyDosesRequired(settings.currentMedicineName));
}

export function onCancelDosesTakenTodayTap() {
    tempMedicineCabinet = null;

    isEditingDosesTakenToday = false;
    viewModel.set("isEditingDosesTakenToday", isEditingDosesTakenToday);

    let editTotalDosesPerDayButton: Button = page.getViewById("edit-total-required-doses");
    editTotalDosesPerDayButton.backgroundColor = secondaryOn;

    let currentMedicineNameIcon: Label = page.getViewById("current-medicine-name-icon");
    currentMedicineNameIcon.color = new Color(medsIconDosesTakenTodayOff);

    let currentMedicineNameView: any = page.getViewById("current-medicine-name");
    currentMedicineNameView.color = primaryOn;

    displayCurrentDoses();
    displayCurrentListDoses();

    settings.currentMedicineName = removeSpecialCharacters(viewModel.get("currentMedicineName"));
    displayDosesPerDayInstructions(settings.currentMedicineCabinet.getDailyDosesRequired(settings.currentMedicineName));
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
        let medicineName: string = removeSpecialCharacters(viewModel.get("currentMedicineName"));
        if (!medicineName) {
            // alert(i18n.selectMedicineMsg);
            dialog.alert({
                title: i18n.selectingMedicineTitle,
                message: i18n.selectMedicineMsg,
                okButtonText: i18n.ok,
            })
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

function removeSpecialCharacters(src: string): string {
    let dst: string = src.replace(/[^a-zA-Z]/g, "");
    return dst;
}

function capitalizeFirstLetter(string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getDeleteButtonView(): any {
    const medicineDeleteButtonIds: string[] = ["delete-t1-medicine", "delete-t2-medicine", "delete-t3-medicine"]

    let deleteButtonId: string = medicineDeleteButtonIds[settings.currentTab];
    let deleteButtonView: any = page.getViewById(deleteButtonId);
    return deleteButtonView
}

function setMedicineCabinetOwnerInfo() {
    let medicineCabinetImages: string[] = ['~/images/home.jpg', '~/images/momPharmacist.jpg', '~/images/dadPharmacist.jpg'];
    let medicineCabinetOwners: string[] = [i18n.me, i18n.mom, i18n.dad];
    let owner: string = medicineCabinetOwners[settings.currentTab];
    settings.currentMedicineCabinet.owner = capitalizeFirstLetter(owner);

    let medicineCabinetOwnerTitles: string[] = [i18n.myMedicineCabinet, i18n.momsMedicineCabinet, i18n.dadsMedicineCabinet];
    let ownerMedicineCabinetText: string = medicineCabinetOwnerTitles[settings.currentTab];
    settings.currentMedicineCabinet.ownerTitle = ownerMedicineCabinetText;

    let parallax: View = page.getViewById<ListView>("headerTemplate");
    parallax.backgroundImage = medicineCabinetImages[settings.currentTab];
}

function changeTotalDosesPerDay() {
    if ((isEditingAvailable) && (!isEditingDosesTakenToday)) {
        // Copy list to temp list for editing
        tempMedicineCabinet = new MedicineCabinet(settings.currentMedicineCabinet.owner, settings.currentMedicineCabinet.medicines, settings.currentMedicineCabinet.ownerTitle);
        setMedicineCabinetOwnerInfo();

        isEditingTotalDosesPerDay = true;
        viewModel.set("isEditingTotalDosesPerDay", isEditingTotalDosesPerDay);

        let i18nSaveButtonText: string = getI18nSaveButtonText();
        viewModel.set("i18nSaveButtonText", i18nSaveButtonText);

        let i18nCancelButtonText: string = getI18nCancelButtonText();
        viewModel.set("i18nCancelButtonText", i18nCancelButtonText);

        let currentMedicineNameIcon: Button = page.getViewById("current-medicine-name-icon");
        currentMedicineNameIcon.color = new Color(medsIconDosesPerDayOn);

        let editDosesTakenTodayButton: Button = page.getViewById("edit-doses-taken-today");
        editDosesTakenTodayButton.backgroundColor = primaryOff;

        let currentMedicineNameView: any = page.getViewById("current-medicine-name");
        currentMedicineNameView.color = secondaryOn;

        let doseIndicatorBaseId: string = "current";
        let medicineName: string = removeSpecialCharacters(viewModel.get("currentMedicineName"));
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
        let doseIndicatorIdBase: string = medicine.medicineName;

        // Iterate over each display position
        let maxDosesDisplayed: number = 6;
        for (let i = 1; i < maxDosesDisplayed; i++) {
            // Get the view id for the current indicator
            let doseIndicatorId: string = doseIndicatorIdBase + i.toString(10);
            let doseIndicator: any = page.getViewById<any>(doseIndicatorId);
            if (doseIndicator == null) {
                continue;
            }
            else {
                doseIndicator.color = new Color("white");
            }
        }
    })
}

function displayCurrentDoses() {
    let doseIndicatorIdBase: string = "current";
    let medicineName: string = removeSpecialCharacters(viewModel.get("currentMedicineName"));

    let dosesTakenToday: number = settings.currentMedicineCabinet.getDosesTakenToday(medicineName);
    let dailyDosesRequired: number = settings.currentMedicineCabinet.getDailyDosesRequired(medicineName);

    // Iterate over each display position
    let maxDosesDisplayed: number = 6;
    for (let i = 1; i < maxDosesDisplayed; i++) {
        // Get the view id for the current indicator
        let doseIndicatorId: string = doseIndicatorIdBase + i.toString(10);
        let doseIndicator: Label = page.getViewById(doseIndicatorId);
        if (doseIndicator) {
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
                    doseIndicator.color = new Color(overdoseOn);
                }
                else {
                    doseIndicator.color = new Color("white");
                }
            }
        }
    }
}

function toggleIndicator(indicator: any): number {
    let adjustTotal: number = 0;
    let indicatorCurrentColor: string = indicator.color.toString().toLowerCase();

    if (isEditingDosesTakenToday) {
        // Doses taken today
        if (indicatorCurrentColor === primaryOff.toLowerCase() || indicatorCurrentColor === overdoseOff.toLowerCase()) {
            adjustTotal = 1;
        }
        else {
            adjustTotal = -1;
        }
    }
    // Total doses per day
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
    let medicineName: string = removeSpecialCharacters(viewModel.get("currentMedicineName"));

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
            indicator.color = overdoseOn;
        }
    }
    else {
        // Subtracting a dose
        if (dose <= dailyDosesRequired) {
            indicator.color = primaryOff;
        }
        else {
            indicator.color = overdoseOff;
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
    let medicineName: string = removeSpecialCharacters(viewModel.get("currentMedicineName"));
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

            let doseIndicator: any = page.getViewById<any>(doseIndicatorId);
            if (!doseIndicator) {
                isUiComplete = false;
                return isUiComplete;
            }

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
                    doseIndicator.color = new Color(overdoseOn);
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
        dialog.alert({
            title: i18n.dosagePrescribedHeading,
            message: i18n.enterDosesPrescribed + settings.currentMedicineName,
            okButtonText: i18n.ok,
        })
    }
    return isUiComplete;
}

function registerDoseTaken(medicineName: string): void {
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

    // Reset trigger whether confirmed or not
    settings.isConfirmingDose = false;
}

function updateViewModelGlobals() {
    setTimeout(() => {
        let deleteButton: any = getDeleteButtonView();
        if (deleteButton) {
            if (settings.currentMedicineCabinet.medicines.length === 1) {
                deleteButton.color = deleteButtonColors_Off[settings.currentTab];
            }
            else {
                deleteButton.color = deleteButtonColors_On[settings.currentTab];
            }
        }
    }, 400);

    viewModel.set("tabSelectedIndex", settings.currentTab);
    viewModel.set("medicineList", settings.currentMedicineCabinet.medicines);
    viewModel.set("currentMedicineName", settings.currentMedicineName);
    viewModel.set("isAudioEnabled", settings.isAudioEnabled);
}

function setActiveLanguageText(): void {
    viewModel.set("i18nSynavoxSubPageTitle", i18n.synavoxSubPageTitle);

    viewModel.set("i18nMedicineCabinetOwnerTitle", settings.currentMedicineCabinet.ownerTitle);
    viewModel.set("i18nSynavoxSubPageTitle", i18n.synavoxSubPageTitle);

    viewModel.set("i18nMe", i18n.me);
    viewModel.set("i18nMom", i18n.mom);
    viewModel.set("i18nDad", i18n.dad);

    viewModel.set("i18nMyPrescriptions", i18n.myPrescriptions);
    viewModel.set("i18nMomsPrescriptions", i18n.momsPrescriptions);
    viewModel.set("i18nDadsPrescriptions", i18n.dadsPrescriptions);

    viewModel.set("i18nEditTotalDosesPerDayButtonText", i18n.changeDosesPerDay);
    viewModel.set("i18nEditDosesTakenTodayButtonText", i18n.changeDosesTaken);

    viewModel.set("isMedicineNameEditable", isMedicineNameEditable);
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

