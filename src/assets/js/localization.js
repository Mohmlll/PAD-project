/**
 * Localization-extension for the FYS.Cloud library
 *
 * @author Lennard Fonteijn
 *
 * @namespace Localization
 * @memberof FYSCloud
 *
 * @since 0.0.3
 */
FYSCloud.Localization = (function ($) {
    const exports = {
        setTranslations: setTranslations,
        switchLanguage: switchLanguage,
        translate: translate
    };
    var localization;
    var activeLanguage;
    /**
     * @memberof FYSCloud.Localization
     *
     * @description Register all the translations to localize a webpage
     * @param {any} translations Free-form object with all translations
     */
    function setTranslations(translations) {
        localization = translations;
    }
    /**
     * @memberof FYSCloud.Localization
     *
     * @description Switch the active language, will be immediately applied.
     * @param {string} language Name of the language to activate
     */
    function switchLanguage(language) {
        activeLanguage = language;
        translate(true);
    }
    /**
     * @memberof FYSCloud.Localization
     *
     * @description Apply the translations for the active language, useful for dynamic changes on a webpage.
     * @param {boolean} [force] Set to true to translate everything on a webpage, otherwise false to only translate untranslated parts (Default: false).
     */
    function translate(force) {
        const selector = force
            ? "[data-translate]"
            : "[data-translate]:not([localized])";
        $(selector).each(function () {
            const localizeKey = $(this).attr("data-translate");
            const localizeKeys = localizeKey.split(".");
            var result = localization;
            for (let i = 0; i < localizeKeys.length; i++) {
                result = result[localizeKeys[i]];
                if (result === undefined) {
                    break;
                }
            }
            $(this)
                .attr("translated", "")
                .html(
                    result && result[activeLanguage]
                        ? result[activeLanguage]
                        : `[${localizeKey}]`
                );
        });
    }
    return exports;
})(jQuery);