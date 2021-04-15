class GameInfoController {
    constructor() {
        $.get("views/gameInfo.html")
            .then((data) => this.setup(data))
            .catch(() => this.error());
    }

    async onGetGame() {
        // get data
        const result = await $.ajax({
            url: baseUrl + "/game",
            contentType: "application/json",
            method: "get"
        });
        this.games = result;
        this.materials = await $.ajax({
            url: baseUrl + "/displaymaterials",
            contentType: "application/json",
            method: "get"
        });

        // get template
        let gameInfoTemplate = await $.get("views/templateGameInfo.html")
        // loop trough available games
        for (let i = 0; i < result.length; i++) {
            const row = result[i];
            let gameId = row["id_game"];
            let name = row["name"];
            let description = row["description"];
            let target_audience_min = row["target_audience_min"];
            let target_audience_max = row["target_audience_max"];
            let type = row["type"];

            let gameInfoRowTemplate = $(gameInfoTemplate);

            gameInfoRowTemplate.find(".game-info-name").text(name);
            gameInfoRowTemplate.find(".game-info-description").text(description);
            gameInfoRowTemplate.find(".game-info-target-audience-min").text("Vanaf: " + target_audience_min);
            gameInfoRowTemplate.find(".game-info-target-audience-max").text(" T/M: " + target_audience_max);
            gameInfoRowTemplate.find(".game-info-type").text(type);
            gameInfoRowTemplate.find(".game-info-materials").addClass("materials" + gameId).removeClass("materials");

            gameInfoRowTemplate.appendTo("#game-info-view");

        }
        for (let j = 0; j < this.materials.length; j++) {
            let gameId = this.materials[j]["game_id_game"];
            $(".game-info-materials" + gameId).append("Soort: " + this.materials[j]["material"] + ", Aantal: " + this.materials[j]["amount"] + "\n\n\n\n\n")
        }


    }

    //Called when the home.html has been loaded
    async setup(data) {
        //Load the welcome-content into memory
        this.gameView = $(data);

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(this.gameView);

        this.onGetGame();
    }

    //Called when the gameInfo.html fails to load
    error() {
        $(".content").html("Failed to load content!");
    }
}
