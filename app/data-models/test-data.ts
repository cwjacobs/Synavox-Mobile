import { MedicineBinding } from "./medicine-binding";

import * as Utility from "../utility-functions/utility-functions";

export namespace Dataset {

    interface TestdataMap {
        [key: string]: MedicineBinding[];
    }

    let testData: MedicineBinding[] = null;

    let enTestData: MedicineBinding[] = [
        { tagId: "-99,55,102,114", medicineName: "Oxycodone", audioPath: "~/audio/en/opioid.mp3" },
        { tagId: "-99,-81,70,-106", medicineName: "Lisinopril", audioPath: "~/audio/en/lisinopril.mp3" },
        { tagId: "77,-4,75,-106", medicineName: "Rosuvastatin", audioPath: "~/audio/en/rosuvastatin.mp3" },
        { tagId: "-3,18,81,-106", medicineName: "Levothyroxine", audioPath: "~/audio/en/levothyroxine.mp3" },
        // { tagId: "-67,45,90,-106", medicineName: "Atorvastatin", audioPath: "~/audio/en/atorvastatin.mp3" },
        { tagId: "-67,45,90,-106", medicineName: "Metformin", audioPath: "~/audio/en/metformin.mp3" },
    ];

    let spTestData: MedicineBinding[] = [
        { tagId: "-99,55,102,114", medicineName: "Oxycodone", audioPath: "~/audio/sp/opioid.mp3" },
        { tagId: "-99,-81,70,-106", medicineName: "Lisinopril", audioPath: "~/audio/sp/lisinopril.mp3" },
        { tagId: "77,-4,75,-106", medicineName: "Rosuvastatin", audioPath: "~/audio/sp/rosuvastatin.mp3" },
        { tagId: "-3,18,81,-106", medicineName: "Levothyroxine", audioPath: "~/audio/sp/levothyroxine.mp3" },
        // { tagId: "-67,45,90,-106", medicineName: "Atorvastatin", audioPath: "~/audio/sp/atorvastatin.mp3"  },
        { tagId: "-67,45,90,-106", medicineName: "Metformin", audioPath: "~/audio/sp/metformin.mp3" },
    ];

    let webViewSrcArray = [
        {
            medicineName: "Oxycodone",
            srcLinks: [
                {
                    webHost: "drugs.com",
                    webViewSrc: "https://www.drugs.com/search.php?searchterm=oxycodone&a=1",
                },
                {
                    webHost: "webmd",
                    webViewSrc: "https://www.webmd.com/drugs/2/drug-1025-1480/oxycodone-oral/oxycodone-tablet-oral-use-only/details",
                },
                {
                    webHost: "hhs.gov",
                    webViewSrc: "https://www.hhs.gov/blog/2018/05/09/how-im-managing-my-chronic-pain-without-opioids.html",
                },
                {
                    webHost: "healthboards",
                    webViewSrc: "https://index.healthboards.com/addiction/oxycodone-withdrawal-day-5/1/",
                },
            ]
        },
        {
            medicineName: "Lisinopril",
            srcLinks: [
                {
                    webHost: "drugs.com",
                    webViewSrc: "https://www.drugs.com/lisinopril.html",
                },
                {
                    webHost: "webmd",
                    webViewSrc: "https://www.webmd.com/drugs/2/drug-6873-1785/lisinopril-oral/lisinopril-solution-oral/details",
                },
                {
                    webHost: "MayoClinic",
                    webViewSrc: "https://www.mayoclinic.org/diseases-conditions/high-blood-pressure/in-depth/high-blood-pressure/art-20046974",
                },
                {
                    webHost: "healthboards",
                    webViewSrc: "https://www.healthboards.com/boards/high-low-blood-pressure/607935-lisinopril.html",
                },
            ]
        },
        {
            medicineName: "Rosuvastatin",
            srcLinks: [
                {
                    webHost: "drugs.com",
                    webViewSrc: "https://www.drugs.com/search.php?searchterm=Rosuvastatin",
                },
                {
                    webHost: "webmd",
                    webViewSrc: "https://www.webmd.com/drugs/2/drug-76701/rosuvastatin-oral/details",
                },
                {
                    webHost: "MayoClinic",
                    webViewSrc: "https://www.mayoclinic.org/diseases-conditions/high-blood-cholesterol/in-depth/reduce-cholesterol/art-20045935",
                },
                {
                    webHost: "healthboards",
                    webViewSrc: "https://www.healthboards.com/boards/high-cholesterol/214819-how-long-crestor.html",
                },
            ]
        },
        {
            medicineName: "Levothyroxine",
            srcLinks: [
                {
                    webHost: "drugs.com",
                    webViewSrc: "https://www.drugs.com/search.php?searchterm=Levothyroxine",
                },
                {
                    webHost: "webmd",
                    webViewSrc: "https://www.webmd.com/drugs/2/drug-1433-7074/levothyroxine-oral/levothyroxine-oral/details",
                },
                {
                    webHost: "naturalendocrinesolutions",
                    webViewSrc: "https://www.naturalendocrinesolutions.com/articles/425-5-natural-hyperthyroid-treatment-tips-restore-health/",
                },
                {
                    webHost: "healthboards",
                    webViewSrc: "https://www.healthboards.com/boards/thyroid-disorders/824573-side-effects-levothyroxine-help.html",
                },
            ]
        },
        {
            medicineName: "Atorvastatin",
            srcLinks: [
                {
                    webHost: "drugs.com",
                    webViewSrc: "https://www.drugs.com/search.php?searchterm=Atorvastatin",
                },
                {
                    webHost: "webmd",
                    webViewSrc: "https://www.webmd.com/drugs/2/drug-841/atorvastatin-oral/details",
                },
                {
                    webHost: "MayoClinic",
                    webViewSrc: "https://www.mayoclinic.org/diseases-conditions/high-blood-cholesterol/in-depth/reduce-cholesterol/art-20045935",
                },
                {
                    webHost: "healthboards",
                    webViewSrc: "https://www.healthboards.com/boards/high-cholesterol/1036703-atorvastatin-calcium-shoulder-pain.html",
                },
            ]
        },
        {
            medicineName: "Metformin",
            srcLinks: [
                {
                    webHost: "drugs.com",
                    webViewSrc: "https://www.drugs.com/search.php?searchterm=Metformin",
                },
                {
                    webHost: "webmd",
                    webViewSrc: "https://www.webmd.com/diabetes/qa/what-is-metformin",
                },
                {
                    webHost: "DiabetesDaily",
                    webViewSrc: "https://www.diabetesdaily.com/blog/2014/01/managing-my-type-2-diabetes-without-medications/",
                },
                {
                    webHost: "healthboards",
                    webViewSrc: "https://www.healthboards.com/boards/polycystic-ovary-syndrome-pcos/692412-how-soon-after-you-take-metformin-can-you-feel-sick.html",
                },
            ]
        },
    ];


    // Sets current testdata to default and returns it
    //
    export function getWebViewSrcArray() {
        return webViewSrcArray;
    };

    // Sets current testdata to default and returns it
    //
    export function addMedicineBinding(medicineBinding: MedicineBinding) {
        testData.push(medicineBinding);
    };

    // Returns testdata, if testData === null, sets testData to default and returns it
    //
    export function getCurrentTestData(): MedicineBinding[] {
        if (testData == null) {
            testData = getDefaultTestData();
        }
        return testData;
    };

    // Returns default language test data
    //
    function getDefaultTestData(): MedicineBinding[] {

        // let testdataMap: TestdataMap[] = [ // These maps don't work, need to debug it
        //     { "english": enTestData },
        //     { "spanish": spTestData },
        // ];

        let defaultTestData: MedicineBinding[];
        let defaultLanguage: string = Utility.Language.getDefaultLanguage();

        if (defaultLanguage === "english") {
            defaultTestData = getEnTestData();
        }
        else {
            defaultTestData = getSpTestData();
        }

        return defaultTestData;
        // return testdataMap[defaultLanguage];
    };

    // Sets testData and returns English language dataset
    //
    export function getEnTestData(): MedicineBinding[] {
        testData = enTestData;
        return testData;
    };

    // Sets testData and returns Spanish language dataset
    //
    export function getSpTestData(): MedicineBinding[] {
        testData = spTestData;
        return testData;
    };
}
