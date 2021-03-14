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
                sampleFile: sampleFile
            }),
            contentType: "application/json",
            method: "POST"
        });
    }


    //Called when the home.html has been loaded
    setup(data) {
        //Load the welcome-content into memory
        this.gameView = $(data);

        $('#game', this.gameView).on("submit", (e) => {
            e.preventDefault();
            this.onAddGame();
        })

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(this.gameView);
    }

    //Called when the game.html fails to load
    error() {
        $(".content").html("Failed to load content!");
    }
}
