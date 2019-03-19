export class MedicineBinding {

    constructor(public tagId?: string, public medicineName?: string, public audioPath?: string) {
    };
}

export class MedicineBindingList {

    constructor(public medicineBindingList: MedicineBinding[]) {
    };

    public getCurrentMedicineBindings(): MedicineBinding[] {
        return this.medicineBindingList;
    }

    public setCurrentMedicineBindings(medicineBindingList: MedicineBinding[]) {
        this.medicineBindingList = medicineBindingList;
    }
}
