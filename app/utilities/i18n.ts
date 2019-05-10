/**
 * A singleton class providing strings in the currently active language
 */
export class I18N {

    private static readonly _defaultLanguage: string = "English";

    private static _instance: I18N = new I18N();

    private _activeLanguage: string;

    private _activeLanguageIndex: number;

    private _isEnglishEnabled: boolean;

    private _isSpanishEnabled: boolean;

    private constructor() {
        if (I18N._instance) {
            throw new Error("Error: Instantiation failed: Use I18N.getInstance() instead of new.");
        }
        I18N._instance = this;
        this.initialize();
    }

    private initialize() {
        this.activeLanguage = I18N.defaultLanguage;
        if(this.activeLanguage === "english") {
            this.isEnglishEnabled = true;
            this.isSpanishEnabled = false;
        }
        else {
            this.isEnglishEnabled = false;
            this.isSpanishEnabled = true;
        }
    };

    public static getInstance() {
        return this._instance;
    }

    private static get defaultLanguage() {
        return I18N._defaultLanguage;
    }

    public set isEnglishEnabled(value: boolean) {
        this._isEnglishEnabled = value;
    }

    public get isEnglishEnabled(): boolean {
        return this._isEnglishEnabled;
    }

    public set isSpanishEnabled(value: boolean) {
        this._isSpanishEnabled = value;
    }

    public get isSpanishEnabled(): boolean {
        return this._isSpanishEnabled;
    }

    public get isDualLanguageEnabled(): boolean {
        return (this.isEnglishEnabled && this.isSpanishEnabled);
    }

    public toggleEnglishEnabled(): boolean {
        this.isEnglishEnabled = !this.isEnglishEnabled;

        if (!this.isEnglishEnabled) { // Must have at least one enabled & active language
            this.activeLanguage = "spanish";
        }
        return this.isEnglishEnabled;
    }

    public toggleSpanishEnabled(): boolean {
        this.isSpanishEnabled = !this.isSpanishEnabled;

        if (!this.isSpanishEnabled) { // Must have at least one enabled & active language
            this.activeLanguage = "english";
        }
        return this.isSpanishEnabled;
    }

    public get activeLanguage() {
        return this._activeLanguage;
    }

    public set activeLanguage(activeLanguage: string) {
        this._activeLanguage = activeLanguage.toLowerCase();
        this._activeLanguageIndex = this.activeLanguage === "english" ? 0 : 1;
    }

    /******************************
     * Page Navigation
     ******************************/

    public get homeNav() {
        const text: string[] = ["Home", "Pantalla de Inicio"];
        return text[this._activeLanguageIndex];
    }

    public get doseNav() {
        const text: string[] = ["Dose", "Dosis"];
        return text[this._activeLanguageIndex];
    }

    public get pairNav() {
        const text: string[] = ["Pair", "Partido"];
        return text[this._activeLanguageIndex];
    }

    public get shareNav() {
        const text: string[] = ["Share", "Compartir"];
        return text[this._activeLanguageIndex];
    }

    public get browseNav() {
        const text: string[] = ["Browse", "Navega"];
        return text[this._activeLanguageIndex];
    }

    public get wizardNav() {
        const text: string[] = ["Wizard", "Hechicero"];
        return text[this._activeLanguageIndex];
    }

    public get settingsNav() {
        const text: string[] = ["Settings", "Configuración"];
        return text[this._activeLanguageIndex];
    }


    /******************************
     * Shared
     ******************************/

    public get save() {
        const text: string[] = ["Save", "Salvar"];
        return text[this._activeLanguageIndex];
    }

    public get cancel() {
        const text: string[] = ["Cancel", "Cancelar"];
        return text[this._activeLanguageIndex];
    }

    public get delete() {
        const text: string[] = ["Delete", "Eliminar"];
        return text[this._activeLanguageIndex];
    }

    public get myMedicines() {
        const text: string[] = ["My Medicines", "Mis Medicamentos"];
        return text[this._activeLanguageIndex];
    }


    /******************************
     * Home Page
     ******************************/

    public get homePageTitle() {
        const text: string[] = ["Synavox Home Pharmacist", "Synavox Farmacéutico de Casa"];
        return text[this._activeLanguageIndex];
    }

    public get english() {
        const text: string[] = ["English", "English"];
        return text[this._activeLanguageIndex];
    }

    public get spanish() {
        const text: string[] = ["Español", "Español"];
        return text[this._activeLanguageIndex];
    }

    public get newTagAlert() {
        const text: string[] = ["New tag scanned, use 'Pair' screen to associate with a medicine",
            "Nueva etiqueta escaneada, utilice la pantalla 'Pair' para asociarse con un medicamento"];
        return text[this._activeLanguageIndex];
    }



    /******************************
     * Dose Page
     ******************************/

    public get dosePageTitle() {
        const text: string[] = ["Synavox Home Pharmacist", "Synavox Farmacéutico de Casa"];
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



    /******************************
     * Pair Page
     ******************************/

    public get pairPageTitle() {
        const text: string[] = ["Pair", "Partido"];
        return text[this._activeLanguageIndex];
    }

    public get pairMedicineNameHint() {
        const text: string[] = ["Enter Medicine Name", "Ingrese el nombre del medicamento"];
        return text[this._activeLanguageIndex];
    }

    public getParingUpdatedMsg(medicineName: string): string {
        let confirmMsg: string;
        if (this.activeLanguage === "english") {
            confirmMsg = "Pairing of " + medicineName + " has been updated";
        }
        else {
            confirmMsg = "El emparejamiento de " + medicineName + " se ha actualizado";
        }
        return confirmMsg;
    }

    public getParingUpdatConfirmMsg(medicineName: string): string {
        let confirmMsg: string;
        if (this.activeLanguage === "english") {
            confirmMsg = "Are you sure you want to delete the " + medicineName + " pairing?";
        }
        else {
            confirmMsg = "¿Está seguro de que desea eliminar el emparejamiento " + medicineName + " ?";
        }
        return confirmMsg;
    }


    /******************************
     * Share Page
     ******************************/

    public get sharePageTitle() {
        const text: string[] = ["Share", "Compartir"];
        return text[this._activeLanguageIndex];
    }

    public get sharePageHeading() {
        const text: string[] = ["Share My Home Pharmacist", "Compartir mi Farmacéutico de Casa"];
        return text[this._activeLanguageIndex];
    }

    public get shareContactFilterLabel() {
        const text: string[] = ["Share with: ", "Comparta con: "];
        return text[this._activeLanguageIndex];
    }

    public get shareContactFilterHint() {
        const text: string[] = ["Enter name from contacts", "El nombre de los contactos"];
        return text[this._activeLanguageIndex];
    }

    public get shareContactNameLabel() {
        const text: string[] = ["Name: ", "Nombre: "];
        return text[this._activeLanguageIndex];
    }

    public get shareContactEmailLabel() {
        const text: string[] = ["Email: ", "Correo electrónico: "];
        return text[this._activeLanguageIndex];
    }

    public get shareContactPhoneLabel() {
        const text: string[] = ["Phone: ", "Teléfono: "];
        return text[this._activeLanguageIndex];
    }

    public get share() {
        const text: string[] = ["Share: ", "Compartir: "];
        return text[this._activeLanguageIndex];
    }

    public getShareCompleteMsg(name: string): string {
        let confirmMsg: string;
        if (this.activeLanguage === "english") {
            confirmMsg = "Sharing with " + name + " completed successfully";
        }
        else {
            confirmMsg = "Compartir con " + name + " completado con éxito";
        }
        return confirmMsg;
    }


    /******************************
     * Browse Page
     ******************************/

    public get browsePageTitle() {
        const text: string[] = ["Browse", "Navega"];
        return text[this._activeLanguageIndex];
    }

    public get browseBack() {
        const text: string[] = ["Back", "Atrás"];
        return text[this._activeLanguageIndex];
    }

    public get browseSave() {
        const text: string[] = ["Save", "Salvar"];
        return text[this._activeLanguageIndex];
    }


    /******************************
     * Wizard Page
     ******************************/

    public get wizardPageTitle() {
        const text: string[] = ["Scan Wizard", "Asistente de Digitalización"];
        return text[this._activeLanguageIndex];
    }

    public get scannedMsg() {
        const text: string[] = ["Scanned Tag for: ", "Etiqueta escaneada para: "];
        return text[this._activeLanguageIndex];
    }

    public get selectedMsg() {
        const text: string[] = ["Selected Medicine: ", "Medicina eleccionada: "];
        return text[this._activeLanguageIndex];
    }

    public get action_tookADose() {
        const text: string[] = ["I just took a dose", "Sólo tomé una dosis"];
        return text[this._activeLanguageIndex];
    }

    public get action_hearAudio() {
        const text: string[] = ["I want to hear the audio", "Quiero escuchar el audio"];
        return text[this._activeLanguageIndex];
    }

    public get action_alwaysConfirmDose() {
        const text: string[] = ["Always confirm dose", "Confirme siempre la dosis"];
        return text[this._activeLanguageIndex];
    }

    public get action_alwaysPlayAudio() {
        const text: string[] = ["Always play audio", "Siempre reproduzca audio"];
        return text[this._activeLanguageIndex];
    }

    public get confirmDoseTaken() {
        const text: string[] = ["Confirm", "Confirmar"];
        return text[this._activeLanguageIndex];
    }

    public get scrollInstructions() {
        const text: string[] = ["Scroll then Select medicine", "Desplácese a continuación, seleccione medicamento"];
        return text[this._activeLanguageIndex];
    }

    public get select() {
        const text: string[] = ["Select", "Seleccione"];
        return text[this._activeLanguageIndex];
    }


    /******************************
     * Settings Page
     ******************************/

    public get settingsPageTitle() {
        const text: string[] = ["Settings", "Configuración"];
        return text[this._activeLanguageIndex];
    }

    public get languageOptionsSetting() {
        const text: string[] = ["Language Options", "Opciones de Idioma"];
        return text[this._activeLanguageIndex];
    }

    public get activeLanguageSetting() {
        const text: string[] = ["Active: English", "Activo: Español"];
        return text[this._activeLanguageIndex];
    }

    public get installedLanguageSetting() {
        const text: string[] = ["Installed Languages:", "Idiomas Instalados:"];
        return text[this._activeLanguageIndex];
    }

    public get enableLanguageInstructionsSetting() {
        const text: string[] = ["Press language button to enable or disable it", "Pulse el botón de idioma para activarlo o desactivarlo"];
        return text[this._activeLanguageIndex];
    }
}

