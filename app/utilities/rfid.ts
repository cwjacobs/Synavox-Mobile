/**
 * A singleton class encapsulating the nfc interface
 */

import { NfcTagData, Nfc } from "nativescript-nfc";
import { AppRootViewModel } from "~/app-root/app-root-view-model";
import { topmost } from "tns-core-modules/ui/frame/frame";

import { I18N } from "~/utilities/i18n";
import { Settings } from "~/settings/settings";
import { AudioPlayer } from "~/audio-player/audio-player";
import { MedicineBinding } from "~/data-models/medicine-cabinet";

let i18n: I18N = I18N.getInstance();
let settings: Settings = Settings.getInstance();
let audioPlayer: AudioPlayer = AudioPlayer.getInstance();

// for browse branch
let tagId: string;
let appRootContext: AppRootViewModel = null;

export class RFID {
    private _nfc: Nfc = null;
    private _tagScanned: boolean;
    private _tagListenerStarted: boolean;
    private static _instance: RFID = new RFID();

    private constructor() {
        if (RFID._instance) {
            throw new Error("Error: Instantiation failed: Use RFID.instance instead of new.");
        }
        RFID._instance = this;
        this._tagScanned = false;
        this._tagListenerStarted = false;

        appRootContext = new AppRootViewModel();

        // NFC device interface component requires app to be up and running, so delay here...
        setTimeout(() => {
            this._nfc = new Nfc();
            console.log("Created NFC device interface");
        }, 500);
    }

    public static getInstance() {
        return this._instance;
    }

    public get isTagScanned(): boolean {
        return this._tagScanned;
    }

    public set isTagScanned(value: boolean) {
        this._tagScanned = value;
    }

    public startTagListener() {
        if (this._nfc == null) {
            console.log("this._nfc == null");
            setTimeout(() => {
                this._nfc = new Nfc();
                if (this._nfc == null) {
                    console.log("Could not create NFC device interface");
                }
                else {
                    console.log("Created NFC device interface");
                    this.startTagListener();
                }
            }, 500);
            return; // Bail and try again in 500
        }

        console.log("startTagListener() ? this._tagListenerStarted: " + this._tagListenerStarted);
        if (!this._tagListenerStarted) {
            this._nfc.available().then((avail) => {
                if (!avail) {
                    alert(i18n.nfcNotAvailable)
                }
                else {
                    this._nfc.enabled().then((on) => {
                        if (!on) {
                            alert(i18n.nfcNotEnabled)
                        }
                        else {
                            let self = this;
                            this._tagListenerStarted = true;
                            console.log("this._nfc.setOnTagDiscoveredListener - this._tagListenerStarted: " + this._tagListenerStarted);
                            this._nfc.setOnTagDiscoveredListener((data: NfcTagData) => {
                                self.scanWizard(data);
                            }).then(() => {
                            }, (err) => {
                                alert(err);
                            });
                        }
                    }, (err) => {
                        alert(err);
                    });
                }
            }, (err) => {
                alert(err);
            });
        }
    }

    public stopTagListener(): void {
        this._nfc.setOnTagDiscoveredListener(null).then(() => {
            this._tagListenerStarted = false;
            console.log("rfid - stopTagListener()");
        }, (err) => {
            console.log(err);
        });
    }

    private scanWizard(data: NfcTagData): void {
        let pageTitle: string;
        let pageRoute: string;

        this._tagScanned = true;
        settings.currentTagId = data.id.toString();

        let binding: MedicineBinding = settings.currentMedicineCabinet.getMedicineBindingByTagId(settings.currentTagId);
        if (!binding) {
            // New tag, go to wizard
            // settings.isNewBinding = true;

            pageTitle = "NewTag";
            pageRoute = "xition/new-tag/new-tag-page";
            this.navigateTo(pageTitle, pageRoute);
        }
        else {
            settings.currentMedicineName = binding.medicineName;
            if (settings.isAlwaysPlayAudio) {
                audioPlayer.play(binding.medicineName);
            }
            else {
                if (settings.isAlwaysConfirmDose) {
                    pageTitle = "Home";
                    pageRoute = "home/home-page";
                    settings.isConfirmingDose = true;
                }
                else {
                    pageTitle = "Wizard";
                    pageRoute = "wizard/wizard-page";
                }
                this.navigateTo(pageTitle, pageRoute);
            }
        }
    }

    private navigateTo(componentTitle: string, componentRoute: string): void {
        appRootContext.selectedPage = componentTitle;
        topmost().navigate({
            moduleName: componentRoute,
            transition: {
                name: "fade"
            }
        });
    }
}