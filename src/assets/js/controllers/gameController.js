class GameController {
    constructor() {
        this.gameRepository = new GameRepository();
        this.statRepository = new StatRepository();
        $.get("views/game.html")
            .then((data) => this.setup(data))
            .catch(() => this.error());
    }

    async onGetGame(games) {
        // get template
        let gameTemplate = await $.get("views/templateGame.html");
        let gameId, name, gameType;
        let gameRows = $();
        let isFav;
        if (games == null) {
            // get data
            this.game = await this.gameRepository.getGames();
            games = this.game;
            // loop trough available games
            for (let i = 0; i < games.length; i++) {
                const row = games[i];
                gameId = row["id_game"];
                name = row["name"];
                gameType = row["type"];
                let avgRating = await this.getAvgRating(gameId) || 0
                isFav = await this.getIsFav(gameId)


                gameRows = gameRows.add(this.fillTemplate(gameTemplate, name, avgRating, isFav, gameId, row));
            }
        } else {
            for (let i = 0; i < games.length; i++) {
                const row = games[i];
                gameId = row.id_game;
                name = row.name;
                gameType = row.type;
                let avgRating = await this.getAvgRating(gameId) || 0
                isFav = await this.getIsFav(gameId)


                gameRows = gameRows.add(this.fillTemplate(gameTemplate, name, avgRating, isFav, gameId, row));
            }
        }


        if (games.length === 0) {
            $('.no-result-alert').show();
            $("#gameview").empty();
        } else {
            $("#gameview").html(gameRows);
            $('.no-result-alert').hide();
        }
    }

    async fillMaterial() {
        // get data
        this.result = await $.ajax({
            url: baseUrl + "/material",
            contentType: "application/json",
            method: "get"
        });
        let materialTemplate = await $.get("views/materialTemplate2.html")
        // loop trough available materials
        for (let i = 0; i < this.result.length; i++) {
            const resultUsable = this.result[i];

            let material_id = resultUsable["id"]
            let material = resultUsable["material"]

            let materialTemplateUsable = $(materialTemplate);

            materialTemplateUsable.find(".labelMaterials").text(material);
            materialTemplateUsable.find(".material-input").attr("id", "noOfRoom" + material_id);
            materialTemplateUsable.find(".material-input").attr("data-id", material_id);

            materialTemplateUsable.find(".material-plus").attr("id", "adds" + material_id);
            materialTemplateUsable.find(".material-minus").attr("id", "subs" + material_id);

            materialTemplateUsable.appendTo("#materialview2");

        }
    }

    async getIsFav(gameId) {
        let userId = sessionManager.get("id");
        let favCall = await this.statRepository.favCheck(userId, gameId)
        return favCall.data.length !== 0;
    }

    fillTemplate(gameTemplate, name, avgRating, isFav, gameId, games) {
        let gameRowTemplate = $(gameTemplate);
        gameRowTemplate.find(".game-name").text(name + " (" + avgRating + "☆)");
        if (isFav){
            gameRowTemplate.find(".game-name").css("background-color", "yellow").css("color", "black")
        }


        gameRowTemplate.find(".game-image").attr('src', 'uploads/' + games['game_icon']);
        gameRowTemplate.on("click", async () => {
            let userId = sessionManager.get("id");
            let click = true;
            await this.click(userId, gameId, click)
            this.navigateTo(gameId);
        })
        gameRowTemplate.find("a[href='.collapseSummary']").attr('href', '.collapseSummary' + gameId);
        return gameRowTemplate;

    }

    async getAvgRating(gameId) {
        let avgRatingCall = await this.statRepository.getAvgRatingForSpecifiedGame(gameId)
        this.avgRating = avgRatingCall.data[0]["average"];
        return avgRatingCall.data[0]["average"];
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
        app.loadController(CONTROLLER_GAME_INFO);
        // location.replace(url + "game" + gameId);
        location.replace(url + gameId);
    }

    async filter() {
        let gameType, minAudience, maxAudience, amountStudents, filteredGames;
        let game = this.game;
        let allSorts = "Alle soorten";

        amountStudents = $("#student-amount").val();
        gameType = $("#game-type-filter").val();
        minAudience = $("#game-target-audience-min").val();
        maxAudience = $("#game-target-audience-max").val();


        if (gameType === allSorts) {
            filteredGames = game.filter(function (e) {
                return (e["target_audience_min"] >= minAudience) && (e["target_audience_max"] <= maxAudience) && (e["amount_players"] >= amountStudents);

            });
        } else {
            filteredGames = game.filter(function (e) {
                return (e.type === gameType) && (e["target_audience_min"] >= minAudience) && (e["target_audience_max"] <= maxAudience) && (e["amount_players"] >= amountStudents);

            });
        }

        filteredGames = await this.filterMaterials(filteredGames);

        if (filteredGames.length === 0) {
            $('.no-result-alert').show();
        } else {
            $('.no-result-alert').hide();
        }

        await this.onGetGame(filteredGames)
    }

    async filterMaterials(games) {
        let materials = await this.gameRepository.allMaterials();
        let materialArray = [];

        $("#materialview2 input").each(function (e) {
            let materialId = $(this).attr("data-id");
            let value = $(this).val();
            materialId = parseInt(materialId);
            value = parseInt(value);

            if (value > 0)
                materialArray.push({id: materialId, value: value});
        });

        console.log(materialArray);

        for (let j = 0; j < materialArray.length; j++) {
            let materialRow = materialArray[j];
            if (materialRow.value < 0) {
                continue;
            }

            for (let i = 0; i < games.length; i++) {
                let gameRow = games[i];
                let gameMaterials = materials.filter(function (e) {
                    return (e.game_id_game === gameRow.id_game) && (materialRow.id === e.material_id);
                });

                if (gameMaterials.length === 0 || materialRow.value < gameMaterials[0].amount) {
                    games.splice(i, 1);
                }

            }
        }
        return games;
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

        for (let i = 0; i < this.dropDownDataGameAudienceFilter.length; i++) {
            let option = "Groep " + this.dropDownDataGameAudienceFilter[i]["audience"];
            let optionMin = $('<option class="audienceMin"></option>').attr("value", this.dropDownDataGameAudienceFilter[i]["audience"]);
            optionMin.text(option);
            optionMin.appendTo("#game-target-audience-min");
        }

        for (let i = this.dropDownDataGameAudienceFilter.length - 1; i >= 0; i--) {
            let option = "Groep " + this.dropDownDataGameAudienceFilter[i]["audience"];
            let optionMax = $('<option class="audienceMax"></option>').attr("value", this.dropDownDataGameAudienceFilter[i]["audience"]);
            optionMax.text(option);
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

    base() {
        let input = $('input[type=number].material-input');
        if (input.val() <    0) {
            input.val("");
        }
    }

    add() {
        for (let i = 1; i <= this.result.length; i++) {
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
        for (let i = 1; i <= this.result.length; i++) {
            $('#subs' + i, this.gameView).on("click", (e) => {
                let curr = $('#subs' + i).parent().next().children().val();
                let input = $('input[type=number].material-input');

                if (curr <= -1) {
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



        $("#open-filter-button", this.gameView).on("click", () => {
            $("#filter-button, .filters").show();
            $("#open-filter-button").hide();
        });

        $("#filter-button", this.gameView).on("click", () => {
            this.filter();

            $("#filter-button, .filters").hide();
            $("#open-filter-button").show();
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
        await this.onGetGame();
        await this.getDropDownGameMaterialFilter()
        await this.fillMaterial();
        this.add()
        this.remove()
        this.base()
        // listen for redirects
        templateManager.listen();
    }

    //Called when the game.html fails to load
    error() {
        $(".content").html("Failed to load content!");
    }
}
