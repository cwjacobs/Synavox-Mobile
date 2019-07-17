import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData } from "tns-core-modules/data/observable";
import { NavigatedData, Page, Color } from "tns-core-modules/ui/page";

import { WebView, LoadEventData } from "tns-core-modules/ui/web-view";

import { NewTagViewModel } from "~/xition/new-tag/new-tag-view-model";

import { I18N } from "~/utilities/i18n";

import { Settings } from "~/settings/settings";
let settings: Settings = Settings.getInstance();

import { AudioPlayer } from "~/audio-player/audio-player";
import { navigateTo } from "~/app-root/app-root";
import { onCustomRecordWizardExit, stopRecording } from "~/home/home-page";
import { Button } from "tns-core-modules/ui/button/button";
import { MedicineBinding } from "~/data-models/medicine-cabinet";

import fileSystemModule = require('tns-core-modules/file-system');
const audioFolder = fileSystemModule.knownFolders.currentApp().getFolder('recordings');

let recorder: any;
let recordedAudioFilePath: string = null;
let audioPlayer: AudioPlayer = AudioPlayer.getInstance();

let page: Page = null;
let viewModel: NewTagViewModel = null;

const isPressed: boolean = true;

// Page Text
let i18n = I18N.getInstance();

export function onTextViewLoaded(args) {
    setActiveLanguageText();
}

export function onNavigatingTo(args: NavigatedData) {
    page = <Page>args.object;
    viewModel = new NewTagViewModel();
    page.bindingContext = viewModel;
}

export function onNavigatingFrom(args: NavigatedData) {
    audioPlayer.stop();
}

export function onDrawerButtonTap(args: EventData) {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
}

export function onLoaded(args: EventData) {
    viewModel.set("isL1", true);
    viewModel.set("isL2", false);
    viewModel.set("isL3", false);
    viewModel.set("isL4", false);

    setActiveLanguageText();
    setRecordButtonStateColor(!isPressed);
}

export function onSkipTap() {
    onNextL2Tap();
}

export function onNextL1Tap() {
    viewModel.set("isL1", false);
    viewModel.set("isL2", true);
    viewModel.set("isL3", false);
    viewModel.set("isL4", false);
}

export function onRecordTap() {
    recordedAudioFilePath = null;
    viewModel.set("isRecording", true);

    setRecordButtonStateColor(isPressed);
    recorder = onCustomRecordWizardExit(settings.currentMedicineName);
}

export function onStopTap() {
    viewModel.set("isRecording", false);

    setRecordButtonStateColor(!isPressed);
    recordedAudioFilePath = stopRecording(recorder);
}

export function onSaveTap() {
    viewModel.set("isRecording", false);
    setRecordButtonStateColor(!isPressed);

    if (recordedAudioFilePath === null) {
        alert("audioFileName === null");
    }
    else {
        let index: number = settings.currentMedicineCabinet.getMedicineBindingIndex(settings.currentMedicineName);
        if (index === -1) {
            alert("onSaveTap index for " + settings.currentMedicineName + " not found");
        }
        else {
            // Get medicine name track, then delete if it already exists
            let customAudioFileName: string = settings.currentMedicineName.toLowerCase() + ".mp3";
            let customAudioFile: fileSystemModule.File = audioFolder.getFile(customAudioFileName);
            customAudioFile.remove();

            // Get and rename the newly recorded audio for settings.currentMedicineName
            let recordedAudioFileName: string = settings.currentMedicineName.toLowerCase() + ".rec";
            let recordedAudioFile: fileSystemModule.File = audioFolder.getFile(recordedAudioFileName)
            recordedAudioFile.rename(customAudioFileName);

            let customAudioFilePath: string = recordedAudioFile.path;
            // audioPlayer.playFrom(customAudioFilePath); // Audio plays too often, remove this. User can always play audio from home screen

            if (Settings.isDebugBuild) {
                console.log("customAudioFilePath: " + customAudioFilePath);
            }
            let medicineBinding: MedicineBinding = settings.currentMedicineCabinet.getMedicineBindingByIndex(index);
            medicineBinding.audioTrack = customAudioFilePath;
            settings.currentMedicineCabinet.replaceMedicineBinding(index, medicineBinding);
        }
    }

    // settings.isNewRecording = true;
    settings.isNewBinding = false;

    let pageTitle: string = "Home";
    let pageRoute: string = "home/home-page";
    navigateTo(pageTitle, pageRoute);
}

export function onBackL3Tap() {
    onNextL1Tap();
}

export function onCancelTap() {
    recordedAudioFilePath = null;
    settings.isNewBinding = false;

    let pageTitle: string = "Home";
    let pageRoute: string = "home/home-page";
    navigateTo(pageTitle, pageRoute);
}

export function onNextL2Tap() {
    viewModel.set("isL1", false);
    viewModel.set("isL2", false);
    viewModel.set("isL3", true);
    viewModel.set("isL4", false);
}

function setRecordButtonStateColor(isPressed: boolean): void {
    return;
    let recordButtonView: Button = page.getViewById("record-button");
    if (!recordButtonView) {
        alert("setRecordButtonColor: !recordButtonView...");
        return;
    }

    let color: Color = null;
    let backgroundColor: Color = null;
    if (isPressed) {
        recordButtonView.color = new Color("black");
        recordButtonView.backgroundColor = new Color("red");
        // recordButtonView.backgroundColor = new Color(Settings.brightIconColors[settings.currentTab]);
    }
    else {
        recordButtonView.color = new Color("white");
        recordButtonView.backgroundColor = new Color("#3A53FF");
    }

    if (color) {
        recordButtonView.color = color;
    }

    if (backgroundColor) {
        recordButtonView.backgroundColor = backgroundColor;
    }
}

function getTagIdText(tagId: string): string {
    let text: string = i18n.tagId + ": " + tagId;
    return text;
}

function setActiveLanguageText(): void {
    viewModel.set("i18nPageTitle", i18n.customAudioPageTitle);
    viewModel.set("i18nSynavoxSubPageTitle", i18n.synavoxSubPageTitle);

    let tagIdText: string = getTagIdText(settings.currentMedicineName);
    viewModel.set("medicineName", settings.currentMedicineName);

    viewModel.set("i18nStop", i18n.stop);
    viewModel.set("i18nSave", i18n.save);
    viewModel.set("i18nBack", i18n.back);
    viewModel.set("i18nSkip", i18n.skip);
    viewModel.set("i18nNext", i18n.next);
    viewModel.set("i18nCancel", i18n.cancel);
    viewModel.set("i18nRecord", i18n.record);

    viewModel.set("editState", false);
    viewModel.set("i18nCustomAudioIntro_L1", i18n.customAudioIntro_L1);
    viewModel.set("i18nCustomAudioIntro_L2", i18n.customAudioIntro_L2);
    viewModel.set("i18nCustomAudioIntro_L3", i18n.customAudioIntro_L3);
    viewModel.set("i18nCustomAudioIntro_L4", i18n.customAudioIntro_L4);
    viewModel.set("i18nCustomAudioIntro_L5", i18n.customAudioIntro_L5);
};

