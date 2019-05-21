/**
 * A singleton class encapsulating the nfc interface
 */

import { NfcTagData, Nfc } from "nativescript-nfc";
import { AppRootViewModel } from "~/app-root/app-root-view-model";
import { topmost } from "tns-core-modules/ui/frame/frame";

import { I18N } from "~/utilities/i18n";
import { Settings } from "~/settings/settings";
import { AudioPlayer } from "~/audio-player/audio-player";

let i18n: I18N = I18N.getInstance();
let settings: Settings = Settings.getInstance();
let audioPlayer: AudioPlayer = AudioPlayer.getInstance();

// for browse branch
let tagId: string;
let appRootContext: AppRootViewModel = null;

export class RFID {
    private _tagId: string;
    private _nfc: Nfc = null;
    private _tagScanned: boolean;
    private _newTagScanned: boolean;
    private _tagListenerStarted: boolean;
    private static _instance: RFID = new RFID();

    private constructor() {
        console.log("rfid - private constructor() invoked; RFID._instance: " + RFID._instance);
        if (RFID._instance) {
            throw new Error("Error: Instantiation failed: Use RFID.instance instead of new.");
        }
        RFID._instance = this;
        this._tagScanned = false;
        this._tagListenerStarted = false;

        appRootContext = new AppRootViewModel();

        console.log("rfid - constructor complete; RFID._instance: " + RFID._instance);

        // NFC device interface component requires app to be up and running, so delay here...
        setTimeout(() => {
            this._nfc = new Nfc();
            console.log("Created NFC device interface");
        }, 500);
    }

    public static getInstance() {
        return this._instance;
    }

    public get tagId(): string {
        return this._tagId;
    }

    public set tagId(value: string) {
        this._tagId = value;
    }

    public get tagScanned(): boolean {
        return this._tagScanned;
    }

    public set tagScanned(value: boolean) {
        this._tagScanned = value;
    }

    public get manageNewTag(): boolean {
        return this._newTagScanned;
    }

    public set manageNewTag(value: boolean) {
        this._newTagScanned = value;
    }

    public startTagListener() {
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
        this._tagScanned = true;
        this.tagId = data.id.toString();

        if (settings.isAlwaysPlayAudio) {
            let medicineName: string = settings.medicineList.getMedicineBindingByTagId(this.tagId).medicineName;
            audioPlayer.play(medicineName);
        }
        else {
            let pageTitle: string;
            let pageRoute: string;
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