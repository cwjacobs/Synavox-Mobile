import { MedicineBinding } from "./medicine-binding";
import { getLanguageSetting } from "../settings/settings-page"

interface TestdataMap {
    [key: string]: MedicineBinding[];
}

export class TestData {

    private testData: MedicineBinding[] = null;

    private static staticEnTestData: MedicineBinding[] = [
        { tagId: "-9955102114", medicineName: "Oxycodone", audioPath: "~/audio/en/mom.mp3" },
        { tagId: "-99-8170-106", medicineName: "Lisinopril", audioPath: "~/audio/en/lisinopril.mp3" },
        { tagId: "77-475-106", medicineName: "Rosuvastatin", audioPath: "~/audio/en/rosuvastatin.mp3" },
        { tagId: "-31881-106", medicineName: "Levothyroxine", audioPath: "~/audio/en/levothyroxine.mp3" },
        // { tagId: "-674590-106", medicineName: "Atorvastatin", audioPath: "~/audio/en/atorvastatin.mp3"  },
    ];

    private static staticSpTestData: MedicineBinding[] = [
        { tagId: "-9955102114", medicineName: "Oxycodone", audioPath: "~/audio/sp/mom.mp3" },
        { tagId: "-99-8170-106", medicineName: "Lisinopril", audioPath: "~/audio/sp/lisinopril.mp3" },
        { tagId: "77-475-106", medicineName: "Rosuvastatin", audioPath: "~/audio/sp/rosuvastatin.mp3" },
        { tagId: "-31881-106", medicineName: "Levothyroxine", audioPath: "~/audio/sp/levothyroxine.mp3" },
        // { tagId: "-674590-106", medicineName: "Atorvastatin", audioPath: "~/audio/sp/atorvastatin.mp3"  },
    ];

    constructor() {
    };

    public addMedicineBinding(tagMedicinePair: MedicineBinding) {
        this.testData.push(tagMedicinePair);
    };

    public getTestData(): MedicineBinding[] {
        return this.testData;
    };

    public getStaticTestData(): MedicineBinding[] {

        let testdataMap: TestdataMap[] = [
            { "English": TestData.staticEnTestData },
            { "Spanish": TestData.staticSpTestData },
        ];

        let language: string = "English"; // Until I figure out how to get around having to load the settings page to make the getLanguageSetting function available
        // let language: string = getLanguageSetting();

        let staticTestData: MedicineBinding[] = testdataMap[language];

        return staticTestData;
    };

    public getStaticEnTestData(): MedicineBinding[] {
        return TestData.staticEnTestData;
    };

    public getStaticSpTestData(): MedicineBinding[] {
        return TestData.staticSpTestData;
    };

}
