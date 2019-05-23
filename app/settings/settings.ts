import { MedicineBinding, MedicineBindingList } from "~/data-models/medicine-binding";

export class Settings {

    private _currentTagId: string;

    private _currentMedicine: string;

    private _isConfirmingDose: boolean;
    
    private _isAudioEnabled: boolean;

    private _isAlwaysPlayAudio: boolean;

    private _isAlwaysConfirmDose: boolean;

    private _isNewBinding: boolean;

    private _isSpeechRecognitionAvailable: boolean;

    private _medicineList: MedicineBindingList;

    private static _instance: Settings = new Settings();

    constructor() {
        if (Settings._instance) {
            throw new Error("Use Settings.getInstance() instead of new.");
        }
        Settings._instance = this;
    }

    public static getInstance(): Settings {
        return this._instance;
    }

    public get medicineList() {
        return this._medicineList;
    }

    public set medicineList(value: MedicineBindingList) {
        this._medicineList = value;
    }

    public get currentTagId() {
        return this._currentTagId;
    }

    public set currentTagId(value: string) {
        this._currentTagId = value;
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

    public get isAudioEnabled() {
        return this._isAudioEnabled;
    }

    public set isAudioEnabled(value: boolean) {
        this._isAudioEnabled = value;
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

    public get isNewBinding() {
        return this._isNewBinding;
    }

    public set isNewBinding(value: boolean) {
        this._isNewBinding = value;
    }

    public get isSpeechRecognitionAvailable() {
        return this._isSpeechRecognitionAvailable;
    }

    public set isSpeechRecognitionAvailable(value: boolean) {
        this._isSpeechRecognitionAvailable = value;
    }
}
