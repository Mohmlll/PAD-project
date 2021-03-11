class GameController2 {
    constructor() {
        $.get("views/register.html")
            .then((data) => this.setup(data))
            .catch(() => this.error());
    }
    // constructor() {
    //     Promise.all([
    //         $.get("views/game.html"),
    //         $.get("views/gameList.html"),
    //         $.get("views/addGame.html"),
    //         $.get(baseUrl + "/games")
    //     ]).then(data => {
    //         this.setup(...data);
    //     }).catch(err => {
    //         console.error(err);
    //         this.error();
    //     });
    // }

    navigateToGame(id) {
        $.get(baseUrl + "/games/" + id).then(r => {
            let details = $('#game-details', this.view);

            let element = $(this.detailsTemplate);
            for (let label in r) {
                $('[data-' + label + ']', element).html(r[label]);
            }

            details.empty().append(element)
        });
    }

    async refresh() {
        let gameData = await $.get(baseUrl + "/games");
        this.setList(gameData);
    }

    setList(gameData) {
        let list = $('ul', this.view);
        list.empty();
        for (let game of gameData) {
            let currentGame = game;
            list.append($("<li class=\"list-group-item link\">" + currentGame.name + "</li>").on("click", () => {
                this.navigateToGame(currentGame.id)
            }));
        }
    }

    //Called when the welcome.html has been loaded
    setup(gameView, gameListView, newGameView, gameData) {
        this.view = $(gameListView);
        this.newGameView = $(newGameView);
        this.detailsTemplate = gameView;

        $('button#new', this.view).on("click", () => {
            console.log("loading form")
            let details = $('#game-details', this.view);
            details.empty().append(this.newGameView);
        });

        $('button#save', this.newGameView).on("click", () => {
            let name = $('input[name=name]', this.newGameView).val();
            let description = $('input[name=description]', this.newGameView).val();
            let materials = $('input[name=materials]', this.newGameView).val();
            let rules = $('input[name=rules]', this.newGameView).val();
            let difEasy = $('input[name=dif-easy]', this.newGameView).val();
            let difHard = $('input[name=dif-hard]', this.newGameView).val();
            let targetAudience = $('input[target-audience=description]', this.newGameView).val();
            let gameType = $('input[name=game-type]', this.newGameView).val();
            let amountStudents = $('input[name=amount-students]', this.newGameView).val();
            let sampleFile = $('input[name=sampleFile]', this.newGameView).val();

            $.ajax({
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
            }).then(() => {
                this.refresh();
            })
        });

        this.setList(gameData);

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(this.view);

        //File upload
        this.view.find("#upload").on("click", function () {
            //Set the proper action url
            $(this).closest("form").attr("action", `${baseUrl}/upload`);

            //Submit the form
            $(this).submit();
        });
    }


    //Called when the login.html fails to load
    error() {
        $(".content").html("Failed to load content!");
    }
}


