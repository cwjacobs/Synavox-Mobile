export class Settings {

    private _currentMedicine: string;

    private _isConfirmingDose: boolean;

    private _isAlwaysPlayAudio: boolean;

    private _isAlwaysConfirmDose: boolean;

    private static _instance: Settings = new Settings();

    constructor() {
        if (Settings._instance) {
            throw new Error("Use Settings.getInstance() instead of new.");
        }
        Settings._instance = this;
    }

    public static getInstance(): Settings {
        return Settings._instance;
    }

    public get currentMedicine() {
        return this._currentMedicine;
    }

    public set currentMedicine(value: string) {
        this._currentMedicine = value;
    }

    public get isConfirmingDose() {
        return this._isConfirmingDose;
    }

    public set isConfirmingDose(value: boolean) {
        this._isConfirmingDose = value;
    }

    public get isAlwaysPlayAudio() {
        return this._isAlwaysPlayAudio;
    }

    public set isAlwaysPlayAudio(value: boolean) {
        this._isAlwaysPlayAudio = value;
    }

    public get isAlwaysConfirmDose() {
        return this._isAlwaysConfirmDose;
    }

    public set isAlwaysConfirmDose(value: boolean) {
        this._isAlwaysConfirmDose = value;
    }
}
