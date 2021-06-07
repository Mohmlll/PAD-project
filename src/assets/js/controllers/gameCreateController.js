let gameId;

class GameCreateController {

    constructor() {
        this.statRepository = new StatRepository();
        this.gameRepository = new GameRepository();
        $.get("views/gameCreate.html")
            .then((data) => this.setup(data))
            .catch(() => this.error());

    }

    async getDropDownDataAudience() {
        // get data
        this.dropDownData = await $.ajax({
            url: baseUrl + "/audience",
            contentType: "application/json",
            method: "get"
        });
        for (let i = 0; i < this.dropDownData.length; i++) {
            let optionMinS;

            if (this.dropDownData[i]["audience"] === 0) {
                optionMinS = "Alle jaarlagen";
            } else {
                optionMinS = "Groep " + this.dropDownData[i]["audience"];
            }

            let optionMin = $('<option class="audienceMin"></option>').attr("value", this.dropDownData[i]["audience"]);
            let optionMax = $('<option class="audienceMax"></option>').attr("value", this.dropDownData[i]["audience"]);

            optionMin.text(optionMinS);
            optionMax.text(optionMinS);
            optionMin.appendTo("#target-audience-min");
            optionMax.appendTo("#target-audience-max");
        }
    }

    async getDropDownDataGameType() {
        // get data
        this.dropDownDataGameType = await $.ajax({
            url: baseUrl + "/gametype",
            contentType: "application/json",
            method: "get"
        });

        this.intDropDownDataGameType = this.dropDownDataGameType.length;

        for (let i = 0; i < this.intDropDownDataGameType; i++) {
            let option = $("<option></option>");
            option.text(this.dropDownDataGameType[i]["type"])
            option.val(this.dropDownDataGameType[i]["type"])
            option.appendTo("#game_type");
        }
    }

    async onAddGame() {

        let form = $('#game-form')[0]; // You need to use standard javascript object here
        let formData = new FormData(form);
        let isValidInput = this.validateGameData(form)

        if (isValidInput) {
            await $.ajax({
                url: baseUrl + "/game",
                data: formData,
                contentType: false,
                processData: false,
                method: "POST"
            });
            await this.saveMaterials();
            await this.redirectToGames();
        }
    }

    validateGameData(form) {
        form = $(form)
        let inputs
        let errorCount = 0;

        form.each(function () {
            inputs = $(this).find(':input') //<-- Should return all input elements in that specific form.

            for (const input of inputs) {
                const elem = $(input);
                if (!elem.is(":valid") || elem.val() == "") {
                    elem.removeClass('input-success');
                    elem.addClass('input-error');
                    errorCount++;
                } else {
                    elem.removeClass('input-error');
                    elem.addClass('input-success');
                }
            }
        });

        return errorCount === 0;
    }

    async onGetMaterial() {
        // get data
        this.result = await $.ajax({
            url: baseUrl + "/material",
            contentType: "application/json",
            method: "get"
        });
        this.intResult = this.result.length;

        // get template
        let materialTemplate = await $.get("views/materialTemplate.html");

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


    async onGetGame() {

        //this code runs every 4 seconds
        setInterval(async function () {
            this.games = await $.ajax({
                url: baseUrl + "/game",
                contentType: "application/json",
                method: "get"
            });

            for (let i = 0; i < this.games.length; i++) {
                this.game = this.games[i]["id_game"] + 1;
            }
            if (this.games == null) {
                gameId = 0;
            }
            gameId = this.game;
        }, 4000);

    }

    async saveMaterials() {
        let material;
        let amount;

        for (let i = 1; i <= this.intResult; i++) {
            material = i;
            amount = $('#adds' + i).parent().prev().children().val()
            await $.ajax({
                url: baseUrl + "/materials",
                data: JSON.stringify({
                    game: gameId,
                    material: material,
                    amount: amount
                }),
                contentType: "application/json",
                method: "POST"
            });
        }

    }

    redirectToGames() {
        setTimeout(function () {
            app.loadController(CONTROLLER_HOME)
        }, 1000);

    }

    //Called when the home.html has been loaded
    async setup(data) {

        //Load the welcome-content into memory
        this.gameView = $(data);

        await this.onGetGame()

        $('#game', this.gameView).on("click", async (e) => {
            e.preventDefault()

            await this.onAddGame();
        })


        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(this.gameView);
        await this.getDropDownDataAudience();
        await this.getDropDownDataGameType();
        await this.onGetMaterial();
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
