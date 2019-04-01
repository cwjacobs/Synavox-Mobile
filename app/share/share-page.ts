import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { EventData } from "tns-core-modules/data/observable";
import { NavigatedData, Page } from "tns-core-modules/ui/page";

//import { Contact } from "nativescript-contacts";

import { MedicineBinding } from "../data-models/medicine-binding";

import { ShareViewModel } from "./share-view-model";
import * as Permissions from "nativescript-permissions";
import * as Test from "../data-models/test-data";

import { Contact, GetContactResult } from "nativescript-contacts";
import * as Contacts from "nativescript-contacts";

let viewModel: ShareViewModel = null;

export function onNavigatingTo(args: NavigatedData) {
    const page = <Page>args.object;
    viewModel = new ShareViewModel();
    page.bindingContext = viewModel;
}

export function onDrawerButtonTap(args: EventData) {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.showDrawer();
}

export function onLoaded(args: EventData) {
}

export function onGetContacts(args: EventData) {
    let contactFields: string[] = ["id", "name", "phoneNumbers"];

    Permissions.requestPermissions([android.Manifest.permission.GET_ACCOUNTS,
    android.Manifest.permission.READ_CONTACTS,
    android.Manifest.permission.WRITE_CONTACTS,],
        "Permission to access your contacts is requested")
        .then(() => {
            //alert("Permissions request complete. Permission granted: " + Permissions.hasPermission(android.Manifest.permission.GET_ACCOUNTS));
            Contacts.getContact().then(function (args: GetContactResult) {
                storeContact(args);

                // console.log(JSON.stringify(args));
                // let response: string = args.response;
                // alert("exception: " + exception.toString());

                // let data: Contact = args.data;
                // alert("data: " + data);

                // let contactString: string = JSON.stringify(data);
                // alert("contactString: " + contactString);
                // console.log(JSON.stringify(args));
                /// Returns args:
                /// args.data: Generic cross platform JSON object, null if no contacts were found.
                /// args.reponse: "fetch"
            }, function (err) {
                alert("Error: " + err);
                // console.log("Error: " + err);
            });
        });
}

export function onSearchTapped(args: EventData) {
    alert("onSearchTapped");
}

function storeContact(args: GetContactResult): void {
    let contact: Contact = args.data;
    // TBD: Send contact to backend for processing of the share request...

    logContact(args);
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

