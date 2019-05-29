import { SpeechRecognition, SpeechRecognitionTranscription } from "nativescript-speech-recognition";
import { Settings } from "~/settings/settings";
import { onSpeechRecognition } from "~/pair/pair-page";

export class VR {
    private static _instance: VR = new VR();
    private isListening: boolean = false;
    private settings: Settings = Settings.getInstance();
    private speechRecognition = new SpeechRecognition();

    private constructor() {
        if (VR._instance) {
            throw new Error("Error: Instantiation failed: Use VR.getInstance() instead of new.");
        }
        VR._instance = this;
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
                console.log("isSpeechRecognitionAvailable: " + available);
            },
                (err: string) => {
                    console.log(err);
                }
            )
            .then(() => {
                this.requestPermission();
            })
    }

    private requestPermission(): void {
        this.speechRecognition.requestPermission().then((granted: boolean) => {
            // alert("Granted? " + granted);
            this.settings.isSpeechRecognitionAvailable = granted;
            console.log("Granted? " + granted);
        });
    }

    public startListening() {
        if (!this.isListening) {
            this.isListening = true;

            this.speechRecognition.startListening(
                {
                    // optional, uses the device locale by default
                    locale: "en-US",
                    // set to true to get results back continuously
                    returnPartialResults: true,
                    // this callback will be invoked repeatedly during recognition
                    onResult: (transcription: SpeechRecognitionTranscription) => {
                        let self: any = this;
                        // alert(`User said: ${transcription.text}`);
                        // alert(`User finished?: ${transcription.finished}`);
                        console.log(`User said: ${transcription.text}`);
                        console.log(`User finished?: ${transcription.finished}`);

                        onSpeechRecognition(transcription.text);
                        self.isListening = false;
                    },
                    onError: (error: string | number) => {
                        // because of the way iOS and Android differ, this is either:
                        // - iOS: A 'string', describing the issue. 
                        // - Android: A 'number', referencing an 'ERROR_*' constant from https://developer.android.com/reference/android/speech/SpeechRecognizer.
                        //            If that code is either 6 or 7 you may want to restart listening.
                    }
                }
            ).then(
                (started: boolean) => { console.log(`started listening`) },
                (errorMessage: string) => { console.log(`Error: ${errorMessage}`); }
            ).catch((error: string | number) => {
                // same as the 'onError' handler, but this may not return if the error occurs after listening has successfully started (because that resolves the promise,
                // hence the' onError' handler was created.
            });
        }
    }

    public stopListening() {
        this.speechRecognition.stopListening().then(
            () => { console.log(`stopped listening`) },
            (errorMessage: string) => { console.log(`Stop error: ${errorMessage}`); }
        );
    }
}