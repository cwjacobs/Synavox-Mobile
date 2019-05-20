import { MedicineBinding } from "./medicine-binding";

export class Dataset {

    private static readonly _enTestData: MedicineBinding[] = [
        { tagId: "-99,55,102,114", medicineName: "Oxycodone", dailyRequiredDoses: 20, dailyDoses: 3 },
        { tagId: "-99,-81,70,-106", medicineName: "Lisinopril", dailyRequiredDoses: 1, dailyDoses: 0 },
        { tagId: "77,-4,75,-106", medicineName: "Rosuvastatin", dailyRequiredDoses: 2, dailyDoses: 1 },
        { tagId: "-3,18,81,-106", medicineName: "Levothyroxine", dailyRequiredDoses: 1, dailyDoses: 1 },
        // { tagId: "-67,45,90,-106", medicineName: "Atorvastatin", dailyRequiredDoses: 1, dailyDoses: 0 },
        { tagId: "-67,45,90,-106", medicineName: "Metformin", dailyRequiredDoses: 3, dailyDoses: 1 },
    ];
    
    public static get testData() {
        return Dataset._enTestData;
    };


    private static readonly _webViewSrcArray = [
        {
            medicineName: "Oxycodone",
            srcLinks: [
                {
                    webHost: "drugs.com",
                    webViewSrc: "https://www.drugs.com/search.php?searchterm=oxycodone&a=1",
                },
                {
                    webHost: "webmd",
                    webViewSrc: "https://www.webmd.com/drugs/2/drug-1025-1480/oxycodone-oral/oxycodone-tablet-oral-use-only/details",
                },
                {
                    webHost: "hhs.gov",
                    webViewSrc: "https://www.hhs.gov/blog/2018/05/09/how-im-managing-my-chronic-pain-without-opioids.html",
                },
                {
                    webHost: "healthboards",
                    webViewSrc: "https://index.healthboards.com/addiction/oxycodone-withdrawal-day-5/1/",
                },
            ]
        },
        {
            medicineName: "Lisinopril",
            srcLinks: [
                {
                    webHost: "drugs.com",
                    webViewSrc: "https://www.drugs.com/lisinopril.html",
                },
                {
                    webHost: "webmd",
                    webViewSrc: "https://www.webmd.com/drugs/2/drug-6873-1785/lisinopril-oral/lisinopril-solution-oral/details",
                },
                {
                    webHost: "MayoClinic",
                    webViewSrc: "https://www.mayoclinic.org/diseases-conditions/high-blood-pressure/in-depth/high-blood-pressure/art-20046974",
                },
                {
                    webHost: "healthboards",
                    webViewSrc: "https://www.healthboards.com/boards/high-low-blood-pressure/607935-lisinopril.html",
                },
            ]
        },
        {
            medicineName: "Rosuvastatin",
            srcLinks: [
                {
                    webHost: "drugs.com",
                    webViewSrc: "https://www.drugs.com/search.php?searchterm=Rosuvastatin",
                },
                {
                    webHost: "webmd",
                    webViewSrc: "https://www.webmd.com/drugs/2/drug-76701/rosuvastatin-oral/details",
                },
                {
                    webHost: "MayoClinic",
                    webViewSrc: "https://www.mayoclinic.org/diseases-conditions/high-blood-cholesterol/in-depth/reduce-cholesterol/art-20045935",
                },
                {
                    webHost: "healthboards",
                    webViewSrc: "https://www.healthboards.com/boards/high-cholesterol/214819-how-long-crestor.html",
                },
            ]
        },
        {
            medicineName: "Levothyroxine",
            srcLinks: [
                {
                    webHost: "drugs.com",
                    webViewSrc: "https://www.drugs.com/search.php?searchterm=Levothyroxine",
                },
                {
                    webHost: "webmd",
                    webViewSrc: "https://www.webmd.com/drugs/2/drug-1433-7074/levothyroxine-oral/levothyroxine-oral/details",
                },
                {
                    webHost: "naturalendocrinesolutions",
                    webViewSrc: "https://www.naturalendocrinesolutions.com/articles/425-5-natural-hyperthyroid-treatment-tips-restore-health/",
                },
                {
                    webHost: "healthboards",
                    webViewSrc: "https://www.healthboards.com/boards/thyroid-disorders/824573-side-effects-levothyroxine-help.html",
                },
            ]
        },
        {
            medicineName: "Atorvastatin",
            srcLinks: [
                {
                    webHost: "drugs.com",
                    webViewSrc: "https://www.drugs.com/search.php?searchterm=Atorvastatin",
                },
                {
                    webHost: "webmd",
                    webViewSrc: "https://www.webmd.com/drugs/2/drug-841/atorvastatin-oral/details",
                },
                {
                    webHost: "MayoClinic",
                    webViewSrc: "https://www.mayoclinic.org/diseases-conditions/high-blood-cholesterol/in-depth/reduce-cholesterol/art-20045935",
                },
                {
                    webHost: "healthboards",
                    webViewSrc: "https://www.healthboards.com/boards/high-cholesterol/1036703-atorvastatin-calcium-shoulder-pain.html",
                },
            ]
        },
        {
            medicineName: "Metformin",
            srcLinks: [
                {
                    webHost: "drugs.com",
                    webViewSrc: "https://www.drugs.com/search.php?searchterm=Metformin",
                },
                {
                    webHost: "webmd",
                    webViewSrc: "https://www.webmd.com/diabetes/qa/what-is-metformin",
                },
                {
                    webHost: "DiabetesDaily",
                    webViewSrc: "https://www.diabetesdaily.com/blog/2014/01/managing-my-type-2-diabetes-without-medications/",
                },
                {
                    webHost: "healthboards",
                    webViewSrc: "https://www.healthboards.com/boards/polycystic-ovary-syndrome-pcos/692412-how-soon-after-you-take-metformin-can-you-feel-sick.html",
                },
            ]
        },
    ];

    // Sets current testdata to default and returns it
    public get webViewSrcArray() {
        return Dataset._webViewSrcArray;
    };
}
