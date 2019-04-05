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
import { TextField } from "tns-core-modules/ui/text-field/text-field";

let page: Page = null;
let displayNames: string[] = [];
let contactList: Contact[] = [];
let isContactSelected: boolean = false;

let contactFilter: string = null;
let viewModel: ShareViewModel = null;

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
    isContactSelected = false;
    viewModel.set("isContactSelected", isContactSelected);
    getContacts();

    // registering for the TextField text change listener
    const contactsFilterView: TextField = <TextField>page.getViewById("contactsFilterView");
    contactsFilterView.updateTextTrigger = "textChanged";
    contactsFilterView.on("textChange", () => {
        updateContactFilter();
    });
}

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

        isContactSelected = true;
        viewModel.set("isContactSelected", isContactSelected);

        if (selectedContact.display_name.length > 0) {
            viewModel.set("selectedContactName", selectedContact.display_name);
        }

        if (selectedContact.email) {
            viewModel.set("selectedContactEmail", selectedContact.email[0].address);
        }

        if (selectedContact.phonel) {
            viewModel.set("selectedContactPhone", selectedContact.phone[0].number);
        }
    }
    else {
        alert("displayName not found in contactList!");
    }
}

export function onContactTap(args: EventData) {
    let index: number = viewModel.get("index");
    let displayName: string = displayNames[index];
    displayContact(displayName);
}

function containsNameFilter(element: string, index, array): boolean {
    return (element.includes(contactFilter));
}

function updateContactFilter() {
    if (isContactSelected) {
        isContactSelected = false;
        viewModel.set("isContactSelected", isContactSelected);
    }

    setTimeout(() => {
        contactFilter = viewModel.get("contactFilter");
        let filteredNames: string[] = displayNames.filter(containsNameFilter);
        viewModel.set("contact_list", filteredNames);

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

