class GameInfoController {
    constructor() {
        this.userRepository = new UserRepository();
        $.get("views/gameInfo.html")
            .then((data) => this.setup(data))
            .catch(() => this.error());
    }

    async onGetGame() {
        // get data
        let gameId = parseInt(window.location.hash.replace("#game", ""));
        this.gameId = gameId;
        let game;
        let materials;
        let materialData;
        let errorCounter = 0;
        let loopCount = 0;
        let materialStringReplaced;
        try {
            game = await this.userRepository.game(gameId)
        } catch (e) {
            if (e.code === 401) {
                this.gameView
                    .find(".error")
                    .html(e.reason);
            } else {
                console.log(e);
            }
        }

        try {
            materials = await this.userRepository.materials(gameId)
        } catch (e) {
            if (e.code === 401) {
                this.gameView
                    .find(".error")
                    .html(e.reason);
            } else {
                console.log(e);
            }
        }
        try {
            materialData = await this.userRepository.materialType()
        } catch (e) {
            if (e.code === 401) {
                this.gameView
                    .find(".error")
                    .html(e.reason);
            } else {
                console.log(e);
            }
        }

        // get template
        let gameInfoTemplate = await $.get("views/templateGameInfo.html")
        let row = game[0]

        let name = row["name"];
        let description = row["description"];
        let target_audience_min = row["target_audience_min"];
        let target_audience_max = row["target_audience_max"];
        let type = row["type"];

        let gameInfoRowTemplate = $(gameInfoTemplate);

        gameInfoRowTemplate.find(".game-info-name").text(name);
        // gameInfoRowTemplate.find(".game-info-name").append("<i class='fas fa-file-pdf fa-pull-right'></i>")
        // gameInfoRowTemplate.find(".game-info-name").append("<i class='fas fa-file-download fa-pull-right cursor-pointer'></i>").children().attr("id", "game-download-" + gameId)
        gameInfoRowTemplate.find(".game-info-name").append("<i class='fas fa-file-download fa-pull-right cursor-pointer'></i>").children().attr("id", "game-download").children()
        gameInfoRowTemplate.find(".game-info-name").append("<h3 class='fa-pull-right cursor'>Download</h3>")


        gameInfoRowTemplate.find(".game-info-description").text(description);
        gameInfoRowTemplate.find(".game-info-target-audience-min").text("‎ " + target_audience_min);
        gameInfoRowTemplate.find(".game-info-target-audience-max").text("‎ " + target_audience_max);
        gameInfoRowTemplate.find(".game-info-type").text("‎ " + type);
        let materialString = "";
        for (let j = 0; j < materials.length; j++) {
            loopCount++
            let materialType = materialData[j]["material"];
            let materialAmount = materials[j]["amount"];

            if (materialAmount !== 0) {
                materialString += materialType + ": " + materialAmount + ",\n";
            } else {
                errorCounter++
            }
            if (errorCounter === materials.length) {
                gameInfoRowTemplate.find(".game-info-materials").text("Geen materialen gevonden.")
            }
            if (loopCount === materials.length) {
                materialStringReplaced = materialString.replace(/,(?=[^,]*$)/, '')
            }
            gameInfoRowTemplate.find(".game-info-materials").append(materialStringReplaced)

        }
        let avgRating = await this.getAvgRating(gameId)
        let countRating = await this.getCountRating(gameId)
        gameInfoRowTemplate.find("#avg_rating").append(avgRating + "(" + countRating + ")");

        gameInfoRowTemplate.appendTo("#game-info-view");
    }

    async getAvgRating(gameId) {
        let avgRatingCall = await this.userRepository.getAvgRatingForSpecifiedGame(gameId)
        return avgRatingCall.data[0]["average"];
    }

    async getCountRating(gameId) {
        let countCall = await this.userRepository.getAvgRatingForSpecifiedGame(gameId)
        return countCall.data[0]["total"];
    }


    async getRating() {
        let gameId = parseInt(window.location.hash.replace("#game", ""));
        let userId = sessionManager.get("id");
        let rating;

        $("#rating_game input").on("click", (event) => {
            rating = $(event.target).val();
            this.postRating(userId, gameId, rating);
            this.getAvgRating(gameId)
        })

    }

    async postRating(userId, gameId, rating) {
        let hasRating;

        try {
            let game = await this.userRepository.ratingCheck(userId, gameId);
            hasRating = game.data.length !== 0;
        } catch (e) {
            if (e.code === 401) {
                this.gameView
                    .find(".error")
                    .html(e.reason);
            } else {
                console.log(e);
            }
        }
        if (hasRating) {
            try {
                await this.userRepository.getSpecificRatingForEachUser(rating, userId, gameId)
            } catch (e) {
                if (e.code === 401) {
                    this.gameView
                        .find(".error")
                        .html(e.reason);
                } else {
                    console.log(e);
                }
            }
        } else {
            try {
                await this.userRepository.rating(userId, gameId, rating)
            } catch (e) {
                if (e.code === 401) {
                    this.gameView
                        .find(".error")
                        .html(e.reason);
                } else {
                    console.log(e);
                }
            }
        }
    }

    download() {
        $("#game-download", this.gameView).on("click", () => {
            let pdf, outStr = ""

            pdf = new jsPDF();
            pdf.setFont("courier");
            pdf.setFontType("normal");

            for (let i = 0; i < 1111; i++) {
                outStr += ' ' + [i];
                //every tenth word, add a new-line. Change this to '<br/>' if you want html.
                if ((i + 1) % 10 === 0) {
                    outStr += "\n";
                }
            }
            outStr = "Test"
            let lines = outStr.split("\n");
            let flag = 0
            for (let i = 0; i < lines.length; i++) {
                if (i == 0) {
                    if ((i + 1) % 25 == 0) {
                        pdf.addPage()
                    }
                } else {
                    if (i % 25 == 0) {
                        pdf.addPage()
                        flag = 0
                    }
                }
                if (i == 0) {
                    pdf.text(lines[i], 10, 10)
                } else {
                    pdf.text(lines[i], 10, 10 * flag)
                }
                flag = flag + 1
            }
            pdf.save("game" + this.gameId + ".pdf")
        })

    }


    //Called when the home.html has been loaded
    async setup(data) {
        //Load the welcome-content into memory
        this.gameView = $(data);

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(this.gameView);

        await this.onGetGame();
        await this.getRating();

        this.download()

        //Reload page when back button is pressed
        if (window.history && window.history.pushState) {
            $(window).on('popstate', () => {
                location.reload()
            });
        }

        templateManager.listen();
    }

    //Called when the gameInfo.html fails to load
    error() {
        $(".content").html("Failed to load content!");
    }


}
