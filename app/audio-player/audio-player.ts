import { TNSPlayer } from 'nativescript-audio';
import { I18N } from "~/utilities/i18n";
import { Settings } from "~/settings/settings";
import { MedicineBinding } from '~/data-models/medicine-binding';

export class AudioPlayer {
    private _i18n: I18N = I18N.getInstance();
    private static readonly _lanugageDirectoryRoot: string = "~/audio/";

    // App scope variables
    private _settings: Settings;

    private static _player: TNSPlayer = null;
    private static _instance: AudioPlayer = new AudioPlayer();

    constructor() {
        console.log("AudioPlayer - private constructor() invoked");
        if (AudioPlayer._player) {
            throw new Error("Error: Instantiation failed: Use AudioPlayer.getInstance() instead of new.");
        }
        AudioPlayer._instance = this;

        AudioPlayer._player = new TNSPlayer();
        AudioPlayer._player.debug = true; // set true to enable TNSPlayer console logs for debugging.

        this._i18n = I18N.getInstance();
        this._settings = Settings.getInstance();
    }

    public static getInstance() {
        return this._instance;
    }

    public useAudio(medicineName: string) {
        let audioPath: string = this.getAudioPath(medicineName);
        AudioPlayer._player
            .initFromFile({
                audioFile: audioPath, // ~ = app directory
                loop: false,
                completeCallback: AudioPlayer._trackComplete.bind(this),
                errorCallback: AudioPlayer._trackError.bind(this)
            })
            .then(() => {
                AudioPlayer._player.getAudioTrackDuration().then(duration => {
                    // iOS: duration is in seconds
                    // Android: duration is in milliseconds
                    // console.log(`audio duration:`, duration);
                    // alert("Audio duration: " + duration);
                });
            });
    }

    public play(medicineName: string) {
        this.useAudio(medicineName);
        AudioPlayer._player.play();
    }

    public playFrom(audioPath: string) {
        AudioPlayer._player
            .initFromFile({
                audioFile: audioPath, // ~ = app directory
                loop: false,
                completeCallback: AudioPlayer._trackComplete.bind(this),
                errorCallback: AudioPlayer._trackError.bind(this)
            })
            .then(() => {
                AudioPlayer._player.getAudioTrackDuration().then(duration => {
                    // iOS: duration is in seconds
                    // Android: duration is in milliseconds
                    // console.log(`audio duration:`, duration);
                    // alert("Audio duration: " + duration);
                });
            })
            .then(() => {
                AudioPlayer._player.play()
            });
    }

    public pause() {
        AudioPlayer._player.pause();
    }

    public stop() {
        this.useAudio("");
        // AudioPlayer._player.dispose(); <- this is the correct way to do this, implement later...
    }

    public togglePlay() {
        if (AudioPlayer._player.isAudioPlaying()) {
            AudioPlayer._player.pause();
        } else {
            AudioPlayer._player.play();
        }
    }

    private getAudioPath(medicineName: string): string {
        let languageDirectory: string;
        let activeLanguage: string = this._i18n.activeLanguage;
        if (activeLanguage === "english") {
            languageDirectory = "en/";
        }
        else {
            languageDirectory = "sp/";
        }

        let audioPath = AudioPlayer._lanugageDirectoryRoot + languageDirectory + medicineName.toLowerCase() + ".mp3";

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
        let binding: MedicineBinding = this._settings.medicineList.getMedicineBindingByTagId(tagId);
        if (binding === null) {
            // medicineName not found in current list of medicine bindings
            medicineName = "default";
        }
        else {
            medicineName = binding.medicineName;
        }
        let audioPath = AudioPlayer._lanugageDirectoryRoot + languageDirectory + medicineName.toLowerCase() + ".mp3";

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
        let defaultAudioPath: string = AudioPlayer._lanugageDirectoryRoot + languageDirectory + "/default.mp3";
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
