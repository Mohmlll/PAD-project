/**
 * Repository responsible for all user data from server - CRUD
 * Make sure all functions are using the async keyword when interacting with network!
 *
 * @author team-6
 */
class GameRepository {

    constructor() {
        this.route = "/game"
    }

    async game(gameId) {
        return await networkManager
            .doRequest(`/gameInfo`, {id_game: gameId}, "POST");
    }

    async materials(gameId) {
        return await networkManager
            .doRequest(`/gameInfoMaterials`, {game_id_game: gameId}, "POST");
    }

    async allMaterials(){
        return await networkManager
            .doRequest('/getAllInfoMaterials', null, "GET")
    }

    async materialType() {
        return await networkManager
            .doRequest('/material', null, "GET")
    }


    async update(id, values = {}) {

    }

    async getGames() {
        return await networkManager
            .doRequest('/game', null, "GET")
    }

    async newGameListLimit3() {
        return await networkManager
            .doRequest('/newGameListLimit3', null, "GET")
    }

    async clickGameListLimit3() {
        return await networkManager
            .doRequest('/clickGameListLimit3', null, "GET")
    }

    async ratingGameListLimit3() {
        return await networkManager
            .doRequest('/ratingGameListLimit3', null, "GET")
    }

    async favGameListLimit3(userId) {
        return await networkManager
            .doRequest('/favGameListLimit3', {id_user: userId}, "POST")
    }

}