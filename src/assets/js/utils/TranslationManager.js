/**
 * Translation manager:
 */

class TranslationManager{

    initialLanguage = localStorage.getItem('PADlanguage') || 'nl';
    translations = {

        homepage: {
            nl: "Inloggen",
            en: "Log In"
        },

        register: {
            nl: "Registreren",
            en: "Register"
        },



    }

    constructor()
    {
        console.log("Translation class loaded: true");

        PADCloud.Localization.setTranslations(this.translations);
        PADCloud.Localization.switchLanguage(this.initialLanguage);

        $("#localizationLanguageSwitch").val(this.initialLanguage);
    }

    /**
     * Switches the sites language and saves it in users local storage
     * @param value
     */
    switchLanguage(value)
    {
        PADCloud.Localization.switchLanguage(value);
        localStorage.setItem('PADlanguage', value);
    }

    /**
     * Translates the sites text
     */
    translate()
    {
        var template = $("#localizationDynamicTemplate").html();

        var element = $(template);

        $(".localizationSubheaderTarget").append(element);

        FYSCloud.Localization.translate();
    }
}