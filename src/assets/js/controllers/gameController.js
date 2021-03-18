class GameController {
    constructor() {
        $.get("views/game.html")
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

        // get template
        let gameTemplate = await $.get("views/templateGame.html")

        // loop trough available games
        for (let i = 0; i < result.length; i++) {
            const row = result[i];

            let gameId = row["id_game"];
            let name = row["name"];
            let description = row["description"];
            let target_audience = row["target_audience"];
            let type = row["type"];
            let amount_players = row["amount_players"];
            let rules = row["rules"];
            let differentiates_easy = row["differentiates_easy"];
            let differentiates_hard = row["differentiates_hard"];
            // let game_image = row["image_url"];

            let gameRowTemplate = $(gameTemplate);
            gameRowTemplate.find(".name").text(name);
            gameRowTemplate.find(".description").text(description);
            gameRowTemplate.find(".target_audience").text(target_audience);
            gameRowTemplate.find(".type").text(type);
            gameRowTemplate.find(".amount_players").text(amount_players);
            gameRowTemplate.find(".rules").text(rules);
            gameRowTemplate.find(".differentiates_easy").text(differentiates_easy);
            gameRowTemplate.find(".differentiates_hard").text(differentiates_hard);
            // gameRowTemplate.find(".game_image").attr("src", "../uploads/" + gameId + ".png");
            gameRowTemplate.find(".game_image").attr("src", "../assets/img/template/blank.jpg");
            gameRowTemplate.find(".collapse").removeClass("collapseSummary").addClass("collapseSummary" + gameId);
            gameRowTemplate.find("a[href='.collapseSummary']").attr('href', '.collapseSummary' + gameId);
            gameRowTemplate.appendTo("#gameview");
        }

    }



    //Called when the home.html has been loaded
    setup(data) {
        //Load the welcome-content into memory
        this.gameView = $(data);

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(this.gameView);

        this.onGetGame();
    }

    //Called when the game.html fails to load
    error() {
        $(".content").html("Failed to load content!");
    }
}
