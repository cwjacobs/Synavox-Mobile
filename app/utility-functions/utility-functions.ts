
export namespace Language {
    interface LanguageMap {
        [key: string]: string;
    }

    const defaultLanguage: string = "english";
    const lanugageDirectoryRoot: string = "~/audio/";
    
    let activeLanguage: string = null;
    let isEnglishEnabled: boolean = true;
    let isSpanishEnabled: boolean = false;

    export function getDefaultLanguage(): string {
        return defaultLanguage.toLowerCase();
    }

    export function getActiveLanguage(): string {
        if (activeLanguage == null) {
            activeLanguage = getDefaultLanguage();
        }
        return activeLanguage;
    }

    export function setCurrentLanguage(language: string): void {
        activeLanguage = language.toLowerCase();
    }

    export function getIsEnglishEnabled(): boolean {
        return isEnglishEnabled;
    }

    // export function setIsEnglishEnabled(isEnabled: boolean) {
    //     isEnglishEnabled = isEnabled;
    // }

    export function toggleEnglishEnabled(): boolean {
        isEnglishEnabled = !isEnglishEnabled;

        if(!isEnglishEnabled) {
            setCurrentLanguage("spanish");
        }
        return isEnglishEnabled;
    }

    export function getIsSpanishEnabled(): boolean {
        return isSpanishEnabled;
    }

    // export function setIsSpanishEnabled(isEnabled: boolean) {
    //     isSpanishEnabled = isEnabled;
    // }

    export function toggleSpanishEnabled(): boolean {
        isSpanishEnabled = !isSpanishEnabled;

        if (!isSpanishEnabled) {
            setCurrentLanguage("english");
        }
        return isSpanishEnabled;
    }
    export function getIsDualLanguageEnabled(): boolean {
        return isEnglishEnabled && isSpanishEnabled;
    }

    export function getAudioPath(medicineName: string): string {
        // let languageMap: LanguageMap[] = [
        //     { "english": "en" },
        //     { "spanish": "sp" },
        // ];

        let languageDirectory: string;
        let language: string = getActiveLanguage();
        // let languageDirectory: string = languageMap[language];
        if (language === "english") {
            languageDirectory = "en/";
        }
        else {
            languageDirectory = "sp/";
        }
        let languagePath = lanugageDirectoryRoot + languageDirectory + medicineName.toLowerCase() + ".mp3";
        return languagePath;
    }
}


