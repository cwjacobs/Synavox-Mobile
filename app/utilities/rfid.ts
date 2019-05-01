/**
 * A singleton class encapsulating the nfc interface
 */

import { NfcTagData, Nfc } from "nativescript-nfc";
import { AppRootViewModel } from "~/app-root/app-root-view-model";
import { topmost } from "tns-core-modules/ui/frame/frame";

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
    }

    public static get instance() {
        return this._instance;
    }

    private get nfcInterface() {
        return this._nfc;
    }

    private set nfcInterface(value: Nfc) {
        this._nfc = value;
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
            this.nfcInterface = new Nfc();
            console.log("this.nfcInterface: " + this.nfcInterface.toString());

            this.nfcInterface.available().then((avail) => {
                if (!avail) {
                    alert("Pairing (NFC) is not available on this device")
                }
                else {
                    this.nfcInterface.enabled().then((on) => {
                        if (!on) {
                            alert("Pairing (NFC) is not enabled on this device")
                        }
                        else {
                            // alert("Pairing (NFC) is enabled on this device, you are good to go!")

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

    private scanWizard(data: NfcTagData): void {
        // alert("scanWizard(data: NfcTagData): " + data.id + data.techList);
        this._tagScanned = true;
        this.tagId = data.id.toString();
        const componentRoute = "wizard/wizard-page";
        const componentTitle = "Wizard";

        appRootContext.selectedPage = componentTitle;

        topmost().navigate({
            moduleName: componentRoute,
            transition: {
                name: "fade"
            }
        });
    }

    public stopTagListener(): void {
        this._nfc.setOnTagDiscoveredListener(null).then(() => {
            this._tagListenerStarted = false;
            console.log("rfid - stopTagListener()");
        }, (err) => {
            console.log(err);
        });
    }

    public setOnTagDiscoveredListener(callback: any) {
        alert("rfid - public setOnTagDiscoveredListener()");
        // this.nfc.setOnTagDiscoveredListener((args: NfcTagData) => callback(args));
    }
}