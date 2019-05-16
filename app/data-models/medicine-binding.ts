export class MedicineBinding {
    constructor(public tagId?: string, public medicineName?: string, public dailyRequiredDoses?: number, public dailyDoses?: number) {
    };
}

export class MedicineBindingList {

    private _bindings: MedicineBinding[] = [];

    constructor(medicineBindings: MedicineBinding[]) {
        medicineBindings.forEach((binding: MedicineBinding) => {
            this._bindings.push(new MedicineBinding(binding.tagId, binding.medicineName, binding.dailyRequiredDoses, binding.dailyDoses));
        });
    };

    public get bindings(): MedicineBinding[] {
        return this._bindings;
    }

    public getMedicineBindingIndex(medicineName: string): number {
        let i: number = 0;
        let index: number = -1;
        this._bindings.forEach(value => {
            if (value.medicineName === medicineName) {
                index = i;
            }
            else {
                i = i + 1;
            }
        })
        return index;
    }

    public getMedicineBindingIndexByTagId(tagId: string): number {
        let i: number = 0;
        let index: number = -1;
        this._bindings.forEach(value => {
            if (value.tagId === tagId) {
                index = i;
            }
            else {
                i = i + 1;
            }
        })
        return index;
    }

    public getMedicineBindingByName(medicineName: string): MedicineBinding {
        let i: number = 0;
        let index: number = -1;
        this._bindings.forEach(binding => {
            if (binding.medicineName.toLowerCase() === medicineName.toLowerCase()) {
                index = i;
            }
            else {
                i = i + 1;
            }
        })
        return (index !== -1) ? this._bindings[index] : null;
    }

    public getMedicineBindingByTagId(tagId: string): MedicineBinding {
        let i: number = 0;
        let index: number = -1;
        this._bindings.forEach(binding => {
            if (binding.tagId.toLocaleLowerCase() === tagId) {
                index = i;
            }
            else {
                i = i + 1;
            }
        })
        return (index !== -1) ? this._bindings[index] : null;
    }

    public getMedicineBindingByIndex(index: number): MedicineBinding {
        return this._bindings[index];
    }

    public getDailyDosesRequired(medicineName: string): number {
        let dailyDosesRequired: number;
        let medicineBinding: MedicineBinding = this.getMedicineBindingByName(medicineName);
        if (medicineBinding) {
            dailyDosesRequired = medicineBinding.dailyRequiredDoses;
        }
        else {
            dailyDosesRequired = -1;
        }
        return dailyDosesRequired;
    }

    public getDosesTakenToday(medicineName: string): number {
        let dosesTakenToday: number;
        let medicineBinding: MedicineBinding = this.getMedicineBindingByName(medicineName);
        if (medicineBinding) {
            dosesTakenToday = medicineBinding.dailyDoses;
        }
        else {
            dosesTakenToday = -1;
        }
        return dosesTakenToday;
    }

    public setDosesTakenToday(medicineName: string, doses: number): void {
        let medicineBinding: MedicineBinding = this.getMedicineBindingByName(medicineName);
        if (medicineBinding) {
            medicineBinding.dailyDoses = doses;
        }
        else {
            console.log("setDosesTakenToday: " + medicineName + " not found in _medicineBindings");
        }
    }

    public setDailyDoseRequirement(medicineName: string, doses: number): void {
        let medicineBinding: MedicineBinding = this.getMedicineBindingByName(medicineName);
        if (medicineBinding) {
            medicineBinding.dailyRequiredDoses = doses;
        }
        else {
            console.log("setDailyDoseRequirement: " + medicineName + " not found in _medicineBindings");
        }
    }

    public addMedicineBinding(medicineBinding: MedicineBinding) {
        this._bindings.push(medicineBinding);
    };
}
