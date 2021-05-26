/**
 * Responsible for handling the actions happening on home view
 *
 * @author Lennard Fonteijn & Pim Meijer
 */

class HomeController {
    constructor() {
        this.userRepository = new UserRepository();
        this.statRepository = new StatRepository();
        this.gameRepository = new GameRepository();
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
            newGames = await this.gameRepository.newGameListLimit3()
            ratingGames = await this.gameRepository.ratingGameListLimit3()
            clickGames = await this.gameRepository.clickGameListLimit3()
            favGames = await this.gameRepository.favGameListLimit3(userId)
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
        let gameTemplate = await $.get("views/templateGame.html");

        // loop trough available newGames
        for (const game of newGames) {
            this.fillGameRow(gameTemplate, game).appendTo(".newGameListLimit3");
        }

        // loop trough available ratingGames
        for (const game of ratingGames) {
            this.fillGameRow(gameTemplate, game).appendTo(".ratingGameListLimit3");
        }

        // loop trough available clickGames
        for (const game of clickGames) {
            this.fillGameRow(gameTemplate, game).appendTo(".clickGameListLimit3");
        }

        // loop trough available favGames
        for (const game of favGames) {
            this.fillGameRow(gameTemplate, game).appendTo(".favGameListLimit3");
        }
    }

    fillGameRow(template, game) {
        let gameId = game["id_game"];
        let name = game["name"];

        let copyTemplate = $(template);
        copyTemplate.find(".game-name").text(name);
        copyTemplate.find(".game-image").attr('src', 'uploads/' + game['game_icon']);
        copyTemplate.attr("id", "g" + String(gameId))

        copyTemplate.on("click", async () => {
            let userId = sessionManager.get("id");
            let click = true;
            await this.click(userId, gameId, click)
            this.navigateTo(gameId);
        })

        copyTemplate.find(".game-name").text(name);
        copyTemplate.attr("id", "g" + String(gameId))

        return copyTemplate;
    }


    async click(userId, gameId, click) {
        let hasClick
        try {
            let clickCheck = await this.statRepository.clickCheck(userId, gameId)
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
            await this.statRepository.click(userId, gameId, click)
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



