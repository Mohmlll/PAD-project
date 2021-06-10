class GameInfoController {
    constructor() {
        this.gameRepository = new GameRepository();
        this.statRepository = new StatRepository();
        this.userId = sessionManager.get("id");
        $.get("views/gameInfo.html")
            .then((data) => this.setup(data))
            .catch(() => this.error());
    }

    /**
     * Gets ALL information about a game and puts it into the page
     * @returns {Promise<void>}
     */
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
            game = await this.gameRepository.game(gameId)
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
            materials = await this.gameRepository.materials(gameId)
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
            materialData = await this.gameRepository.materialType()
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
        let description = row["description"] || "Geen beschrijving";
        this.description = description;
        let target_audience_min = row["target_audience_min"];
        this.target_audience_min = target_audience_min;
        let target_audience_max = row["target_audience_max"];
        this.target_audience_max = target_audience_max;
        let type = row["type"];
        this.type = type;

        let rules = "Geen regels";
        if (row["rules"]){
            rules = '';
            let rule_array = JSON.parse(row["rules"]);

            if (rule_array) {
                for (const row of rule_array) {
                    rules += `- ${row} <br>`;
                }
            }
        }
        this.rules = rules;

        let diffs = "Geen differentiaties";
        if (row["diffs"]){
            diffs = '<hr>';
            let diff_array = JSON.parse(row["diffs"]);

            if (diff_array) {
                for (const row of diff_array) {
                    diffs += `<h5>${row[0]}</h5><p>${row[1]}</p><hr>`;
                }
            }
        }
        this.diffs = diffs;

        let gameInfoRowTemplate = $(gameInfoTemplate);

        gameInfoRowTemplate.find(".game-info-name").text(name);
        gameInfoRowTemplate.find(".game-info-name").append("<i class='fas fa-file-download fa-pull-right cursor-pointer'></i>").children().attr("id", "game-download").children()
        gameInfoRowTemplate.find(".game-info-name").append("<h3 class='fa-pull-right cursor'>Download</h3>")
        gameInfoRowTemplate.find(".game-image-plan").attr("src", 'uploads/' + row['game_plan'])
        gameInfoRowTemplate.find(".game-image").attr("src", 'uploads/' + row['game_icon'])
        gameInfoRowTemplate.find(".game-info-description").text(description);
        gameInfoRowTemplate.find(".game-info-rules").html(rules);
        gameInfoRowTemplate.find(".game-info-diffs").html(diffs);
        gameInfoRowTemplate.find(".game-info-target-audience-min").append(target_audience_min);
        gameInfoRowTemplate.find(".game-info-target-audience-max").append(target_audience_max);
        gameInfoRowTemplate.find(".game-info-type").append(type);

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

    /**
     * changes HTML based on favourite or not
     * @returns {Promise<void>}
     */
    async favCheck() {
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

    /**
     * Adds favourite or removes favourite
     * @returns {Promise<void>}
     */

    async fav() {
        let favButton = $("#game-info-un-fav");
        let unFavButton = $("#game-info-fav");

        if (this.isFav) {
            console.log("isfav is " + this.isFav + " en ik heb geklikt")
            await this.statRepository.favDelete(this.userId, this.gameId);
            this.isFav = false;
            favButton.hide();
            unFavButton.show();

        } else {
            console.log("isfav is " + this.isFav + " en ik heb geklikt")
            await this.statRepository.fav(this.userId, this.gameId);
            this.isFav = true;
            unFavButton.hide();
            favButton.show();
        }
    }

    /**
     * gets the average rating for the game
     * @param gameId
     * @returns {Promise<*>}
     */
    async getAvgRating(gameId) {
        let avgRatingCall = await this.statRepository.getAvgRatingForSpecifiedGame(gameId)
        this.avgRating = avgRatingCall.data[0]["average"];
        return avgRatingCall.data[0]["average"];
    }

    /**
     * gets the total amount of ratings that a game has
     * @param gameId
     * @returns {Promise<*>}
     */

    async getCountRating(gameId) {
        let countCall = await this.statRepository.getAvgRatingForSpecifiedGame(gameId)
        this.ratingCount = countCall.data[0]["total"];
        return countCall.data[0]["total"];
    }

    /**
     * Gets the current rating for the user
     * @param gameId
     * @returns {Promise<*>}
     */
    async getCurrentRating(gameId) {
        let ratingCall = await this.statRepository.getAvgRatingForSpecifiedGame(gameId)
        this.currentRating = ratingCall.data[0]["rating"]
        return this.currentRating;
    }

    /**
     * sends a click everytime a game gets clicked
     * @param gameId
     * @returns {Promise<*>}
     */
    async getClicks(gameId) {
        let clickCall = await this.statRepository.clicksGet(gameId)
        return clickCall.data[0]["totalClicks"];
    }

    /**
     * checks if the game is a favourite for the user
     * @param gameId
     * @returns {Promise<boolean>}
     */
    async getIsFav(gameId) {
        let favCall = await this.statRepository.favCheck(this.userId, gameId)
        return favCall.data.length !== 0;
    }

    /**
     * get the users own rating for the game.
     * @param gameId
     * @returns {Promise<*>}
     */
    async getRatingForUser(gameId) {
        let ratingCall = await this.statRepository.getRating(this.userId, gameId)
        return ratingCall.data[0]["rating"];
    }

    /**
     * returns data if the rating already exists or not
     * @param gameId
     * @returns {Promise<boolean>}
     */
    async ratingCheck(gameId) {
        let ratingCall = await this.statRepository.getRating(this.userId, gameId)
        return ratingCall.data.length !== 0;
    }

    /**
     * gets the rating that was input from the user on the stars
     * @returns {Promise<void>}
     */
    async getRating() {
        let gameId = parseInt(window.location.hash.replace("#game", ""));
        let rating;

        $("#rating_game input").on("click", async (event) => {
            rating = $(event.target).val();
            await this.postRating(this.userId, gameId, rating);
            await this.getAvgRating(gameId)
        })

    }

    /**
     * Posts rating and checks if already exists or not
     * @param userId
     * @param gameId
     * @param rating
     * @returns {Promise<void>}
     */
    async postRating(userId, gameId, rating) {
        let currentUserRating
        try {
            currentUserRating = await this.getRatingForUser(gameId)
        } catch (e) {
            if (e.code === 401) {
                this.gameView
                    .find(".error")
                    .html(e.reason);
            } else {
                currentUserRating = 0
                console.log(e);
            }
        }
        let isRated = await this.ratingCheck(gameId)
        await this.statRepository.rating(userId, gameId, rating, currentUserRating)
        await this.getCurrentRating(gameId);
        let avg_rating
        if (this.ratingCount === 1 && isRated) {
            avg_rating = rating;
        } else if (this.ratingCount === 0) {
            avg_rating = rating;
            this.ratingCount = 1
        } else if (isRated) {
            avg_rating = (((parseFloat(this.avgRating) * parseInt(this.ratingCount) - parseInt(currentUserRating)) + parseInt(rating)) / (parseInt(this.ratingCount)));
        } else {
            this.ratingCount++
            avg_rating = (((parseFloat(this.avgRating) * parseInt(this.ratingCount) - parseInt(this.currentRating)) + parseInt(rating)) / (parseInt(this.ratingCount)));
        }
        $('#avg_rating').text("Gemiddelde beoordeling: " + Math.round(avg_rating * 100) / 100 + "(" + this.ratingCount + ")")
    }

    /**
     * PDF Download
     */
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







