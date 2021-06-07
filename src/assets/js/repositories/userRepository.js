/**
 * Repository responsible for all user data from server - CRUD
 * Make sure all functions are using the async keyword when interacting with network!
 *
 * @author Pim Meijer
 */
class UserRepository {

    constructor() {
        this.route = "/user"
    }

    async getAll() {

    }

    /**
     * async function that handles a Promise from the networkmanager
     * @param email
     * @param password
     * @returns {Promise<unknown>}
     */
    async login(email, password) {
        return await networkManager
            .doRequest(`${this.route}/login`, {
                email: email,
                password: password
            }, "POST");
    }

    async delete() {

    }

    async duplicateCheck(email) {
        return await networkManager.doRequest(`/duplicateCheck`, {email: email}, "POST");
    }

    async register(email, password, firstname, lastname, birthdate, schoolName, country) {
        return await networkManager
            .doRequest(`/register`, {
                email: email, password: password,
                firstname: firstname, lastname: lastname, birthdate: birthdate
                , schoolName: schoolName, country: country
            }, "POST");
    }

    // reset via email
    async resetPassword(email) {
        return await networkManager.doRequest(`/resetPassword`, {email: email}, "POST");
    }

    // reset via email
    async validateToken(token) {
        return await networkManager.doRequest(`/validateToken`, {token: token}, "POST");
    }

    async game(gameId) {
        return await networkManager
            .doRequest(`/gameInfo`, {id_game: gameId}, "POST");
    }

    async getUsers() {
        return await networkManager
            .doRequest('/users', null, "GET")
    }

    async deleteUser(userId) {
        return await networkManager
            .doRequest('/deleteUser', {id: userId}, "POST")
     }
    async editRole(userId, roleNumber) {
        return await networkManager
            .doRequest('/editRole', {right: roleNumber, id: userId}, "POST")
    }
}
