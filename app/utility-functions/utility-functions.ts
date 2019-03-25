
import { Nfc, NfcTagData, NfcNdefData } from "nativescript-nfc";
import { AudioPlayer } from "~/audio-player/audio-player";
import { pairPageSetTagId } from "~/pair/pair-page";

import * as Test from "../data-models/test-data";
import { MedicineBinding } from "~/data-models/medicine-binding";

export namespace Rfid {
    let nfc: Nfc = null;
    let tagId: string = "";
    let tagListenerStarted: boolean = false;
    let lastNdefDiscovered: string = "Press a button...";
    let medicineList: MedicineBinding[];

    export function doStartTagListener(): boolean {
        nfc = new Nfc();

        tagListenerStarted = false;
        nfc.available().then((avail) => {
            if (!avail) {
                alert("Pairing (NFC) is not available on this device")
            }
            else {
                nfc.enabled().then((on) => {
                    if (!on) {
                        alert("Pairing (NFC) is not enabled on this device")
                    }
                    else {
                        let self = this;
                        tagListenerStarted = true;
                        nfc.setOnTagDiscoveredListener((data: NfcTagData) => {
                            tagId = formatTagId(data.id);

                            let audioPlayed: boolean = playAudio(tagId);
                            //if (!audioPlayed) {
                                pairPageSetTagId(tagId); // call pair-page function to set view model element if currently on the pair page (look for better way to determine that...)
                            //}

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
        return tagListenerStarted;
    }

    export function doStopTagListener() {
        this.nfc.setOnTagDiscoveredListener(null).then(() => {
            console.log("OnTagDiscovered nulled");
        }, (err) => {
            console.log(err);
        });
    }

    export function doStartNdefListener() {
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

    export function doStopNdefListener() {
        this.nfc.setOnNdefDiscoveredListener(null).then(() => {
            this.set("lastNdefDiscovered", "Stopped listening.");
        }, (err) => {
            alert(err);
        });
    }

    export function doWriteText() {
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

    export function doWriteUri() {
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

    export function doEraseTag() {
        this.nfc.eraseTag().then(() => {
            this.set("lastNdefDiscovered", "Tag erased");
        }, (err) => {
            console.log(err);
        });
    }

    function formatTagId(data: number[]): string {
        let formatedId: string = "";
        data.forEach((value) => { formatedId += value })
        return formatedId;
    }

    function playAudio(tagId: string): boolean {
        let isBindingExists: boolean;

        medicineList = Test.Dataset.getCurrentTestData();
        let index: number = findTagIdIndex(tagId);
        if (index != -1) {
            isBindingExists = true;
            
            let audioPath: string = Language.getAudioPath(medicineList[index].medicineName);
            AudioPlayer.useAudio(audioPath);
            AudioPlayer.togglePlay();
        }
        else {
            isBindingExists = false;
        }
        return isBindingExists;
    }

    function findTagIdIndex(tagId: string): number {
        let i: number = 0;
        let index: number = -1;
        medicineList.forEach(value => {
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

export namespace Language {
    interface LanguageMap {
        [key: string]: string;
    }

    const defaultLanguage: string = "english";
    const lanugageDirectoryRoot: string = "~/audio/";

    let activeLanguage: string = null;
    let isEnglishEnabled: boolean = true;
    let isSpanishEnabled: boolean = false;

    export function getDefaultLanguage(): string {
        return defaultLanguage.toLowerCase();
    }

    export function getActiveLanguage(): string {
        if (activeLanguage == null) {
            activeLanguage = getDefaultLanguage();
        }
        return activeLanguage;
    }

    export function setActiveLanguage(language: string): void {
        activeLanguage = language.toLowerCase();
    }

    export function getIsEnglishEnabled(): boolean {
        return isEnglishEnabled;
    }

    export function toggleEnglishEnabled(): boolean {
        isEnglishEnabled = !isEnglishEnabled;

        if (!isEnglishEnabled) { // Must have at least one enabled & active language
            setActiveLanguage("spanish");
        }
        return isEnglishEnabled;
    }

    export function getIsSpanishEnabled(): boolean {
        return isSpanishEnabled;
    }

    export function toggleSpanishEnabled(): boolean {
        isSpanishEnabled = !isSpanishEnabled;

        if (!isSpanishEnabled) { // Must have at least one enabled & active language
            setActiveLanguage("english");
        }
        return isSpanishEnabled;
    }

    export function getIsDualLanguageEnabled(): boolean {
        return isEnglishEnabled && isSpanishEnabled;
    }

    export function getAudioPath(medicineName: string): string {
        // let languageMap: LanguageMap[] = [
        //     { "english": "en" },
        //     { "spanish": "sp" },
        // ];

        let languageDirectory: string;
        let language: string = getActiveLanguage();
        // let languageDirectory: string = languageMap[language];
        if (language === "english") {
            languageDirectory = "en/";
        }
        else {
            languageDirectory = "sp/";
        }
        let languagePath = lanugageDirectoryRoot + languageDirectory + medicineName.toLowerCase() + ".mp3";
        return languagePath;
    }
}

export namespace Helpers {
    export function formatTagId(data: number[] ): string {
        return data.toString();

        // let formatedId: string = "";
        // data.forEach((value) => { formatedId += value })
        // return formatedId;
    }
}
