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
        let materialTemplate = await $.get("views/materialTemplate.html")
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
        // gameRowTemplate.find(".game_image").attr("src", "../uploads/" + gameId + ".png");

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
        this.intDropDownDataGameAudienceFilter = this.dropDownDataGameAudienceFilter.length;

        for (let i = 0; i < this.intDropDownDataGameAudienceFilter; i++) {
            $('#game-target-audience-min').append(`<option value="${this.dropDownDataGameAudienceFilter[i]["audience"]}">
            ${this.dropDownDataGameAudienceFilter[i]["audience"]}</option>`)
            $('#game-target-audience-max').append(`<option value="${this.dropDownDataGameAudienceFilter[i]["audience"]}">
            ${this.dropDownDataGameAudienceFilter[i]["audience"]}</option>`)
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
        let gameType, vanafLeerjaar, totLeerjaar;
        let filteredTypeGames;
        let game = this.game;

        gameType = $("#game-type-filter").val();
        if (gameType !== "Alle soorten") {
            filteredTypeGames = game.filter(game => game.type === gameType);
        }else{
            filteredTypeGames = game;
        }

        vanafLeerjaar = $("#game-target-audience-min").val();
        let filteredMinGames = game.filter(game => game["target_audience_min"] === vanafLeerjaar);

        totLeerjaar = $("#game-target-audience-max").val();
        let filteredMaxGames = game.filter(game => game["target_audience_max"] === totLeerjaar);

       let filteredGames = this.findCommonElements3(filteredTypeGames, filteredMinGames);


        console.log(filteredGames);
    }

    findCommonElements3(a1, a2) {
        var a = [], diff = [];

        for (var i = 0; i < a1.length; i++) {
            a[a1[i]] = true;
        }

        for (var i = 0; i < a2.length; i++) {
            if (a[a2[i]]) {
                delete a[a2[i]];
            } else {
                a[a2[i]] = true;
            }
        }

        for (var k in a) {
            diff.push(k);
        }

        return diff;
    }

    filter2() {
        for (let j = 0; j < this.games.length; j++) {
            let input2, filter2, a2, i, game, txtValue2,
                gameId, gameAudienceMin;
            input2 = $('#inputFilter2').val();
            filter2 = input2.toLowerCase();

            gameId = this.game[j]["id_game"];
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
        for (let j = 0; j < this.game.length; j++) {
            let input3, filter3, a3, i, game, txtValue3,
                gameId, gameAudienceMax;

            input3 = $('#inputFilter3').val();

            filter3 = input3.toLowerCase();

            gameId = this.game[j]["id_game"];
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
