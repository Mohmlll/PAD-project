
/**
 * Implementation of a template manager that handles ppage  events
 */
const DEFAULT_SUCCESS_MESSAGE = `Actie uitgevoerd.`
const DEFAULT_ERROR_MESSAGE = `Er is iets fout gegaan.`

const message = {
    success(message = DEFAULT_SUCCESS_MESSAGE){
        $.notify({
            // options
            message: message
        },{
            // settings
            type: 'success'
        });
    },
    error(message = DEFAULT_ERROR_MESSAGE){
        $.notify({
            // options
            message: message
        },{
            // settings
            type: 'warning'
        });
    }
}