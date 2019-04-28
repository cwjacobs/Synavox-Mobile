/**
 * A singleton class encapsulating the nfc interface
 */

import { NfcTagData, Nfc } from "nativescript-nfc";

export class RFID {

    private _nfc: Nfc = null;
    private _tagListenerStarted: boolean;
    private static _instance: RFID = new RFID();

    private constructor() {
        console.log("rfid - private constructor() invoked; RFID._instance: " + RFID._instance);
        if (RFID._instance) {
            throw new Error("Error: Instantiation failed: Use RFID.instance instead of new.");
        }
        RFID._instance = this;
        this._tagListenerStarted = false;
        console.log("rfid - constructor complete; RFID._instance: " + RFID._instance);
    }

    public static get instance() {
        return this._instance;
    }

    public get nfcInterface() {
        return this._nfc;
    }

    public set nfcInterface(value: Nfc) {
        this._nfc = value;
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

    public scanWizard(data: NfcTagData): void {
        alert("scanWizard(data: NfcTagData): " + data.id + data.techList);
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