/**
 * Repository responsible for all user data from server - CRUD
 * Make sure all functions are using the async keyword when interacting with network!
 *
 * @author team-6
 */
class GameRepository {

    constructor() {
        this.route = "/user"
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

    async update(id, values = {}) {

    }
    async getGames(){
        return await networkManager
            .doRequest('/game', null,  "GET")
    }
}