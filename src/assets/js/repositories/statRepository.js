class StatRepository {

    //clicks
    async clickCheck(userId, gameId) {
        return await networkManager
            .doRequest('/clickCheck', {id_user: userId, id_game: gameId}, "POST")
    }

    async clicksGet(gameId) {
        return await networkManager
            .doRequest('/clicks', {id_game: gameId}, "POST")
    }

    async click(userId, gameId, click) {
        return await networkManager
            .doRequest('/click', {id_user: userId, id_game: gameId, click: click}, "POST")
    }

    //favourites
    async fav(userId, gameId) {
        return await networkManager
            .doRequest('/fav', {id_user: userId, id_game: gameId}, "POST")
    }

    async favCheck(userId, gameId) {
        return await networkManager
            .doRequest('/favCheck', {id_user: userId, id_game: gameId}, "POST")
    }

    async favDelete(userId, gameId) {
        return await networkManager
            .doRequest('/favDelete', {id_user: userId, id_game: gameId}, "POST")
    }

    //ratings
    async rating(userId, gameId, rating) {
        return await networkManager
            .doRequest('/rating', {id_user: userId, id_game: gameId, rating: rating, }, "POST")
    }

    async getRating(userId, gameId) {
        return await networkManager
            .doRequest('/getRating', {id_user: userId, id_game: gameId}, "POST")
    }

    async getAvgRatingForSpecifiedGame(gameId) {
        return await networkManager
            .doRequest('/ratings', {id_game: gameId}, "POST")
    }

}