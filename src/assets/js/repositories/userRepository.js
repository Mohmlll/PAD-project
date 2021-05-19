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

    async game(gameId) {
        return await networkManager
            .doRequest(`/gameInfo`, {id_game: gameId}, "POST");
    }

    async materials(gameId) {
        return await networkManager
            .doRequest(`/gameInfoMaterials`, {game_id_game: gameId}, "POST");
    }

    async materialType() {
        return await networkManager
            .doRequest('/material', null, "GET")
    }

    async newGameListLimit3() {
        return await networkManager
            .doRequest('/newGameListLimit3', null, "GET")
    }

    async rating(userId, gameId, rating) {
        return await networkManager
            .doRequest('/rating', {id_user: userId, id_game: gameId, rating: rating}, "POST")
    }

    async getSpecificRatingForEachUser(rating, userId, gameId) {
        return await networkManager
            .doRequest('/ratingUpdate', {rating: parseInt(rating), id_user: userId, id_game: gameId}, "POST")
    }
    async ratingCheck(userId, gameId) {
        return await networkManager
            .doRequest('/ratingCheck', {id_user: userId, id_game: gameId}, "POST")
    }

    async getAvgRatingForSpecifiedGame(gameId) {
        return await networkManager
            .doRequest('/ratings', {id_game: gameId}, "POST")
    }

    async update(id, values = {}) {

    }

    async getGames() {
        return await networkManager
            .doRequest('/game', null, "GET")
    }

}