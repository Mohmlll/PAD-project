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
        this.games = result;
        this.materials = await $.ajax({
            url: baseUrl + "/displaymaterials",
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
        for (let j = 0; j < this.materials.length; j++) {
            let gameId = this.materials[j]["game_id_game"];
            $(".materials" + gameId).append("Soort: " + this.materials[j]["material"] + ", Aantal: " + this.materials[j]["amount"] + "\n\n\n\n\n")
        }

    }

    navigateTo(gameId) {
        let url = window.location.href;
        app.loadController(CONTROLLER_GAME_INFO);
        location.replace(url + gameId);
    }


    async getDropDownDataGameTypeFilter() {
        // get data
        this.dropDownDataGameTypeFilter = await $.ajax({
            url: baseUrl + "/gametype",
            contentType: "application/json",
            method: "get"
        });

        this.intDropDownDataGameTypeFilter = this.dropDownDataGameTypeFilter.length;

        // for (let i = 0; i < this.intDropDownDataGameTypeFilter; i++) {
        //     let a = $('<a class="gametypeFilterGames"></a>').attr("value", this.dropDownDataGameTypeFilter[i]["type"]);
        //     a.text(this.dropDownDataGameTypeFilter[i]["type"])
        //     a.appendTo("#gameTypeFilter");
        // }
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
        this.intDropDownDataGameAudienceFilter = this.dropDownDataGameAudienceFilter.length;

        // for (let i = 0; i < this.intDropDownDataGameAudienceFilter; i++) {
        //     let a = $('<a class="gameAudienceFilterGamesMin"></a>').attr("value", this.dropDownDataGameAudienceFilter[i]["audience"]);
        //     let b = $('<a class="gameAudienceFilterGamesMax"></a>').attr("value", this.dropDownDataGameAudienceFilter[i]["audience"]);
        //     a.text(this.dropDownDataGameAudienceFilter[i]["audience"])
        //     b.text(this.dropDownDataGameAudienceFilter[i]["audience"])
        //     a.appendTo("#gameAudienceFilterMin");
        //     b.appendTo("#gameAudienceFilterMax");
        //
        // }
        for (let i = 0; i < this.intDropDownDataGameAudienceFilter; i++) {
            $('#game-target-audience-min').append(`<option value="${this.dropDownDataGameAudienceFilter[i]["audience"]}">
            ${this.dropDownDataGameAudienceFilter[i]["audience"]}</option>`)
            $('#game-target-audience-max').append(`<option value="${this.dropDownDataGameAudienceFilter[i]["audience"]}">
            ${this.dropDownDataGameAudienceFilter[i]["audience"]}</option>`)
        }
    }
    async getDropDownGameMaterialFilter(){
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

    filterToggleType() {
        $(".filter-options").toggleClass("show", "show");
    }

    dropdownToggleType() {
        $("#gameTypeFilter").toggleClass("show", "show");
    }

    dropdownToggleAudienceMin() {
        $("#gameAudienceFilterMin").toggleClass("show", "show");
    }

    dropdownToggleAudienceMax() {
        $("#gameAudienceFilterMax").toggleClass("show", "show");
    }

    filter() {
        for (let j = 0; j < this.games.length; j++) {
            let input, filter, a, i, game, txtValue,
                gametype, gameId;

            input = $('#inputFilter').val();

            filter = input.toLowerCase();

            gameId = this.games[j]["id_game"];
            game = $('#g' + gameId);

            a = $('#gameTypeFilter a');

            gametype = game.find('.type').text().toLowerCase()

            for (i = 0; i < a.length; i++) {
                txtValue = a[i].textContent || a[i].innerText;
                if (txtValue.toLowerCase().indexOf(filter) > -1) {
                    a[i].style.display = "";
                } else {
                    a[i].style.display = "none";
                }
                if (gametype.indexOf(filter) > -1) {
                    game.show();
                } else {
                    game.hide();
                }

            }
        }
    }

    filter2() {
        for (let j = 0; j < this.games.length; j++) {
            let input2, filter2, a2, i, game, txtValue2,
                gameId, gameAudienceMin;
            input2 = $('#inputFilter2').val();
            filter2 = input2.toLowerCase();

            gameId = this.games[j]["id_game"];
            game = $('#g' + gameId);

            a2 = $('#gameAudienceFilterMin a');

            gameAudienceMin = game.find('.target_audience_min').text().toLowerCase()

            for (i = 0; i < a2.length; i++) {
                txtValue2 = a2[i].textContent || a2[i].innerText;
                if (txtValue2.toLowerCase().indexOf(filter2) > -1) {
                    a2[i].style.display = "";
                } else {
                    a2[i].style.display = "none";
                }
                if (gameAudienceMin.indexOf(filter2) > -1) {
                    game.show();
                } else {
                    game.hide();
                }
            }
        }
    }

    filter3() {
        for (let j = 0; j < this.games.length; j++) {
            let input3, filter3, a3, i, game, txtValue3,
                gameId, gameAudienceMax;

            input3 = $('#inputFilter3').val();

            filter3 = input3.toLowerCase();

            gameId = this.games[j]["id_game"];
            game = $('#g' + gameId);

            a3 = $('#gameAudienceFilterMax a');

            gameAudienceMax = game.find('.target_audience_max').text().toLowerCase()

            for (i = 0; i < a3.length; i++) {
                txtValue3 = a3[i].textContent || a3[i].innerText;
                if (txtValue3.toLowerCase().indexOf(filter3) > -1) {
                    a3[i].style.display = "";
                } else {
                    a3[i].style.display = "none";
                }
                if (gameAudienceMax.indexOf(filter3) > -1) {
                    game.show();
                } else {
                    game.hide();
                }
            }
        }
    }


    //Called when the home.html has been loaded
    async setup(data) {
        //Load the welcome-content into memory
        this.gameView = $(data);


        $("#filter-button", this.gameView).on("click", () => {
            this.filterToggleType()
        });

        $('#inputFilter', this.gameView).on("keyup", () => {
            this.filter()
        })
        $('#inputFilter2', this.gameView).on("keyup", () => {
            this.filter2()
        })
        $('#inputFilter3', this.gameView).on("keyup", () => {
            this.filter3()
        })
        $('.gameTypeFilterDropButton', this.gameView).on("click", () => {
            this.dropdownToggleType()
        })
        $('.gameAudienceFilterDropButtonMin', this.gameView).on("click", () => {
            this.dropdownToggleAudienceMin()
        })
        $('.gameAudienceFilterDropButtonMax', this.gameView).on("click", () => {
            this.dropdownToggleAudienceMax()
        })

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(this.gameView);
        await this.getDropDownDataGameTypeFilter()
        await this.getDropDownDataGameAudienceFilter()
        await this.getDropDownGameMaterialFilter()
        await this.onGetGame();

    }

    //Called when the game.html fails to load
    error() {
        $(".content").html("Failed to load content!");
    }
}
