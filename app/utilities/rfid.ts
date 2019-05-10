/**
 * A singleton class encapsulating the nfc interface
 */

import { NfcTagData, Nfc } from "nativescript-nfc";
import { AppRootViewModel } from "~/app-root/app-root-view-model";
import { topmost } from "tns-core-modules/ui/frame/frame";
import { Settings } from "~/settings/settings";
import { MedicineBinding } from "~/data-models/medicine-binding";

import * as Test from "../data-models/test-data";
import * as Utility from "../utility-functions/utility-functions";
import { AudioPlayer } from "~/audio-player/audio-player";

let settings: Settings = Settings.getInstance();

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

    public get newTagScanned(): boolean {
        return this._newTagScanned;
    }

    public set newTagScanned(value: boolean) {
        this._newTagScanned = value;
    }

    public startTagListener() {
        console.log("startTagListener() ? this._tagListenerStarted: " + this._tagListenerStarted);
        if (!this._tagListenerStarted) {
            this._nfc.available().then((avail) => {
                if (!avail) {
                    alert("Pairing (NFC) is not available on this device")
                }
                else {
                    this._nfc.enabled().then((on) => {
                        if (!on) {
                            alert("Pairing (NFC) is not enabled on this device")
                        }
                        else {
                            let self = this;
                            this._tagListenerStarted = true;
                            console.log("this._nfc.setOnTagDiscoveredListener - this._tagListenerStarted: " + this._tagListenerStarted);
                            this._nfc.setOnTagDiscoveredListener((data: NfcTagData) => {
                                self.scanWizard(data);
                            }).then(() => {
                                // alert("OnTagDiscovered Listener set");
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

        let medicineList = Test.Dataset.getCurrentTestData();
        let medicineName: string = medicineList[this.findTagIdIndex(this.tagId, medicineList)].medicineName;

        if (settings.isAlwaysPlayAudio) {
            let audioPath = Utility.Language.getAudioPath(medicineName);
            AudioPlayer.useAudio(audioPath);
            AudioPlayer.togglePlay();
        }
        else if (settings.isAlwaysConfirmDose) {
            settings.isConfirmingDose = true;
            settings.currentMedicine = medicineName;

            const componentRoute = "home/home-page";
            const componentTitle = "Home";
            this.navigateTo(componentTitle, componentRoute);
        }
        else {
            const componentRoute = "wizard/wizard-page";
            const componentTitle = "Wizard";
            this.navigateTo(componentTitle, componentRoute);
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

    private findTagIdIndex(tagId: string, list: MedicineBinding[]): number {
        let i: number = 0;
        let index: number = -1;
        list.forEach(value => {
            if (value.tagId === tagId) {
                index = i;
            }
            else {
                i = i + 1;
            }
        })
        return index;
    }
}