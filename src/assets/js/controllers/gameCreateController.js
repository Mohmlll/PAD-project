let gameId;

class GameCreateController {

    constructor() {
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
        this.intDropDownData = this.dropDownData.length;

        for (let i = 0; i < this.intDropDownData; i++) {
            let optionMin = $('<option class="audienceMin"></option>').attr("value", "option value");
            let optionMax = $('<option class="audienceMax"></option>').attr("value", "option value");
            optionMin.text(this.dropDownData[i]["audience"])
            optionMax.text(this.dropDownData[i]["audience"])
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
            let option = $('<option class="gameType"></option>').attr("value", "option value");
            option.text(this.dropDownDataGameType[i]["type"])
            option.appendTo("#gametype");
        }


    }

    async onAddGame() {
        let name = $('input[name=name]', this.gameView).val();
        let description = $('input[name=description]', this.gameView).val();
        let rules = $('input[name=rules]', this.gameView).val();
        let difEasy = $('input[name=dif-easy]', this.gameView).val();
        let difHard = $('input[name=dif-hard]', this.gameView).val();
        let amountStudents = $('input[name=amount-students]', this.gameView).val();
        let sampleFile = $('input[name=sampleFile]', this.gameView).val();
        let type = $("#gametype option:selected").text();
        let audienceMin = $("#target-audience-min option:selected").text();
        let audienceMax = $("#target-audience-max option:selected").text();
        await $.ajax({
            url: baseUrl + "/game",
            data: JSON.stringify({
                name: name,
                description: description,
                rules: rules,
                difEasy: difEasy,
                difHard: difHard,
                amountStudents: amountStudents,
                sampleFile: sampleFile,
                type: type,
                audienceMin: audienceMin,
                audienceMax: audienceMax,
            }),
            contentType: "application/json",
            method: "POST"
        });
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
        let materialTemplate = await $.get("views/materialTemplate.html")

        // loop trough available materials
        for (let i = 0; i < this.result.length; i++) {
            const resultUsable = this.result[i];

            let material_id = resultUsable["id"]
            let material = resultUsable["material"]

            let materialTemplateUsable = $(materialTemplate);

            materialTemplateUsable.find(".labelMaterials").text(material);
            materialTemplateUsable.find("#noOfRoom").attr("id", "noOfRoom" + material_id);
            materialTemplateUsable.find("#adds").attr("id", "adds" + material_id);
            materialTemplateUsable.find("#subs").attr("id", "subs" + material_id);
            materialTemplateUsable.appendTo("#materialview");

        }

    }


    add() {
        for (let i = 1; i <= this.intResult; i++) {
            $('#adds' + i, this.gameView).on("click", (e) => {
                let curr = $('#adds' + i).prev().val();
                if (curr > 0) {
                    $('#subs' + i).removeAttr('disabled');
                }
                if (curr >= 98) {
                    $('#adds' + i).attr('disabled', 'disabled');
                }
                $('#adds' + i).prev().val(Number(curr) + 1);
            });
        }
    }

    remove() {
        for (let i = 1; i <= this.intResult; i++) {
            $('#subs' + i, this.gameView).on("click", (e) => {
                let curr = $('#subs' + i).next().val();
                if (curr <= 0) {
                    $('#subs' + i).attr('disabled', 'disabled');
                } else {
                    $('#subs' + i).next().val(Number(curr) - 1);
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
            gameId = this.game;
        }, 4000);

    }

    async saveMaterials() {
        let material;
        let amount;

        for (let i = 1; i <= this.intResult; i++) {
            material = i;
            amount = Number($('#subs' + i).next().val());

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
            window.location.href = "index.html#game";
            location.reload();
        }, 1000);
    }


    //Called when the home.html has been loaded
    async setup(data) {

        //Load the welcome-content into memory
        this.gameView = $(data);

        await this.onGetGame()

        $('#game', this.gameView).on("submit", (e) => {
            e.preventDefault()
            this.onAddGame();
            this.saveMaterials();
            this.redirectToGames();
        })


        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(this.gameView);
        await this.getDropDownDataAudience();
        await this.getDropDownDataGameType();
        await this.onGetMaterial();
        this.add()
        this.remove()
    }

    //Called when the game.html fails to load
    error() {
        $(".content").html("Failed to load content!");
    }
}
