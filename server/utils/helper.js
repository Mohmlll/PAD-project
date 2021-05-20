/**
 * Returns security config for CORS, for now all requests are supported across domains
 *
 * @author Pim Meijer
 */

function randomImageString(){
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + new Date().getTime();
}

module.exports = {
    randomImageString
};