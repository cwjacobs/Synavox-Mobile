import { Observable } from "tns-core-modules/data/observable";
import { Page } from "tns-core-modules/ui/page/page";

import { SelectedPageService } from "../shared/selected-page-service";

export class SettingsViewModel extends Observable {
    private page: Page = null;
    public primaryLanguage: string;
    public isEnglishEnabled: boolean;
    public isSpanishEnabled: boolean;
    public isEnButtonEnabled: boolean;
    public isSpButtonEnabled: boolean;
    
    
    constructor(page: Page) {
        super();
        this.page = page;

        SelectedPageService.getInstance().updateSelectedPage("Settings");
    }
}
