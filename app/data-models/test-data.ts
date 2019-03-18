import { MedicineBinding } from "./medicine-binding";

export class TestData {

    private testData: MedicineBinding[] = null;

    private static staticTestData: MedicineBinding[] = [
        { tagId: "-9955102114", medicineName: "Oxycodone", audioPath: "~/audio/en/mom.mp3" },
        // { tagId: "-674590-106", medicineName: "Atorvastatin", audioPath: "~/audio/en/atorvastatin.mp3"  },
        { tagId: "-99-8170-106", medicineName: "Lisinopril", audioPath: "~/audio/en/lisinopril.mp3" },
        { tagId: "77-475-106", medicineName: "Rosuvastatin", audioPath: "~/audio/en/rosuvastatin.mp3" },
        { tagId: "-31881-106", medicineName: "Levothyroxine", audioPath: "~/audio/en/levothyroxine.mp3" }];

    constructor() {
    };

    public addMedicineBinding(tagMedicinePair: MedicineBinding) {
        this.testData.push(tagMedicinePair);
    };

    public getTestData(): MedicineBinding[] {
        return this.testData;
    };

    public getStaticTestData(): MedicineBinding[] {
        return TestData.staticTestData;
    };
}
