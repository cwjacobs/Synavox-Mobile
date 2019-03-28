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
        // { tagId: "-67,45,90,-106", medicineName: "Atorvastatin", audioPath: "~/audio/en/atorvastatin.mp3"  },
    ];
    
    let spTestData: MedicineBinding[] = [
        { tagId: "-99,55,102,114", medicineName: "Oxycodone", audioPath: "~/audio/sp/opioid.mp3" },
        { tagId: "-99,-81,70,-106", medicineName: "Lisinopril", audioPath: "~/audio/sp/lisinopril.mp3" },
        { tagId: "77,-4,75,-106", medicineName: "Rosuvastatin", audioPath: "~/audio/sp/rosuvastatin.mp3" },
        { tagId: "-3,18,81,-106", medicineName: "Levothyroxine", audioPath: "~/audio/sp/levothyroxine.mp3" },
        // { tagId: "-67,45,90,-106", medicineName: "Atorvastatin", audioPath: "~/audio/sp/atorvastatin.mp3"  },
    ];

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
