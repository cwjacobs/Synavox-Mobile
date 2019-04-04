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

let names: string[] = [];
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

function getContacts() {
    let contact_list: Contact[];
    let displayNames = ['display_name'];
    let desiredFields = ['display_name', 'phone', 'email', 'organization'];

    Permissions.requestPermissions([android.Manifest.permission.GET_ACCOUNTS,
    android.Manifest.permission.READ_CONTACTS,],
        "Permission to access your contacts is requested")
        .then(() => {
            Contacts.getContacts(displayNames).then((result) => {
                contact_list = result;
                contact_list.forEach((contact) => { names.push(contact.display_name); });
                names.sort();

                let index: number = (contact_list.length / 2);
                viewModel.set("index", index);
                viewModel.set("contact_list", names);

            }, (e) => { console.dir(e); });
        });
}

export function onLoaded(args: EventData) {
    getContacts();
}

function containsCurrentNameFragment(element: string, index, array) {
    let currentName: string = viewModel.get("currentName");
    return (element.includes(currentName));
}

export function onFindTap(args: EventData) {
    // let currentName: string = viewModel.get("currentName");
    let filteredNames: string[] = names.filter(containsCurrentNameFragment);
    
    let index: number = (filteredNames.length / 2);
    viewModel.set("index", index);
    viewModel.set("contact_list", filteredNames);
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
                contact_list.forEach((contact) => { names.push(contact.display_name); });
                names.sort();
                // viewModel.set("contact_list", names);


                let index: number = (contact_list.length / 2);
                viewModel.set("index", index);
                viewModel.set("contact_list", names);

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

export function onFocus(args: EventData) {
    alert("onFocus");
}

export function onBlur(args: EventData) {
    alert("onBlur");
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

