import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData } from "tns-core-modules/data/observable";
import { NavigatedData, Page } from "tns-core-modules/ui/page";

import { MedicineBinding } from "../data-models/medicine-binding";

import { ShareViewModel } from "./share-view-model";
import * as Permissions from "nativescript-permissions";
import * as Test from "../data-models/test-data";

import { Contact, GetContactResult } from "nativescript-contacts-lite";
import * as Contacts from "nativescript-contacts-lite";
import * as Utility from "../utility-functions/utility-functions";

import { TextField } from "tns-core-modules/ui/text-field/text-field";
import { ListPicker } from "tns-core-modules/ui/list-picker";
import { Button } from "tns-core-modules/ui/button";
import { AudioPlayer } from "~/audio-player/audio-player";

let page: Page = null;
let displayNames: string[] = [];
let contactList: Contact[] = [];

let isDisplayList: boolean = false;
let isDisplayContact: boolean = false;

let isNameDefined: boolean = false;
let isEmailDefined: boolean = false;
let isPhoneDefined: boolean = false;
let isShareComplete: boolean = false;

let contactFilter: string = null;
let viewModel: ShareViewModel = null;

// Page text
let i18NPageTitle: string = null;
let i18NContentTitle: string = null;
let i18NContactFilterHint: string = null;
let i18NContactFilterLabel: string = null;
let i18NContactNameLabel: string = null;
let i18NContactEmailLabel: string = null;
let i18NContactPhoneLabel: string = null;
let i18NShareCompleteNotification: string = null;

// Page control buttons
let i18NShareButtonText: string = null;
let i18NCancelButtonText: string = null;
// let i18NDeleteButtonText: string = null;

/**
 * initial state - Filter is blank, list is displayed, contact is not displayed
 * Contact selected from list - Filter is blank, list is not displayed, contact is displayed
 * filter entry selected - Filter is blank, list is not displayed, contact is not displayed, keyboard is displayed
 * 
 * 
 * @param args 
 * 
 * 
 * 
 * 
 */


export function onNavigatingTo(args: NavigatedData) {
    page = <Page>args.object;
    viewModel = new ShareViewModel();
    page.bindingContext = viewModel;
}

export function onNavigatingFrom(args: NavigatedData) {
}

export function onDrawerButtonTap(args: EventData) {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
}

function getContacts() {
    let desiredField = ['display_name'];
    let desiredFields = ['display_name', 'phone', 'email', 'organization'];

    Permissions.requestPermissions([android.Manifest.permission.GET_ACCOUNTS,
    android.Manifest.permission.READ_CONTACTS,],
        "Permission to access your contacts is requested")
        .then(() => {
            Contacts.getContacts(desiredFields).then((result) => {
                contactList = result;
                contactList.forEach((contact) => {
                    if (displayNames.indexOf(contact.display_name) === -1) {
                        displayNames.push(contact.display_name);
                    }
                });
                displayNames.sort();

                let index: number = (displayNames.length / 2);
                viewModel.set("index", index);
                viewModel.set("displayNames", displayNames);

            }, (e) => { console.dir(e); });
        });
}

export function onLoaded(args: EventData) {
    getContacts();

    // Set text to active language
    setActiveLanguageText();

    isDisplayList = true;
    isDisplayContact = false;
    viewModel.set("isDisplayList", isDisplayList);
    viewModel.set("isDisplayContact", isDisplayContact);

    // registering for the TextField text change listener
    const contactsFilterView: TextField = <TextField>page.getViewById("contactsFilterView");
    contactsFilterView.updateTextTrigger = "textChanged";
    contactsFilterView.on("textChange", () => {
        updateContactFilter();
    });
}

// This is a terrible function. TBD: figure out how to do this right
function getContactIndexFromDisplayName(displayName: string): number {
    let i: number = 0;
    let j: number = -1;
    contactList.forEach((contact) => {
        if (contact.display_name === displayName) {
            j = i;
        }
        else {
            i += 1;
        }
    });
    return j;
}

function displayContact(displayName: string): Contact {
    let index: number = getContactIndexFromDisplayName(displayName);

    if (index != -1) {
        let selectedContact: Contact = contactList[index];

        isDisplayList = false;
        isDisplayContact = true;
        viewModel.set("isDisplayList", isDisplayList);
        viewModel.set("isDisplayContact", isDisplayContact);

        if (selectedContact.display_name) {
            isNameDefined = true;
            viewModel.set("selectedContactName", selectedContact.display_name);
        }
        else {
            isNameDefined = false;
        }
        viewModel.set("isNameDefined", isNameDefined);

        if (selectedContact.email) {
            isEmailDefined = true;
            viewModel.set("selectedContactEmail", selectedContact.email[0].address);
        }
        else {
            isEmailDefined = false;
        }
        viewModel.set("isEmailDefined", isEmailDefined);

        if (selectedContact.phone) {
            isPhoneDefined = true;
            viewModel.set("selectedContactPhone", selectedContact.phone[0].number);
        }
        else {
            isPhoneDefined = false;
        }
        viewModel.set("isPhoneDefined", isPhoneDefined);
    }
    else {
        alert("displayName not found in contactList!");
    }
}

export function onContactTap(args: EventData) {
    let listPicker: ListPicker = page.getViewById("listPicker");
    let index: number = listPicker.selectedIndex;

    let items: string[] = listPicker.items;
    let displayName: string = items[index];

    displayContact(displayName);

    isShareComplete = false;
    viewModel.set("isShareComplete", isShareComplete);
}

const alertColor: string = "#7700ff";
const primary: string = "#3A53FF";
const secondary: string = "#398881";
const warning: string = "#B9B90C";
let shareText: string = null;

export function onShareTap(args: EventData) {
    let shareButton: Button = page.getViewById("share-button");
    shareText = shareButton.text;

    let sharingText: string = get18NSharingText(shareText);

    i18NShareButtonText = sharingText;
    viewModel.set("i18NShareButtonText", i18NShareButtonText);

    shareButton.backgroundColor = "#7700ff";

    isShareComplete = false;
    viewModel.set("isShareComplete", isShareComplete);

    shareLibrary(0);
    console.log("back from shareLibrary");
};

function get18NSharingText(baseText: string): string {
    let i18NText: string;
    if (Utility.Language.getActiveLanguage() === "english") {
        i18NText = baseText.replace("Share", "Sharing...");
    }
    else {
        i18NText = baseText.replace("Compartir", "Compartir...");
    }
    return i18NText;
}

let shareTimeout: any;
const interations: number = 6;
function shareLibrary(counter) {
    if (counter < interations) {
        shareTimeout = setTimeout(function () {
            counter++;

            let shareButton: Button = page.getViewById("share-button");
            if (isOdd(counter)) {
                shareButton.backgroundColor = alertColor;
            }
            else {
                shareButton.backgroundColor = warning;
            }
            shareLibrary(counter);
        }, 1000);
    }
    else {
        if (counter === interations) {
            let name: string = viewModel.get("selectedContactName");
            if (Utility.Language.getActiveLanguage() === "english") {
                i18NShareButtonText = "Share";
                i18NShareCompleteNotification = "Sharing with " + name + " completed successfully"
            }
            else {
                i18NShareButtonText = "Compartir";
                i18NShareCompleteNotification = "Compartir con " + name + " Completado con éxito"
            }
            isShareComplete = true;
            viewModel.set("isShareComplete", isShareComplete);

            viewModel.set("i18NShareButtonText", i18NShareButtonText);
            viewModel.set("i18NShareCompleteNotification", i18NShareCompleteNotification);

            let shareButton: Button = page.getViewById("share-button");
            shareButton.backgroundColor = primary;

            let audioPath: string = "~/audio/sounds/success.wav";
            AudioPlayer.useAudio(audioPath);
            AudioPlayer.play();
        }
    }
}

function isOdd(num) { return num % 2; }

export function onCancelTap(args: EventData) {
    alert("onCancelTap");
    // clearTimeout(shareTimeout);
        // This works, but need to clean up ui when cancel is invoked...
}

function containsNameFilter(element: string, index, array): boolean {
    return (element.includes(contactFilter));
}

function updateContactFilter() {
    isDisplayList = true;
    isDisplayContact = false;
    viewModel.set("isDisplayList", isDisplayList);
    viewModel.set("isDisplayContact", isDisplayContact);

    setTimeout(() => {
        contactFilter = viewModel.get("contactFilter");
        let filteredNames: string[] = displayNames.filter(containsNameFilter);
        viewModel.set("displayNames", filteredNames);

        let index: number = filteredNames.indexOf(contactFilter);
        viewModel.set("index", index);
    }, 300);
    // Delay allows the contactFilter field to be updated on the UI before updating the filter
}

export function onGetContactLite_main(args: EventData) {
    let contact_list: Contact[];
    let displayNames = ['display_name'];
    let desiredFields = ['display_name', 'phone', 'email', 'organization'];

    Permissions.requestPermissions([android.Manifest.permission.GET_ACCOUNTS,
    android.Manifest.permission.READ_CONTACTS,],
        "Permission to access your contacts is requested")
        .then(() => {
            Contacts.getContacts(displayNames).then((result) => {
                // console.log(`Found ${result.length} contacts.`);
                // console.dir(result);

                contact_list = result;

                //let names: string[] = [];
                contact_list.forEach((contact) => { displayNames.push(contact.display_name); });
                displayNames.sort();
                // viewModel.set("contact_list", names);


                let index: number = (contact_list.length / 2);
                viewModel.set("index", index);
                viewModel.set("contact_list", displayNames);

                console.log("contact_id: " + contact_list[0].contact_id);
                console.log("display_name: " + contact_list[0].display_name);
                console.log("email: " + contact_list[0].email[0].address);
                console.log("phone: " + contact_list[0].phone[0].number);
                console.log("phone: " + contact_list[0].organization[0].company);

                //console.dir(contact_list);

            }, (e) => { console.dir(e); });
        });
}

export function onGetContactLite_worker(args: EventData) {
    // let contact_list: ContactList;
    // let desiredFields = ['display_name', 'phone', 'email', 'organization'];

    // Permissions.requestPermissions([android.Manifest.permission.GET_ACCOUNTS,
    // android.Manifest.permission.READ_CONTACTS,],
    //     "Permission to access your contacts is requested")
    //     .then(() => {
    //         Contacts.getContactsWorker(desiredFields).then((result) => {
    //             console.log(`Found ${result.length} contacts.`);
    //             console.dir(result);
    //             contact_list = result;
    //             console.dir(result);
    //         }, (e) => { console.dir(e); });
    //     });
}

function storeContact(contact: Contact): void {
    // TBD: Send contact to backend for processing of the share request...
}

function logContact(args: GetContactResult) {
    console.log("args.response: " + args.response);
    console.log("args.response: " + JSON.stringify(args.data));

    let contact: Contact = args.data;

    let name: Contacts.ContactName = contact.name;
    console.log("name.given: " + name.given);
    console.log("name.middle: " + name.middle);
    console.log("name.family: " + name.family);
    console.log("name.prefix: " + name.prefix);
    console.log("name.suffix: " + name.suffix);
    console.log("name.displayname: " + name.displayname);
    console.log("name.phonetic.given: " + name.phonetic.given);
    console.log("name.phonetic.middle: " + name.phonetic.middle);
    console.log("name.phonetic.family: " + name.phonetic.family);
    console.log("");

    let email: Contacts.ContactField = contact.emailAddresses[0];
    console.log("email.id: " + email.id);
    console.log("email.label: " + email.label);
    console.log("email.value: " + email.value);
}

function setActiveLanguageText(): void {
    let activeLanguage: string = Utility.Language.getActiveLanguage();

    if (activeLanguage === "english") {
        i18NPageTitle = "Share";
        i18NContentTitle = "Share My Home Pharmacist";
        i18NContactFilterLabel = "Share with: ";
        i18NContactFilterHint = "Enter name from contacts";

        i18NContactNameLabel = "Name: ";
        i18NContactEmailLabel = "Email: ";
        i18NContactPhoneLabel = "Phone: ";

        i18NShareButtonText = "Share";
        i18NCancelButtonText = "Cancel";
    }
    else {
        i18NPageTitle = "Compartir";
        i18NContentTitle = "Compartir mi Farmacéutico de Casa";
        i18NContactFilterLabel = "Comparta con: ";
        i18NContactFilterHint = "El nombre de los contactos";

        i18NContactNameLabel = "Nombre";
        i18NContactEmailLabel = "Correo electrónico";
        i18NContactPhoneLabel = "Teléfono";

        i18NShareButtonText = "Compartir";
        i18NCancelButtonText = "Cancelar";
    }

    viewModel.set("i18NPageTitle", i18NPageTitle);
    viewModel.set("i18NContentTitle", i18NContentTitle);
    viewModel.set("i18NContactFilterLabel", i18NContactFilterLabel);
    viewModel.set("i18NContactFilterHint", i18NContactFilterHint);

    viewModel.set("i18NContactNameLabel", i18NContactNameLabel);
    viewModel.set("i18NContactEmailLabel", i18NContactEmailLabel);
    viewModel.set("i18NContactPhoneLabel", i18NContactPhoneLabel);

    viewModel.set("i18NShareButtonText", i18NShareButtonText);
    viewModel.set("i18NCancelButtonText", i18NCancelButtonText);
}
