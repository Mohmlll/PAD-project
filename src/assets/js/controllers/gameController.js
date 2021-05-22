class GameController {
    constructor() {
        this.userRepository = new UserRepository();

        $.get("views/game.html")
            .then((data) => this.setup(data))
            .catch(() => this.error());
    }

    async onGetGame(games) {
        $("#gameview").empty();
        this.result = await $.ajax({
            url: baseUrl + "/material",
            contentType: "application/json",
            method: "get"
        });
        this.intResult = this.result.length;

        // get data
        this.game = await this.userRepository.getGames();
        // get template
        let materialTemplate = await $.get("views/materialTemplate2.html")
        let gameTemplate = await $.get("views/templateGame.html");
        let gameId, name, gameType;
        // loop trough available materials
        for (let i = 0; i < this.result.length; i++) {
            const resultUsable = this.result[i];

            let material_id = resultUsable["id"]
            let material = resultUsable["material"]

            let materialTemplateUsable = $(materialTemplate);

            materialTemplateUsable.find(".labelMaterials").text(material);
            materialTemplateUsable.find(".material-input").attr("id", "noOfRoom" + material_id);
            materialTemplateUsable.find(".material-plus").attr("id", "adds" + material_id);
            materialTemplateUsable.find(".material-minus").attr("id", "subs" + material_id);
            materialTemplateUsable.appendTo("#materialview2");

        let gameTemplate = await $.get("views/templateGame.html")

        // loop trough available games
        for (let i = 0; i < result.length; i++) {
            const row = result[i];
            let gameId = row["id_game"];
            let name = row["name"];
            let description = row["description"];
            let target_audience_min = row["target_audience_min"];
            let target_audience_max = row["target_audience_max"];
            let type = row["type"];
            let amount_players = row["amount_players"];
            let rules = row["rules"];
            let differentiates_easy = row["differentiates_easy"];
            let differentiates_hard = row["differentiates_hard"];

            // let game_image = row["image_url"];

            let gameRowTemplate = $(gameTemplate);
            gameRowTemplate.find(".game-name").text(name);
            gameRowTemplate.find(".description").text(description);
            gameRowTemplate.find(".target_audience_min").text("Vanaf: " + target_audience_min);
            gameRowTemplate.find(".target_audience_max").text(" T/M: " + target_audience_max);
            gameRowTemplate.find(".type").text(type);
            gameRowTemplate.find(".amount_players").text(amount_players);
            gameRowTemplate.find(".rules").text(rules);
            gameRowTemplate.find(".differentiates_easy").text(differentiates_easy);
            gameRowTemplate.find(".differentiates_hard").text(differentiates_hard);
            gameRowTemplate.find(".materials").addClass("materials" + gameId).removeClass("materials");
            // gameRowTemplate.find(".game_image").attr("src", "../uploads/" + gameId + ".png");
            // gameRowTemplate.find(".game_image").attr("src", "../assets/img/template/blank.jpg");
            gameRowTemplate.find(".collapse").removeClass("collapseSummary").addClass("collapseSummary" + gameId);
            gameRowTemplate.attr("id", "g" + String(gameId))

            gameRowTemplate.on("click", () => {
                this.navigateTo(gameId);
            })
            gameRowTemplate.find("a[href='.collapseSummary']").attr('href', '.collapseSummary' + gameId);
            gameRowTemplate.appendTo("#gameview");
        }

        if (games == null) {
            games = this.game;
            // loop trough available games
            for (let i = 0; i < games.length; i++) {
                const row = games[i];
                gameId = row["id_game"];
                name = row["name"];
                gameType = row["type"];
                this.fillTemplate(gameTemplate, name, gameId);
            }
        } else {
            for (let i = 0; i < games.length; i++) {
                const row = games[i];
                gameId = row.id_game;
                name = row.name;
                gameType = row.type;
                this.fillTemplate(gameTemplate, name, gameId);
            }
        }
    }


    fillTemplate(gameTemplate, name, gameId) {
        let gameRowTemplate = $(gameTemplate);
        gameRowTemplate.find(".game-name").text(name);

        gameRowTemplate.on("click", () => {
            this.navigateTo(gameId);
        })
        gameRowTemplate.find("a[href='.collapseSummary']").attr('href', '.collapseSummary' + gameId);
        gameRowTemplate.appendTo("#gameview");


    }

    navigateTo(gameId) {
        let url = window.location.href;
        app.loadController(CONTROLLER_GAME_INFO);
        // location.replace(url + "game" + gameId);
        location.replace(url + gameId);
    }

    async filter() {
        let gameType, minAudience, maxAudience, amountStudents, filteredTypeGames;
        let game = this.game;
        let allSorts = "Alle soorten";

        amountStudents = $("#student-amount").val();
        gameType = $("#game-type-filter").val();
        minAudience = $("#game-target-audience-min").val();
        maxAudience = $("#game-target-audience-max").val();


        if (gameType === allSorts) {
            filteredTypeGames = game.filter(function (e) {
                return (e["target_audience_min"] >= minAudience) && (e["target_audience_max"] <= maxAudience) && (e["amount_players"] >= amountStudents);

            });
        } else {
            filteredTypeGames = game.filter(function (e) {
                return (e.type === gameType) && (minAudience >= e["target_audience_min"]) && (maxAudience <= e["target_audience_max"]) && (e["amount_players"] >= amountStudents);

            });
        }

        console.log(filteredTypeGames);

        if (filteredTypeGames.length === 0) {
            $('.no-result-alert').show();
        } else {
            $('.no-result-alert').hide();
        }

        await this.onGetGame(filteredTypeGames)
    }


    async getDropDownDataGameTypeFilter() {
        // get data
        this.dropDownDataGameTypeFilter = await $.ajax({
            url: baseUrl + "/gametype",
            contentType: "application/json",
            method: "get"
        });

        this.intDropDownDataGameTypeFilter = this.dropDownDataGameTypeFilter.length;

        for (let i = 0; i < this.intDropDownDataGameTypeFilter; i++) {
            $('#game-type-filter').append(`<option value="${this.dropDownDataGameTypeFilter[i]["type"]}">
            ${this.dropDownDataGameTypeFilter[i]["type"]} </option>`)
        }

    }

    async getDropDownDataGameAudienceFilter() {
        // get data
        this.dropDownDataGameAudienceFilter = await $.ajax({
            url: baseUrl + "/audience",
            contentType: "application/json",
            method: "get"
        });
        let optionMinS
        for (let i = 0; i < this.dropDownDataGameAudienceFilter.length; i++) {
            if (this.dropDownDataGameAudienceFilter[i]["audience"] === 0) {
                optionMinS = "Alle jaarlagen";
            } else {
                optionMinS = "Groep " + this.dropDownDataGameAudienceFilter[i]["audience"];
            }

            let optionMin = $('<option class="audienceMin"></option>').attr("value", this.dropDownDataGameAudienceFilter[i]["audience"]);
            let optionMax = $('<option class="audienceMax"></option>').attr("value", this.dropDownDataGameAudienceFilter[i]["audience"]);

            optionMin.text(optionMinS);
            optionMax.text(optionMinS);
            optionMin.appendTo("#game-target-audience-min");
            optionMax.appendTo("#game-target-audience-max");
        }
    }

    async getDropDownGameMaterialFilter() {
        // get data
        this.dropDownDataGameMaterialFilter = await $.ajax({
            url: baseUrl + "/material",
            contentType: "application/json",
            method: "get"
        });
        this.intDropDownDataGameMaterialFilter = this.dropDownDataGameMaterialFilter.length;
        for (let i = 0; i < this.intDropDownDataGameMaterialFilter; i++) {
            $('#game-material-filter').append(`<option value="${this.dropDownDataGameMaterialFilter[i]["material"]}">
            ${this.dropDownDataGameMaterialFilter[i]["material"]}</option>`)
        }
    }

    add() {
        for (let i = 1; i <= this.intResult; i++) {
            $('#adds' + i, this.gameView).on("click", (e) => {
                $('#adds' + i).parent().prev().children().val()
                let curr = $('#adds' + i).parent().prev().children().val()
                if (curr > 0) {
                    $('#subs' + i).removeAttr('disabled');
                }
                if (curr >= 98) {
                    $('#adds' + i).attr('disabled', 'disabled');
                }
                $('#adds' + i).parent().prev().children().val(Number(curr) + 1)
            });
        }
    }

    remove() {
        for (let i = 1; i <= this.intResult; i++) {
            $('#subs' + i, this.gameView).on("click", (e) => {
                let curr = $('#subs' + i).parent().next().children().val();
                if (curr <= 0) {
                    $('#subs' + i).attr('disabled', 'disabled');
                } else {
                    $('#subs' + i).parent().next().children().val(Number(curr) - 1);
                }
                if (curr <= 99) {
                    $('#adds' + i).removeAttr('disabled');
                }
            });
        }
    }

    //Called when the home.html has been loaded
    async setup(data) {
        //Load the welcome-content into memory
        this.gameView = $(data);


        $("#filter-button", this.gameView).on("click", () => {
            this.filter()
        });
        $("#student-amount", this.gameView).on("input", () => {
            const slider = document.getElementById("student-amount");
            const output = document.getElementById("student-amount-value");
            output.innerHTML = slider.value; // Display the default slider value


            slider.oninput = function () {
                output.innerHTML = this.value;
            }
        });

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(this.gameView);
        await this.getDropDownDataGameTypeFilter()
        await this.getDropDownDataGameAudienceFilter()
        await this.getDropDownGameMaterialFilter()
        await this.onGetGame();
        this.add()
        this.remove()

        // listen for redirects
        templateManager.listen();
    }

    //Called when the game.html fails to load
    error() {
        $(".content").html("Failed to load content!");
    }
}
