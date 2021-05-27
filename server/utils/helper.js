/**
 * Returns security config for CORS, for now all requests are supported across domains
 *
 * @author Pim Meijer
 */
const db = require("./databaseHelper");
const axios = require('axios')

const connectionPool = db.init();
axios.defaults.headers.common = {'Authorization': `Bearer pad_gym_6.5K1rqYRLfMikoqjx`}


function randomImageString(){
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + new Date().getTime();
}

const user = {
    async getByEmail(email){
        return new Promise(function(resolve, reject) {
            db.handleQuery(connectionPool, {
                query: "SELECT * FROM user WHERE email = ?",
                values: [email.toLowerCase()]
            }, data => {
                resolve(data[0]);
                // return data;
            }, err => {
                resolve(null);
            });
        });
    },
    async getById(id){
        return new Promise(function(resolve, reject) {
            db.handleQuery(connectionPool, {
                query: "SELECT * FROM user WHERE id = ?",
                values: [id]
            }, data => {
                resolve(data[0]);
                // return data;
            }, err => {
                resolve(null);
            });
        });
    },
    async createResetToken(user) {
        return new Promise(function (resolve, reject) {
            const token = Math.floor(100000 + Math.random() * 900000);

            db.handleQuery(connectionPool, {
                query: "INSERT INTO user_reset_tokens(user_id, token) values(?,?)",
                values: [user.id, token]
            }, data => {
                resolve(token);
            }, err => {
                resolve(false);
            })
        });
    },
    async findValidToken(token){
        return new Promise(function(resolve, reject) {
            db.handleQuery(connectionPool, {
                query: "SELECT user_id FROM user_reset_tokens WHERE token = ? AND TIMESTAMPDIFF(MINUTE, created_at, NOW()) < 10",
                values: [token]
            }, data => {
                resolve(data[0]);
                // return data;
            }, err => {
                resolve(false);
            });
        });
    },
}

const mailer = {
    async sendEmail(message){
        return new Promise(function(resolve, reject) {
            axios
                .post('https://api.hbo-ict.cloud/mail', message)
                .then(res => {
                    resolve(true)
                })
                .catch(error => {
                    resolve(false)
                })
        });
    }
}

module.exports = {
    randomImageString,
    user,
    mailer
};