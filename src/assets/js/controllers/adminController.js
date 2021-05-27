class AdminController {
    constructor() {
        this.userRepository = new UserRepository();
        this.gameRepository = new GameRepository();
        this.statRepository = new StatRepository();

        $.get("views/adminPanel.html")
            .then((data) => this.setup(data))
            .catch(() => this.error());
    }

    deleteGames(){
     $("#gameDelete").on("click",(e) => {

        });
    }

    async onEditGame () {
        this.game = await this.gameRepository.editGame();
    }

     //Loading games in
    async onGetGame(games) {

        // get template
        let gameId, name, gameType;
        let gameRows = $();
        if (games == null) {
            // get data
            this.game = await this.gameRepository.getGames();
            games = this.game;
            // loop trough available games
            for (let i = 0; i < games.length; i++) {
                const row = games[i];
                gameId = row["id_game"];
                name = row["name"];
                gameType = row["type"];

            }
        } else {
            for (let i = 0; i < games.length; i++) {
                const row = games[i];
                gameId = row.id_game;
                name = row.name;
                gameType = row.type;
            }
        }
    }

    //Called when the home.html has been loaded
    async setup(data) {

        console.log("Admin panel loaded: AdminController")

        //Load the welcome-content into memory
        this.adminView = $(data);
        this.adminView.find("[data-controller]").on("click", NavbarController.handleClickMenuItem);

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(this.adminView);
        // listen for redirects
        templateManager.listen();
        this.loadGame();
    }
}