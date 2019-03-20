import { Observable } from "tns-core-modules/data/observable";
import { MedicineBinding } from "../data-models/medicine-binding"

import { SelectedPageService } from "../shared/selected-page-service";

export class HomeViewModel extends Observable {
    public medicineName: string = "";
    public isDualLanguageEnabled: boolean;
    public myMedicineList: MedicineBinding[] = null;

    constructor() {
        super();

        SelectedPageService.getInstance().updateSelectedPage("Home");
    }
}
