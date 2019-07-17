import { TNSRecorder, AudioRecorderOptions } from 'nativescript-audio';
import { I18N } from "~/utilities/i18n";
import { Settings } from "~/settings/settings";
import { MedicineBinding } from '~/data-models/medicine-cabinet';

import fileSystemModule = require('tns-core-modules/file-system');
import platform = require('tns-core-modules/platform');

export class AudioRecorder {
    private static source: number;

    private _i18n: I18N = I18N.getInstance();
    private static readonly _lanugageDirectoryRoot: string = "/audio/";

    // App scope variables
    private _settings: Settings;

    private static _recorder: TNSRecorder = null;
    private static _instance: AudioRecorder = new AudioRecorder();

    constructor() {
        if (AudioRecorder._recorder) {
            throw new Error("Error: Instantiation failed: Use AudioRecorder.getInstance() instead of new.");
        }
        AudioRecorder._instance = this;

        if (Settings.isDebugBuild) {
            console.log("AudioRecorder - private constructor() invoked");
        }

        AudioRecorder._recorder = new TNSRecorder();
        AudioRecorder._recorder.debug = Settings.isDebugBuild;  // set true to enable TNSPlayer console logs for debugging.

        this._i18n = I18N.getInstance();
        this._settings = Settings.getInstance();
    }

    public static getInstance() {
        return this._instance;
    }

    private static _onInfo(info: any) {
        if (Settings.isDebugBuild) {
            console.log("options infoCallback: infoCallback.info = ", info);
        }
    }

    private static _onError(error: any) {
        if (Settings.isDebugBuild) {
            console.log("options errorCallback: onError.error = ", error);
        }
    }

    public record(medicineName: string) {
        let audioFolder = fileSystemModule.knownFolders.currentApp().getFolder(this.getAudioFolder());

        let audioFile: string = audioFolder.path + this.getAudioFile(medicineName);
        alert(audioFile);

        // let hasPermission: boolean = AudioRecorder._recorder.hasRecordPermission();
        // alert("Has permission: " + AudioRecorder._recorder.hasRecordPermission());

        let androidEncoder = 3;

        let options: AudioRecorderOptions = {
            filename: audioFile,
            source: 1,
            format: "mp3",
            encoder: androidEncoder,
            infoCallback: AudioRecorder._onInfo.bind(this),
            errorCallback: AudioRecorder._onError.bind(this),
        }

        AudioRecorder._recorder
            .start(options)
            .then(() => {
                if (Settings.isDebugBuild) {
                    console.log("Promise has been resolved, or 'onfulfilled");
                }
            })
            .then(() => {
                if (Settings.isDebugBuild) {
                    console.log("Promise has been rejected, or 'onrejected");
                }
            })
    }

    public stop() {
        if (AudioRecorder._recorder.isRecording) {
            AudioRecorder._recorder
                .stop()
                .then(() => {
                    AudioRecorder._recorder.audioRecorderDidFinishRecording(AudioRecorder._recorder, true);
                })
        }
        else {
            if (Settings.isDebugBuild) {
                console.log("AudioRecorder is not recording");
            }
        }
    }
    // public record(medicineName: string) {
    //     let audioPath: string = this.getAudioPath(medicineName);
    //     AudioRecorder._recorder
    //         .initFromFile({
    //             audioFile: audioPath, // ~ = app directory
    //             loop: false,
    //             completeCallback: AudioRecorder._trackComplete.bind(this),
    //             errorCallback: AudioRecorder._trackError.bind(this)
    //         })
    //         .then(() => {
    //             AudioRecorder._recorder.getAudioTrackDuration().then(duration => {
    //                 // iOS: duration is in seconds
    //                 // Android: duration is in milliseconds
    //                 // _debug.console_log(`audio duration:`, duration);
    //                 // alert("Audio duration: " + duration);
    //             });
    //         })
    //         .then(() => {
    //             AudioRecorder._recorder.play()
    //         });;
    // }

    // public playFrom(audioPath: string) {
    //     AudioRecorder._recorder
    //         .initFromFile({
    //             audioFile: audioPath, // ~ = app directory
    //             loop: false,
    //             completeCallback: AudioRecorder._trackComplete.bind(this),
    //             errorCallback: AudioRecorder._trackError.bind(this)
    //         })
    //         .then(() => {
    //             AudioRecorder._recorder.getAudioTrackDuration().then(duration => {
    //                 // iOS: duration is in seconds
    //                 // Android: duration is in milliseconds
    //                 // _debug.console_log(`audio duration:`, duration);
    //                 // alert("Audio duration: " + duration);
    //             });
    //         })
    //         .then(() => {
    //             AudioRecorder._recorder.play()
    //         });
    // }

    // public pause() {
    //     AudioRecorder._recorder.pause();
    // }

    // public stop() {
    //     AudioRecorder._recorder.dispose();
    // }

    // public togglePlay() {
    //     if (AudioRecorder._recorder.isAudioPlaying()) {
    //         AudioRecorder._recorder.pause();
    //     } else {
    //         AudioRecorder._recorder.play();
    //     }
    // }

    private getAudioPath(medicineName: string): string {
        let languageDirectory: string;
        let activeLanguage: string = this._i18n.activeLanguage;
        if (activeLanguage === "english") {
            languageDirectory = "en/";
        }
        else {
            languageDirectory = "sp/";
        }

        let audioPath = AudioRecorder._lanugageDirectoryRoot + languageDirectory + medicineName.toLowerCase() + ".mp3";
        return audioPath;
    }

    private getAudioFile(medicineName: string): string {
        let audioFile = "/" + medicineName.toLowerCase() + ".mp3";
        return audioFile;
    }

    private getAudioFolder(): string {
        let languageDirectory: string;
        if (this._i18n.activeLanguage === "english") {
            languageDirectory = "en/";
        }
        else {
            languageDirectory = "sp/";
        }

        let audioFolder = AudioRecorder._lanugageDirectoryRoot + languageDirectory;
        return audioFolder;
    }

    public getAudioPathByTagId(tagId: string): string {
        let languageDirectory: string;
        let activeLanguage: string = this._i18n.activeLanguage;
        if (activeLanguage === "english") {
            languageDirectory = "en/";
        }
        else {
            languageDirectory = "sp/";
        }

        let medicineName: string;
        let binding: MedicineBinding = this._settings.currentMedicineCabinet.getMedicineBindingByTagId(tagId);
        if (binding === null) {
            // medicineName not found in current list of medicine bindings
            medicineName = "default";
        }
        else {
            medicineName = binding.medicineName;
        }
        let audioPath = AudioRecorder._lanugageDirectoryRoot + languageDirectory + medicineName.toLowerCase() + ".mp3";
        return audioPath;
    }

    public getDefaultAudioPath(): string {
        let languageDirectory: string;
        let activeLanguage: string = this._i18n.activeLanguage;

        if (activeLanguage === "english") {
            languageDirectory = "en/";
        }
        else {
            languageDirectory = "sp/";
        }
        let defaultAudioPath: string = AudioRecorder._lanugageDirectoryRoot + languageDirectory + "/default.mp3";
        return defaultAudioPath;
    }

    private static _trackComplete(args: any) {
        if (Settings.isDebugBuild) {
            console.log('reference back to player:', args.player);
        }
    }

    private static _trackError(args: any) {
        if (Settings.isDebugBuild) {
            console.log('reference back to player:', args.player);
            console.log('the error:', args.error);
            console.log('extra info on the error:', args.extra);
        }
    }
}
