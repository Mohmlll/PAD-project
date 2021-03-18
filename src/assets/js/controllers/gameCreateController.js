class GameCreateController {
    constructor() {
        $.get("views/gameCreate.html")
            .then((data) => this.setup(data))
            .catch(() => this.error());
    }

    async onAddGame() {
        let name = $('input[name=name]', this.gameView).val();
        let description = $('input[name=description]', this.gameView).val();
        let materials = $('input[name=materials]', this.gameView).val();
        let rules = $('input[name=rules]', this.gameView).val();
        let difEasy = $('input[name=dif-easy]', this.gameView).val();
        let difHard = $('input[name=dif-hard]', this.gameView).val();
        let targetAudience = $('input[name=target-audience]', this.gameView).val();
        let gameType = $('input[name=game-type]', this.gameView).val();
        let amountStudents = $('input[name=amount-students]', this.gameView).val();
        let sampleFile = $('input[name=sampleFile]', this.gameView).val();

        await $.ajax({
            url: baseUrl + "/game",
            data: JSON.stringify({
                name: name,
                description: description,
                materials: materials,
                rules: rules,
                difEasy: difEasy,
                difHard: difHard,
                targetAudience: targetAudience,
                gameType: gameType,
                amountStudents: amountStudents,
                sampleFile: sampleFile,
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

        // loop trough available games
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


    //Called when the home.html has been loaded
    async setup(data) {

        //Load the welcome-content into memory
        this.gameView = $(data);

        $('#game', this.gameView).on("submit", (e) => {
            e.preventDefault();
            this.onAddGame();

        })

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(this.gameView);

        await this.onGetMaterial();

        this.add()
        this.remove()
    }

    //Called when the game.html fails to load
    error() {
        $(".content").html("Failed to load content!");
    }
}
