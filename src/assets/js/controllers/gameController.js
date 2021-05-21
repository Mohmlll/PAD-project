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
            materialTemplateUsable.appendTo("#materialview");

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
        for (let i = 0; i <  this.dropDownDataGameAudienceFilter.length; i++) {
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

    async filter() {
        let gameType, minLeerjaar, maxLeerjaar;
        let filteredTypeGames;
        let game = this.game;

        gameType = $("#game-type-filter").val();
        minLeerjaar = $("#game-target-audience-min").val();
        maxLeerjaar = $("#game-target-audience-max").val();

        filteredTypeGames = game.filter(function (e) {
            return (e.type === gameType) && (e["target_audience_min"] >= minLeerjaar) && (e["target_audience_max"] <= maxLeerjaar);

        });
        console.log(filteredTypeGames);
        await this.onGetGame(filteredTypeGames)
    }


    //Called when the home.html has been loaded
    async setup(data) {
        //Load the welcome-content into memory
        this.gameView = $(data);

        $('#search-filter', this.gameView).on("keyup", async (e) => {
            const searchString = e.target.value.toLowerCase();

            const filteredGames = this.game.filter((game) => {
                return (
                    game.name.toLowerCase().includes(searchString)
                );
            });
            console.log(filteredGames);
            await this.onGetGame(filteredGames);
            if (filteredGames.length === 0) {
                $('.no-result-alert').show();
            } else {
                $('.no-result-alert').hide();
            }

        });

        $("#filter-button", this.gameView).on("click", () => {
            this.filter()
        });

        $('#inputFilter', this.gameView).on("keyup", () => {
            this.filter()
        })

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
