import { Settings } from "~/settings/settings";

export class MedicineBinding {
    constructor(
        public tagId?: string,
        public medicineName?: string,
        public dailyRequiredDoses?: number,
        public dailyDoses?: number,
        public audioTrack?: string,
    ) {
    };
}

export class MedicineCabinet {
    private _medicines: MedicineBinding[] = [];

    constructor(private _owner: string, medicineBindings: MedicineBinding[], private _ownerTitle?: string) {
        medicineBindings.forEach((binding: MedicineBinding) => {
            this._medicines.push(new MedicineBinding(binding.tagId, binding.medicineName, binding.dailyRequiredDoses, binding.dailyDoses, binding.audioTrack));
        });
    };

    public get owner(): string {
        return this._owner;
    }

    public set owner(value: string) {
        this._owner = value;
    }

    public get ownerTitle(): string {
        return this._ownerTitle;
    }

    public set ownerTitle(value: string) {
        this._ownerTitle = value;
    }

    public get medicines(): MedicineBinding[] {
        return this._medicines;
    }

    public set medicines(value: MedicineBinding[]) {
        this._medicines = value;
    }

    public getMedicineCabinetByTagId(tagId: string) {

    }
    public getMedicineBindingByTagId(tagId: string): MedicineBinding {
        let i: number = 0;
        let index: number = -1;
        this._medicines.forEach(binding => {
            if (binding.tagId.toLocaleLowerCase() === tagId) {
                index = i;
            }
            else {
                i = i + 1;
            }
        })
        return (index !== -1) ? this._medicines[index] : null;
    }

    public getMedicineBindingIndexByTagId(tagId: string): number {
        let i: number = 0;
        let index: number = -1;
        this._medicines.forEach(value => {
            if (value.tagId === tagId) {
                index = i;
            }
            else {
                i = i + 1;
            }
        })
        return index;
    }

    /* Returns null if medicine name is not found */
    public getMedicineBinding(medicineName: string): MedicineBinding {
        let i: number = 0;
        let index: number = -1;
        this._medicines.forEach(binding => {
            if (binding.medicineName.toLowerCase() === medicineName.toLowerCase()) {
                index = i;
            }
            else {
                i = i + 1;
            }
        })
        return (index !== -1) ? this._medicines[index] : null;
    }

    /* Returns -1 if medicine name not found in medicine list */
    public getMedicineBindingIndex(medicineName: string): number {
        let i: number = 0;
        let index: number = -1;
        this._medicines.forEach(value => {
            if (value.medicineName === medicineName) {
                index = i;
            }
            else {
                i = i + 1;
            }
        })
        return index;
    }

    public getMedicineBindingByIndex(index: number): MedicineBinding {
        return this._medicines[index];
    }

    public getDailyDosesRequired(medicineName: string): number {
        let dailyDosesRequired: number;
        let medicineBinding: MedicineBinding = this.getMedicineBinding(medicineName);
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
        let medicineBinding: MedicineBinding = this.getMedicineBinding(medicineName);
        if (medicineBinding) {
            dosesTakenToday = medicineBinding.dailyDoses;
        }
        else {
            dosesTakenToday = -1;
        }
        return dosesTakenToday;
    }

    public setDosesTakenToday(medicineName: string, doses: number): void {
        let index: number = this.getMedicineBindingIndex(medicineName);
        this.medicines[index].dailyDoses = doses;
    }

    public setDailyDoseRequirement(medicineName: string, doses: number): void {
        let index: number = this.getMedicineBindingIndex(medicineName);
        if (index !== -1) {
            this.medicines[index].dailyRequiredDoses = doses;
        }
        else {
            if (Settings.isDebugBuild) {
                console.log("setDailyDoseRequirement: " + medicineName + " not found in _medicineBindings");
            }
        }
    }

    public addMedicineBinding(medicineBinding: MedicineBinding) {
        this._medicines.push(medicineBinding);
    };

    public replaceMedicineBinding(index: number, medicineBinding: MedicineBinding) {
        this._medicines.splice(index, 1, medicineBinding);
    };

    public deleteMedicineBinding(medicineName: string) {
        let index: number = this.getMedicineBindingIndex(medicineName);
        if (index !== -1) {
            this._medicines.splice(index, 1);
        }
    };
}
