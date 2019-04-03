import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData } from "tns-core-modules/data/observable";
import { NavigatedData, Page } from "tns-core-modules/ui/page";

//import { Contact } from "nativescript-contacts";

import { MedicineBinding } from "../data-models/medicine-binding";

import { ShareViewModel } from "./share-view-model";
import * as Permissions from "nativescript-permissions";
import * as Test from "../data-models/test-data";

import { Contact, GetContactResult } from "nativescript-contacts-lite";
import * as Contacts from "nativescript-contacts-lite";
import { ContactList } from "~/data-models/contact";

let viewModel: ShareViewModel = null;

export function onNavigatingTo(args: NavigatedData) {
    const page = <Page>args.object;
    viewModel = new ShareViewModel();
    page.bindingContext = viewModel;
}

export function onNavigatingFrom(args: NavigatedData) {
}

export function onDrawerButtonTap(args: EventData) {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
}

export function onLoaded(args: EventData) {
}

export function onGetContact_sample(args: EventData) {
    //     var app = require("application");
    //     var contacts = require("nativescript-contacts");

    //     const contact = new Contact();
    //     Permissions.requestPermissions([android.Manifest.permission.GET_ACCOUNTS, android.Manifest.permission.READ_CONTACTS, android.Manifest.permission.WRITE_CONTACTS], "I need these permissions because I'm cool")
    //         .then(() => {
    //             contact.save();
    //         });
    //     contacts.getContact().then(function (args) {
    //         /// Returns args:
    //         /// args.data: Generic cross platform JSON object
    //         /// args.reponse: "selected" or "cancelled" depending on wheter the user selected a contact. 

    //         if (args.response === "selected") {
    //             var contact = args.data; //See data structure below

    //             // lets say you wanted to grab first name and last name
    //             console.log(contact.name.given + " " + contact.name.family);

    //             //lets say you want to get the phone numbers
    //             contact.phoneNumbers.forEach(function (phone) {
    //                 console.log(phone.value);
    //             });

    //             //lets say you want to get the addresses
    //             contact.postalAddresses.forEach(function (address) {
    //                 console.log(address.location.street);
    //             });
    //         }
    //     });
}

export function onGetContact(args: EventData) {
    Permissions.requestPermissions([android.Manifest.permission.GET_ACCOUNTS,
    android.Manifest.permission.READ_CONTACTS,],
        "Permission to access your contacts is requested")
        .then(() => {
            Contacts.getContact()
                .then((args: GetContactResult) => {
                    /// Returns args:
                    /// args.reponse: "fetch"
                    /// args.data: Generic cross platform JSON object, null if no contacts were found.
                    logContact(args);
                    storeContact(args.data);

                }, function (err) {
                    console.log("Error: " + err);
                })
        });
}

export function onGetContactLite_main(args: EventData) {
    let contact_list: Contact[];
    let desiredFields = ['display_name', 'phone', 'email', 'organization'];

    Permissions.requestPermissions([android.Manifest.permission.GET_ACCOUNTS,
    android.Manifest.permission.READ_CONTACTS,],
        "Permission to access your contacts is requested")
        .then(() => {
            Contacts.getContacts(desiredFields).then((result) => {
                console.log(`Found ${result.length} contacts.`);
                // console.dir(result);

                contact_list = result;
                viewModel.set("contact_list", contact_list);
                
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
    let contact_list: ContactList;
    let desiredFields = ['display_name', 'phone', 'email', 'organization'];

    Permissions.requestPermissions([android.Manifest.permission.GET_ACCOUNTS,
    android.Manifest.permission.READ_CONTACTS,],
        "Permission to access your contacts is requested")
        .then(() => {
            Contacts.getContactsWorker(desiredFields).then((result) => {
                console.log(`Found ${result.length} contacts.`);
                console.dir(result);
                contact_list = result;
                console.dir(result);
            }, (e) => { console.dir(e); });
        });
}

export function onSearchTapped(args: EventData) {
    alert("onSearchTapped");
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

