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
        let games;
        try {
            games = await this.userRepository.newGameListLimit3()
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
        let gameTemplate = await $.get("views/templateGame.html")

        // loop trough available games
        for (let i = 0; i < games.length; i++) {
            const row = games[i];
            let gameId = row["id_game"];
            let name = row["name"];
            let gameRowTemplate = $(gameTemplate);
            gameRowTemplate.find(".game-name").text(name);
            gameRowTemplate.attr("id", "g" + String(gameId))

            gameRowTemplate.on("click", () => {
                this.navigateTo(gameId);
            })
            gameRowTemplate.appendTo(".newGameListLimit3");
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