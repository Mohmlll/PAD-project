class GameInfoController {
    constructor() {
        this.userRepository = new UserRepository();
        this.userId = sessionManager.get("id");
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
        this.name = name;
        let description = row["description"];
        this.description = description;
        let target_audience_min = row["target_audience_min"];
        this.target_audience_min = target_audience_min;
        let target_audience_max = row["target_audience_max"];
        this.target_audience_max = target_audience_max;
        let type = row["type"];
        this.type = type;

        let gameInfoRowTemplate = $(gameInfoTemplate);

        gameInfoRowTemplate.find(".game-info-name").text(name);
        // gameInfoRowTemplate.find(".game-info-name").append("<i class='fas fa-file-pdf fa-pull-right'></i>")
        // gameInfoRowTemplate.find(".game-info-name").append("<i class='fas fa-file-download fa-pull-right cursor-pointer'></i>").children().attr("id", "game-download-" + gameId)
        gameInfoRowTemplate.find(".game-info-name").append("<i class='fas fa-file-download fa-pull-right cursor-pointer'></i>").children().attr("id", "game-download").children()
        gameInfoRowTemplate.find(".game-info-name").append("<h3 class='fa-pull-right cursor'>Download</h3>")
        gameInfoRowTemplate.find(".game-image-plan").attr("src", 'uploads/' + row['game_plan'])
        gameInfoRowTemplate.find(".game-image").attr("src", 'uploads/' + row['game_icon'])


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
                this.materialStringReplaced = materialStringReplaced;
            }
            gameInfoRowTemplate.find(".game-info-materials").append(materialStringReplaced)

        }

        let avgRating = await this.getAvgRating(gameId)
        let countRating = await this.getCountRating(gameId)
        let clicks = await this.getClicks(gameId)
        this.isFav = await this.getIsFav(gameId)

        if (countRating === 0) {
            gameInfoRowTemplate.find("#avg_rating").text("Dit spel heeft nog geen beoordelingen.");
        } else {
            gameInfoRowTemplate.find("#avg_rating").text("Gemiddelde beoordeling: " + avgRating + "(" + countRating + ")");
        }
        gameInfoRowTemplate.find("#game-info-clicks").append(clicks);


        gameInfoRowTemplate.appendTo("#game-info-view");
    }

    async favCheck(){
        let favButton = $("#game-info-un-fav");
        let unFavButton = $("#game-info-fav");

        if (this.isFav) {
            unFavButton.hide();
            favButton.show();

        } else {
            favButton.hide();
            unFavButton.show();
        }
    }
    async fav() {
        let favButton = $("#game-info-un-fav");
        let unFavButton = $("#game-info-fav");

        if (this.isFav) {
            console.log("isfav is " + this.isFav + " en ik heb geklikt")
            await this.userRepository.favDelete(this.userId, this.gameId);
            this.isFav = false;
            favButton.hide();
            unFavButton.show();

        } else {
            console.log("isfav is " + this.isFav + " en ik heb geklikt")
            await this.userRepository.fav(this.userId, this.gameId);
            this.isFav = true;
            unFavButton.hide();
            favButton.show();
        }
    }

    async getAvgRating(gameId) {
        let avgRatingCall = await this.userRepository.getAvgRatingForSpecifiedGame(gameId)
        return avgRatingCall.data[0]["average"];
    }

    async getCountRating(gameId) {
        let countCall = await this.userRepository.getAvgRatingForSpecifiedGame(gameId)
        return countCall.data[0]["total"];
    }

    async getClicks(gameId) {
        let clickCall = await this.userRepository.clicksGet(gameId)
        return clickCall.data[0]["totalClicks"];
    }

    async getIsFav(gameId) {
        let favCall = await this.userRepository.favCheck(this.userId, gameId)
        return favCall.data.length !== 0;
    }

    async getRating() {
        let gameId = parseInt(window.location.hash.replace("#game", ""));
        let rating;

        $("#rating_game input").on("click", (event) => {
            rating = $(event.target).val();
            this.postRating(this.userId, gameId, rating);
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
            let pdf;

            pdf = new jsPDF();
            pdf.setFont("arial");
            pdf.setFontType("normal");

            pdf.text(20, 20, this.name);
            let splitDescription = pdf.splitTextToSize(this.description, 180);
            pdf.text(20, 30, splitDescription);

            pdf.text(20, 170, "Doelgroep: " + this.target_audience_min + " - " + this.target_audience_max);
            pdf.text(20, 180, "Soort spel: " + this.type);
            pdf.text(20, 190, "Materialen:\n" + this.materialStringReplaced);

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

        //fav game code
        await this.favCheck()
        $("#game-info-fav", this.gameView).text("Voeg toe aan favorieten").on("click", () => {
            this.fav()
        });
        $("#game-info-un-fav", this.gameView).text("Verwijder van favorieten").on("click", () => {
            this.fav()
        });

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







