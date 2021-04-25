class GameInfoController {
    constructor() {
        this.userRepository = new UserRepository();
        $.get("views/gameInfo.html")
            .then((data) => this.setup(data))
            .catch(() => this.error());
    }

    async onGetGame() {
        // get data
        let gameId = parseInt(window.location.hash.replace("#game", ""));
        let game;
        let materials;
        let materialData;
        let errorCounter = 0;
        let loopCount = 0;
        let materialStringReplaced;
        try {
            game = await this.userRepository.game(gameId)
        } catch (e) {
            if (e.code === 401) {
                this.gameView
                    .find(".error")
                    .html(e.reason);
            } else {
                console.log(e);
            }
        }

        try {
            materials = await this.userRepository.materials(gameId)
        } catch (e) {
            if (e.code === 401) {
                this.gameView
                    .find(".error")
                    .html(e.reason);
            } else {
                console.log(e);
            }
        }
        try {
            materialData = await this.userRepository.materialType()
        } catch (e) {
            if (e.code === 401) {
                this.gameView
                    .find(".error")
                    .html(e.reason);
            } else {
                console.log(e);
            }
        }

        // get template
        let gameInfoTemplate = await $.get("views/templateGameInfo.html")
        let row = game[0]

        let name = row["name"];
        let description = row["description"];
        let target_audience_min = row["target_audience_min"];
        let target_audience_max = row["target_audience_max"];
        let type = row["type"];

        let gameInfoRowTemplate = $(gameInfoTemplate);

        gameInfoRowTemplate.find(".game-info-name").text(name);
        gameInfoRowTemplate.find(".game-info-description").text(description);
        gameInfoRowTemplate.find(".game-info-target-audience-min").text("‎ " + target_audience_min);
        gameInfoRowTemplate.find(".game-info-target-audience-max").text("‎ " + target_audience_max);
        gameInfoRowTemplate.find(".game-info-type").text("‎ " + type);
        let materialString = "";
        for (let j = 0; j < materials.length; j++) {
            loopCount++
            let materialType = materialData[j]["material"];
            let materialAmount = materials[j]["amount"];

            if (materialAmount !== 0) {
                materialString += materialType + ": " + materialAmount + ",\n";
            } else {
                errorCounter++
            }
            if (errorCounter === materials.length) {
                gameInfoRowTemplate.find(".game-info-materials").text("Geen materialen gevonden.")
            }
            if (loopCount === materials.length) {
                materialStringReplaced = materialString.replace(/,(?=[^,]*$)/, '')
            }
            gameInfoRowTemplate.find(".game-info-materials").append(materialStringReplaced)

        }


        gameInfoRowTemplate.appendTo("#game-info-view");
    }


    //Called when the home.html has been loaded
    async setup(data) {
        //Load the welcome-content into memory
        this.gameView = $(data);

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(this.gameView);

        await this.onGetGame();

        window.onhashchange = function () {
            app.loadController(CONTROLLER_GAME)
            location.reload()
        }
    }

    //Called when the gameInfo.html fails to load
    error() {
        $(".content").html("Failed to load content!");
    }
}
