import { MedicineCabinet } from "~/data-models/medicine-cabinet";

export class Settings {

    public static readonly isDebugBuild: boolean = false;

    private static readonly _version: string = "Version: 1.30.3";
    
    private static readonly _versionDate: string = "Build Date: 7/23/2019";

    public static readonly brightIconColors: string[] = ["#3ab7ff", "#35db02", "#b104f5"];

    private _currentTab: number;

    private _currentPage: string;

    private _currentTagId: string;

    private _currentMedicineName: string;

    private _isConfirmingDose: boolean;

    private _isAudioEnabled: boolean;

    private _isAlwaysPlayAudio: boolean;

    private _isAlwaysConfirmDose: boolean;

    private _isNewBinding: boolean;

    private _isSpeechRecognitionAvailable: boolean;

    private _isAddingNewMedicine: boolean;

    private _curentMedicineCabinet: MedicineCabinet;

    private _medicineCabinets: MedicineCabinet[] = [];

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

    public static get version() {
        return this._version;
    }

    public static get versionDate() {
        return this._versionDate;
    }

    public static get buildType() {
        let buildType: string = Settings.isDebugBuild ? "Debug build" : "Release build";
        return buildType;
    }

    public get currentTab(): number {
        return this._currentTab;
    }

    public set currentTab(value: number) {
        this._currentTab = value;
    }

    public get currentPage(): string {
        return this._currentPage;
    }

    public set currentPage(value: string) {
        this._currentPage = value;
    }

    public get currentMedicineCabinet() {
        return this._curentMedicineCabinet;
    }

    public set currentMedicineCabinet(value: MedicineCabinet) {
        this._curentMedicineCabinet = value;
    }

    public getMedicineCabinet(owner: string) {
        return this._medicineCabinets[owner];
    }

    public setMedicineCabinet(owner: string, value: MedicineCabinet) {
        this._medicineCabinets[owner] = value;
    }

    public get currentTagId() {
        return this._currentTagId;
    }

    public set currentTagId(value: string) {
        this._currentTagId = value;
    }

    public get currentMedicineName() {
        return this._currentMedicineName;
    }

    public set currentMedicineName(value: string) {
        this._currentMedicineName = this.removeSpecialCharacters(value);
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

    public get isAddingNewMedicine() {
        return this._isAddingNewMedicine;
    }

    public set isAddingNewMedicine(value: boolean) {
        this._isAddingNewMedicine = value;
    }

    private removeSpecialCharacters(src: string): string {
        let dst: string = src.replace(/[^a-zA-Z]/g, "");
        return dst;
    }
}

