import { TNSPlayer } from 'nativescript-audio';
import { I18N } from "~/utilities/i18n";
import { Settings } from "~/settings/settings";
import { MedicineBinding } from '~/data-models/medicine-cabinet';

export class AudioPlayer {
    private _i18n: I18N = I18N.getInstance();
    private static readonly _lanugageDirectoryRoot: string = "~/audio/";

    // App scope variables
    private settings: Settings = Settings.getInstance();

    private static _player: TNSPlayer = null;
    private static _instance: AudioPlayer = new AudioPlayer();

    constructor() {
        if (Settings.isDebugBuild) {
            console.log("AudioPlayer - private constructor() invoked");
        }

        if (AudioPlayer._player) {
            throw new Error("Error: Instantiation failed: Use AudioPlayer.getInstance() instead of new.");
        }
        AudioPlayer._instance = this;

        AudioPlayer._player = new TNSPlayer();
        AudioPlayer._player.debug = Settings.isDebugBuild; // set true to enable TNSPlayer console logs for debugging.

        this._i18n = I18N.getInstance();
    }

    public static getInstance() {
        return this._instance;
    }

    public play(medicineName: string) {
        if (this.settings.isAudioEnabled) {
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
                })
                .then(() => {
                    AudioPlayer._player.play()
                });
        }
    }

    public playFrom(audioPath: string) {
        if (this.settings.isAudioEnabled) {
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
    }

    public pause() {
        AudioPlayer._player.pause();
    }

    public stop() {
        AudioPlayer._player.dispose();
    }

    public togglePlay() {
        if (this.settings.isAudioEnabled) {
            if (AudioPlayer._player.isAudioPlaying()) {
                AudioPlayer._player.pause();
            } else {
                AudioPlayer._player.play();
            }
        }
    }

    private getAudioPath(medicineName: string): string {
        let audioPath: string;
        let binding: MedicineBinding = this.settings.currentMedicineCabinet.getMedicineBinding(medicineName);
        if (binding && binding.audioTrack) {
            audioPath = binding.audioTrack;
        }
        else {
            let languageDirectory: string;
            let activeLanguage: string = this._i18n.activeLanguage;
            if (activeLanguage === "english") {
                languageDirectory = "en/";
            }
            else {
                languageDirectory = "sp/";
            }
            audioPath = AudioPlayer._lanugageDirectoryRoot + languageDirectory + medicineName.toLowerCase() + ".mp3";
        }
        return audioPath;
    }

    public getAudioPathByTagId(tagId: string): string {
        let audioPath: string;
        let binding: MedicineBinding = this.settings.currentMedicineCabinet.getMedicineBindingByTagId(tagId);
        if (binding && binding.audioTrack) {
            audioPath = binding.audioTrack;
        }
        else {
            let languageDirectory: string;
            let activeLanguage: string = this._i18n.activeLanguage;
            if (activeLanguage === "english") {
                languageDirectory = "en/";
            }
            else {
                languageDirectory = "sp/";
            }

            let medicineName: string;
            if (binding === null) {
                // medicineName not found in current list of medicine bindings
                medicineName = "default";
            }
            else {
                medicineName = binding.medicineName;
            }
            audioPath = AudioPlayer._lanugageDirectoryRoot + languageDirectory + medicineName.toLowerCase() + ".mp3";
        }
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
        // iOS only: flag indicating if completed succesfully
        if (Settings.isDebugBuild) {
            console.log('reference back to player:' + args.player);
            console.log('whether song play completed successfully:' + args.flag);
        }
    }

    private static _trackError(args: any) {
        if (Settings.isDebugBuild) {
            console.log('reference back to player:' + args.player);
            console.log('the error:' + args.error);
            console.log('extra info on the error:' + args.extra);
        }
    }
}
