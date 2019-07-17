import { SpeechRecognition, SpeechRecognitionTranscription } from "nativescript-speech-recognition";
import { Settings } from "~/settings/settings";
import { onSpeechRecognition_home } from "~/home/home-page";
import { onSpeechRecognition_pair } from "~/pair/pair-page";

export class VR {
    private static _instance: VR = new VR();

    private settings: Settings;
    private speechRecognition: SpeechRecognition;

    private constructor() {
        if (VR._instance) {
            throw new Error("Error: Instantiation failed: Use VR.getInstance() instead of new.");
        }
        VR._instance = this;
        this.settings = Settings.getInstance();
        this.speechRecognition = new SpeechRecognition();

        this.checkAvailability();
    }

    public static getInstance() {
        return this._instance;
    }

    private checkAvailability(): void {
        this.settings.isSpeechRecognitionAvailable = false; // Initialize

        // alert("inside checkAvailability()");
        this.speechRecognition.available()
            .then((available: boolean) => {
                // alert(available ? "Voice Recognition is available on this device" : "Voice Recognition is NOT available on this device");
                this.settings.isSpeechRecognitionAvailable = available;
                if (Settings.isDebugBuild) {
                    console.log("isSpeechRecognitionAvailable: ", available);
                }
            },
                (err: string) => {
                    if (Settings.isDebugBuild) {
                        console.log(err);
                    }
                }
            )
            .then(() => {
                this.requestPermission();
            })
    }

    private requestPermission(): void {
        this.speechRecognition.requestPermission().then((granted: boolean) => {
            this.settings.isSpeechRecognitionAvailable = granted;
        });
    }

    public startListening() {
        this.speechRecognition.startListening(
            {
                // optional, uses the device locale by default
                locale: "en-US",
                // set to true to get results back continuously
                returnPartialResults: true,
                // this callback will be invoked repeatedly during recognition
                onResult: (transcription: SpeechRecognitionTranscription) => {
                    this.onSpeechRecognition(transcription.text);
                },
                onError: (error: string | number) => {
                    // because of the way iOS and Android differ, this is either:
                    // - iOS: A 'string', describing the issue. 
                    // - Android: A 'number', referencing an 'ERROR_*' constant from https://developer.android.com/reference/android/speech/SpeechRecognizer.
                    //            If that code is either 6 or 7 you may want to restart listening.
                }
            }
        ).then(
            (started: boolean) => {
                if (Settings.isDebugBuild) {
                    console.log(`started listening`)
                }
            },
            (errorMessage: string) => {
                if (Settings.isDebugBuild) {
                    console.log(`Error: ${errorMessage}`);
                }
            }
        ).catch((error: string | number) => {
            // same as the 'onError' handler, but this may not return if the error occurs after listening has successfully started (because that resolves the promise,
            // hence the' onError' handler was created.
        });
    }

    public stopListening() {
        this.speechRecognition.stopListening().then(
            () => {
                if (Settings.isDebugBuild) {
                    console.log(`stopped listening`)
                }
            },
            (errorMessage: string) => {
                if (Settings.isDebugBuild) {
                    console.log(`Stop error: ${errorMessage}`);
                }
            }
        );
    }

    private onSpeechRecognition(transcription: string) {
        switch (this.settings.currentPage) {
            case "home": {
                onSpeechRecognition_home(transcription);
                break;
            }
            case "pair": {
                onSpeechRecognition_pair(transcription);
                break;
            }
            default: {
                alert("settings.currentPage not set!");
                break;
            }
        }
    }
}