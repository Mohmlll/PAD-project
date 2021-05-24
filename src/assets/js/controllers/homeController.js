/**
 * Responsible for handling the actions happening on home view
 *
 * @author Lennard Fonteijn & Pim Meijer
 */

class HomeController {
    constructor() {
        this.userRepository = new UserRepository();

        $.get("views/home.html")
            .done((data) => this.setup(data))
            .fail(() => this.error());
    }

    async onGetGame() {

        // get data
        let newGames;
        let ratingGames;
        let clickGames;
        let favGames;
        let userId = sessionManager.get("id");

        try {
            newGames = await this.userRepository.newGameListLimit3()
            ratingGames = await this.userRepository.ratingGameListLimit3()
            clickGames = await this.userRepository.clickGameListLimit3()
            favGames = await this.userRepository.favGameListLimit3(userId)
        } catch (e) {
            if (e.code === 401) {
                this.welcomeView
                    .find(".error")
                    .html(e.reason);
            } else {
                console.log(e);
            }
        }

        // get template
        let newGamesTemplate = await $.get("views/templateGame.html");
        let ratingGamesTemplate = await $.get("views/templateGame.html");
        let clickGamesTemplate = await $.get("views/templateGame.html");
        let favGamesTemplate = await $.get("views/templateGame.html");

        // loop trough available newGames
        for (let i = 0; i < newGames.length; i++) {
            const row = newGames[i];
            let gameId = row["id_game"];
            let name = row["name"];

            let newGamesRow = $(newGamesTemplate);

            newGamesRow.find(".game-name").text(name);
            newGamesRow.attr("id", "g" + String(gameId))

            newGamesRow.on("click", async () => {
                let userId = sessionManager.get("id");
                let click = true;
                await this.click(userId, gameId, click)
                this.navigateTo(gameId);
            })
            newGamesRow.appendTo(".newGameListLimit3");
        }
        // loop trough available ratingGames
        for (let i = 0; i < ratingGames.length; i++) {
            const row = ratingGames[i];
            let gameId = row["id_game"];
            let name = row["name"];

            let ratingGamesRow = $(ratingGamesTemplate);
            ratingGamesRow.find(".game-name").text(name);
            ratingGamesRow.attr("id", "g" + String(gameId))


            ratingGamesRow.on("click", async () => {
                let userId = sessionManager.get("id");
                let click = true;
                await this.click(userId, gameId, click)
                this.navigateTo(gameId);
            })
            ratingGamesRow.find(".game-name").text(name);
            ratingGamesRow.attr("id", "g" + String(gameId))
            ratingGamesRow.appendTo(".ratingGameListLimit3");
        }
        // loop trough available clickGames
        for (let i = 0; i < clickGames.length; i++) {
            const row = clickGames[i];
            let gameId = row["id_game"];
            let name = row["name"];

            let clickGamesRow = $(clickGamesTemplate);
            clickGamesRow.find(".game-name").text(name);
            clickGamesRow.attr("id", "g" + String(gameId))


            clickGamesRow.on("click", async () => {
                let userId = sessionManager.get("id");
                let click = true;
                await this.click(userId, gameId, click)
                this.navigateTo(gameId);
            })
            clickGamesRow.find(".game-name").text(name);
            clickGamesRow.attr("id", "g" + String(gameId))
            clickGamesRow.appendTo(".clickGameListLimit3");
        }
        // loop trough available favGames
        for (let i = 0; i < favGames.length; i++) {
            const row = favGames[i];
            let gameId = row["id_game"];
            let name = row["name"];

            let favGamesRow = $(favGamesTemplate);
            favGamesRow.find(".game-name").text(name);
            favGamesRow.attr("id", "g" + String(gameId))


            favGamesRow.on("click", async () => {
                let userId = sessionManager.get("id");
                let click = true;
                await this.click(userId, gameId, click)
                this.navigateTo(gameId);
            })
            favGamesRow.find(".game-name").text(name);
            favGamesRow.attr("id", "g" + String(gameId))
            favGamesRow.appendTo(".favGameListLimit3");
        }
    }

    async click(userId, gameId, click) {
        let hasClick
        try {
            let clickCheck = await this.userRepository.clickCheck(userId, gameId)
            hasClick = clickCheck.data.length !== 0;
        } catch (e) {
            if (e.code === 401) {
                this.gameView
                    .find(".error")
                    .html(e.reason);
            } else {
                console.log(e);
            }
        }
        if (!hasClick) {
            await this.userRepository.click(userId, gameId, click)
        }

    }

    navigateTo(gameId) {
        let url = window.location.href;
        let replacedUrl = url.replace("home", "game")
        app.loadController(CONTROLLER_GAME_INFO);
        location.replace(replacedUrl + gameId);
    }


    //Called when the home.html has been loaded
    async setup(data) {

        //Load the welcome-content into memory
        this.welcomeView = $(data);
        this.welcomeView.find("[data-controller]").on("click", NavbarController.handleClickMenuItem);
        $("#gamesButton", this.welcomeView).on("click", (e) => {
            app.loadController(CONTROLLER_GAME);
        });

        $("#registerButton", this.welcomeView).on("click", (e) => {
            app.loadController(CONTROLLER_REGISTER);
        });

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(this.welcomeView);
        await this.onGetGame()
        // listen for redirects
        templateManager.listen();
    }

    //Called when the home.html fails to load
    error() {
        $(".content").html("Failed to load content!");
    }
}
