import { TNSPlayer, TNSRecorder, AudioRecorderOptions } from 'nativescript-audio';
import { I18N } from "~/utilities/i18n";
import { Settings } from "~/settings/settings";
import { MedicineBinding } from '~/data-models/medicine-cabinet';

export class AudioRecorder {
    private _i18n: I18N = I18N.getInstance();
    private static readonly _lanugageDirectoryRoot: string = "~/audio/";

    // App scope variables
    private _settings: Settings;

    private static _recorder: TNSRecorder = null;
    private static _instance: AudioRecorder = new AudioRecorder();

    constructor() {
        console.log("AudioRecorder - private constructor() invoked");
        if (AudioRecorder._recorder) {
            throw new Error("Error: Instantiation failed: Use AudioRecorder.getInstance() instead of new.");
        }
        AudioRecorder._instance = this;

        AudioRecorder._recorder = new TNSRecorder();
        AudioRecorder._recorder.debug = true; // set true to enable TNSPlayer console logs for debugging.

        this._i18n = I18N.getInstance();
        this._settings = Settings.getInstance();
    }

    public static getInstance() {
        return this._instance;
    }

    private static _onInfo(info: any) {
        console.log("options infoCallback: infoCallback.info = " + info);
    }

    private static _onError(error: any) {
        console.log("options errorCallback: onError.error = " + error);
    }

    public record(medicineName: string) {
        let audioPath: string = this.getAudioPath(medicineName);
        let options: AudioRecorderOptions = {
            filename: audioPath,
            infoCallback: AudioRecorder._onInfo.bind(this),
            errorCallback: AudioRecorder._onError.bind(this),
        };

        AudioRecorder._recorder
            .start(options)
            .then(() => {
                console.log("Promise has been resolved, or 'onfulfilled");
            })
            .then(() => {
                console.log("Promise has been rejected, or 'onrejected");
            })
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
    //                 // console.log(`audio duration:`, duration);
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
    //                 // console.log(`audio duration:`, duration);
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
            languageDirectory = "en/custom";
        }
        else {
            languageDirectory = "sp/custom";
        }

        let audioPath = AudioRecorder._lanugageDirectoryRoot + languageDirectory + medicineName.toLowerCase() + ".mp3";

        //let file: fs.File = new fs.File();
        //let fileExists: boolean = fs.File.exists(audioPath);
        //fileExists= true; // Until I figure out how to use or get a better fs object

        // if (!fileExists) {
        // alert("No corresponding audio: " + audioPath + " using default...");
        // audioPath = getDefaultAudio(languageDirectory);
        // }
        return audioPath;
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

        //let file: fs.File = new fs.File();
        //let fileExists: boolean = fs.File.exists(audioPath);
        //fileExists= true; // Until I figure out how to use or get a better fs object

        // if (!fileExists) {
        // alert("No corresponding audio: " + audioPath + " using default...");
        // audioPath = getDefaultAudio(languageDirectory);
        // }
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
        console.log('reference back to player:', args.player);
        // iOS only: flag indicating if completed succesfully
        console.log('whether song play completed successfully:', args.flag);
    }

    private static _trackError(args: any) {
        console.log('reference back to player:', args.player);
        console.log('the error:', args.error);
        // Android only: extra detail on error
        console.log('extra info on the error:', args.extra);
    }
}
