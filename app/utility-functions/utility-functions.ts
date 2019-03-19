
export namespace Language {
    interface LanguageMap {
        [key: string]: string;
    }

    const defaultLanguage: string = "english";
    
    let currentLanguage: string;
    let lanugageDirectoryRoot: string = "~/audio/";

    export function getDefaultLanguage(): string {
        return defaultLanguage.toLowerCase();
    }

    export function getCurrentLanguage(): string {
        if (currentLanguage == null) {
            currentLanguage = getDefaultLanguage();
        }
        return currentLanguage;
    }

    export function setCurrentLanguage(language: string): void {
        currentLanguage = language.toLowerCase();
    }

    export function getAudioPath(medicineName: string): string {
        // let languageMap: LanguageMap[] = [
        //     { "english": "en" },
        //     { "spanish": "sp" },
        // ];

        let languageDirectory: string;
        let language: string = getCurrentLanguage();
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


