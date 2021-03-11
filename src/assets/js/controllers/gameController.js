class GameController {
    constructor() {
        $.get("views/game.html")
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
        let targetAudience = $('input[target-audience=description]', this.gameView).val();
        let gameType = $('input[name=game-type]', this.gameView).val();
        let amountStudents = $('input[name=amount-students]', this.gameView).val();
        let sampleFile = $('input[name=sampleFile]', this.gameView).val();

        // console.log(email + ", " + password)
        console.log($('input[name=email]', this.gameView))
        console.log(this.gameView)
        //TODO: We shouldn't save a password unencrypted!! Improve this by using cryptoHelper :)

        await $.ajax({
            url: baseUrl + "/games",
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
        console.log(data);
        //Load the welcome-content into memory
        this.gameView = $(data);

        $('#games', this.gameView).on("submit", (e) => {
            e.preventDefault();
            console.log($(this));
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
