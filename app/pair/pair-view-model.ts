import { Observable } from "tns-core-modules/data/observable";

import { SelectedPageService } from "../shared/selected-page-service";
import { Nfc, NfcTagData, NfcNdefData } from "nativescript-nfc";
import { Page } from "tns-core-modules/ui/page/page";

import { MedicineBinding } from "../data-models/medicine-binding";
import { TestData } from "../data-models/test-data";
import { AudioPlayer } from "~/audio-player/audio-player";
import { getCurrentLanguage, getCurrentBindings } from "../home/home-page";

export class PairViewModel extends Observable {
    private nfc: Nfc = null;
    private page: Page = null;
    private tagId: string = "";
    private medicineName: string = "";
    private audioPlayer: AudioPlayer = new AudioPlayer();
    private medicineBindings: MedicineBinding[] = null;

    public lastNdefDiscovered: string = "Press a button...";

    constructor(page: Page) {
        super();
        this.page = page;
        this.nfc = new Nfc();
        this.medicineBindings = getCurrentBindings();

        SelectedPageService.getInstance().updateSelectedPage("Pair");
    }

    public doStartTagListener() {
        this.nfc.available().then((avail) => {
            if (!avail) {
                this.page.addCss("#page-icon {color: rgb(250, 220, 220)}");
                alert("Pairing (NFC) is not available on this device")
            }
            else {
                this.nfc.enabled().then((on) => {
                    if (!on) {
                        this.page.addCss("#page-icon {color: rgb(250, 255, 167)}");
                        alert("Pairing (NFC) is not enabled on this device")
                    }
                    else {
                        this.page.addCss("#page-icon {color: rgb(220, 250, 220)}");

                        let self = this;
                        this.nfc.setOnTagDiscoveredListener((data: NfcTagData) => {
                            let fTagId = formatTagId(data.id);
                            let audioPath = findAudio(fTagId);
                            if (audioPath === "not-found") {
                                alert("New tag, would you like to bind it now?");
                            }
                            else {
                                playAudio(audioPath);
                            }

                            self.set("tagId", fTagId);
                            self.set("lastTagDiscovered", this.tagId);

                        }).then(() => {
                            //alert("OnTagDiscovered Listener set");
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

    public doStopTagListener() {
        this.nfc.setOnTagDiscoveredListener(null).then(() => {
            console.log("OnTagDiscovered nulled");
        }, (err) => {
            console.log(err);
        });
    }

    public doStartNdefListener() {
        this.nfc.setOnNdefDiscoveredListener((data: NfcNdefData) => {
            if (data.message) {
                let tagMessages = [];
                // data.message is an array of records, so:
                data.message.forEach(record => {
                    console.log("Read record: " + JSON.stringify(record));
                    tagMessages.push(record.payloadAsString);
                });
                this.set("lastNdefDiscovered", "Read: " + tagMessages.join(", "));
            }
        }, {
                stopAfterFirstRead: true,
                scanHint: "Scan a tag, baby!"
            })
            .then(() => this.set("lastNdefDiscovered", "Listening..."))
            .catch(err => alert(err));
    }

    public doStopNdefListener() {
        this.nfc.setOnNdefDiscoveredListener(null).then(() => {
            this.set("lastNdefDiscovered", "Stopped listening.");
        }, (err) => {
            alert(err);
        });
    }

    public doWriteText() {
        this.nfc.writeTag({
            textRecords: [
                {
                    id: [1],
                    text: "Hello!"
                }
            ]
        }).then(() => {
            this.set("lastNdefDiscovered", "Wrote text 'Hello!'");
        }, (err) => {
            console.log(err);
        });
    }

    public doWriteUri() {
        this.nfc.writeTag({
            uriRecords: [
                {
                    id: [2, 5],
                    uri: "https://www.telerik.com"
                }
            ]
        }).then(() => {
            this.set("lastNdefDiscovered", "Wrote uri 'https://www.telerik.com");
        }, (err) => {
            console.log(err);
        });
    }

    public doEraseTag() {
        this.nfc.eraseTag().then(() => {
            this.set("lastNdefDiscovered", "Tag erased");
        }, (err) => {
            console.log(err);
        });
    }
}

function formatTagId(data: number[]): string {
    let formatedId: string = "";
    data.forEach((value) => { formatedId += value })
    return formatedId;
}

function findAudio(fTagId: string): string {
    let audioPath: string = "not-found";
    let testData: TestData = new TestData();

    let medicineBindings: MedicineBinding[] = getCurrentBindings();
    medicineBindings.forEach(value => {
        if (value.tagId === fTagId) {
            audioPath = value.audioPath;
        }
    })
    return audioPath;
}

function playAudio(audioPath: string): void {
    AudioPlayer.useAudio(audioPath);
    AudioPlayer.togglePlay();
}