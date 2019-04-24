export class I18N {

    private static readonly _defaultLanguage: string = "English";

    private static _instance: I18N = new I18N();

    private _activeLanguage: string;

    private _activeLanguageIndex: number;

    private constructor() {
        if (I18N._instance) {
            throw new Error("Error: Instantiation failed: Use I18N.getInstance() instead of new.");
        }
        I18N._instance = this;
        this.activeLanguage = I18N.defaultLanguage;
    }

    public static get instance() {
        if (!this._instance) {
            alert("I18N._instance is not defined");
        }
        return this._instance;
    }

    private static get defaultLanguage() {
        return I18N._defaultLanguage;
    }

    public get activeLanguage() {
        return this._activeLanguage;
    }

    public set activeLanguage(activeLanguage: string) {
        this._activeLanguage = activeLanguage.toLowerCase();
        this._activeLanguageIndex = this.activeLanguage === "english" ? 0 : 1;
    }

    /**
     * Shared
     */

    public get save() {
        const text: string[] = ["Save", "Salvar"];
        return text[this._activeLanguageIndex];
    }

    public get cancel() {
        const text: string[] = ["Cancel", "Cancelar"];
        return text[this._activeLanguageIndex];
    }


    /**
     * Dose Page
     */

    public get dose() {
        const text: string[] = ["Dose", "Dosis"];
        return text[this._activeLanguageIndex];
    }

    public get changeDosesPerDay() {
        const text: string[] = ["Change Doses per Day", "Cambiar Dosis por Día"];
        return text[this._activeLanguageIndex];
    }

    public get changeDosesTaken() {
        const text: string[] = ["Change Doses Taken", "Cambie las Dosis Tomadas"];
        return text[this._activeLanguageIndex];
    }

    public dosesTaken(dosesTaken: number): string {
        const enText: string[] = [
            "Take as needed",
            "Took one dose today",
            "Took two doses today",
            "Took three doses today",
            "Took four doses today",
            "Took Five doses today",
        ];
        const spText: string[] = [
            "Tome según sea necesario",
            "Tomó una dosis hoy",
            "Tomó dos dosis hoy",
            "Tomó tres dosis hoy",
            "Tomó cuatro dosis hoy",
            "Tomó cinco dosis hoy",
        ];
        const text: string[][] = [enText, spText]

        if (dosesTaken > 5) {
            dosesTaken = 0; // Doses greater than 5 per day are "take as needed" - 1st array element
        }
        return text[this._activeLanguageIndex][dosesTaken];
    }

    public dosesPerDay(dosesPerDay: number): string {
        const enText: string[] = [
            "Take as needed",
            "Take once daily",
            "Take twice daily",
            "Take three times daily",
            "Take four times daily",
            "Take five times daily",
        ];
        const spText: string[] = [
            "Tome según sea necesario",
            "Tome una vez al día",
            "Tome dos veces al día",
            "Tome tres veces al día",
            "Tome cuatro veces al día",
            "Tome cinco veces al día",
        ];
        const text: string[][] = [enText, spText]

        if (dosesPerDay > 5) {
            dosesPerDay = 0; // Doses greater than 5 per day are "take as needed" - 1st array element
        }
        return text[this._activeLanguageIndex][dosesPerDay];
    }

    public doseTakenConfirmMsg(medicineName: string): string {
        const text: string[] = ["Please confirm one dose of ", "Por favor, confirme una dosis de "];
        return (text[this._activeLanguageIndex] + medicineName);
    }

}

