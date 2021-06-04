class AdminController {
    constructor() {
        this.userRepository = new UserRepository();
        this.gameRepository = new GameRepository();
        this.statRepository = new StatRepository();

        $.get("views/adminPanel.html")
            .then((data) => this.setup(data))
            .catch(() => this.error());
    }

    async deleteGame(gameId, gameName) {
        //confirmation bericht
        let error;

        let isConfirmed = confirm("Weet u zeker dat u " + gameName + " wilt verwijderen?");

        if (isConfirmed === true) {
            try {
                await this.gameRepository.deleteGame(gameId)
            } catch (e) {
                error = true
                if (e.code === 401) {
                    this.adminView
                        .find(".error")
                        .html(e.reason);
                } else {
                    console.log(e);
                }
            }
        }
        if (isConfirmed && !error) {
            message.success("Spel succesvol verwijderd!")
            $("#admin_panel_game_id_" + gameId).parent().children().hide();
        } else if (isConfirmed && error) {
            message.warning("Probleem opgelopen met verwijderen!")
        }
    }

    async onEditGame() {
        this.game = await this.gameRepository.editGame();
    }

    //Loading games in
    async onGetGame() {

        // get template
        let adminPanelTemplate = await $.get("views/adminPanelTemplate.html");
        let name, gameNumber, gameId;
        // get data
        this.games = await this.gameRepository.getGames();

        for (let i = 0; i < this.games.length; i++) {
            let adminTemplateUsable = $(adminPanelTemplate);
            const row = this.games[i];

            gameNumber = i + 1;
            name = row.name;
            gameId = row.id_game;
            adminTemplateUsable.find(".admin_panel_game_id").text(gameNumber).attr("id", "admin_panel_game_id_" + gameId);
            adminTemplateUsable.find(".admin_panel_delete").attr("id", "delete_button_id_" + gameId)
            adminTemplateUsable.find(".admin_panel_edit").attr("id", "edit_button_id_" + gameId)
            adminTemplateUsable.find(".admin_panel_game_name").text(name);
            adminTemplateUsable.appendTo("#admin_panel_game_list");
        }

        // loop trough available games
        console.log(this.games)

    }

    onDeleteGame() {
        for (let i = 0; i <= this.games.length; i++) {
            let gameId = this.games[i]["id_game"]
            let gameName = this.games[i]["name"]

            $('#delete_button_id_' + gameId, this.adminView).on("click", async (e) => {
                console.log(gameId)

                await this.deleteGame(gameId, gameName)
            });
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
        await this.onGetGame()
        this.onDeleteGame()
    }
}