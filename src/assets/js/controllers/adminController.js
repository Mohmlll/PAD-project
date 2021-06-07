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

    async deleteUser(userId, userName) {
        //confirmation bericht
        let error;

        let isConfirmed = confirm("Weet u zeker dat u de persoon: " + userName + " wilt verwijderen?");

        if (isConfirmed === true) {
            try {
                await this.userRepository.deleteUser(userId)
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
            message.success("Gebruiker succesvol verwijderd!")
            $("#admin_panel_user_id_" + userId).parent().children().hide();
        } else if (isConfirmed && error) {
            message.warning("Probleem opgelopen met verwijderen!")
        }
    }

    //Loading games in
    async onGetGame() {

        // get template
        let adminPanelGameTemplate = await $.get("views/adminPanelGameTemplate.html");
        let name, gameNumber, gameId;
        // get data
        this.games = await this.gameRepository.getGames();

        for (let i = 0; i < this.games.length; i++) {
            let adminTemplateUsable = $(adminPanelGameTemplate);
            const row = this.games[i];

            gameNumber = i + 1;
            name = row.name;
            gameId = row.id_game;

            adminTemplateUsable.find(".admin_panel_game_id").text(gameNumber).attr("id", "admin_panel_game_id_" + gameId);
            adminTemplateUsable.find(".admin_panel_game_delete").attr("id", "delete_button_id_" + gameId);
            adminTemplateUsable.find(".admin_panel_game_edit").attr("id", "edit_button_id_" + gameId);
            adminTemplateUsable.find(".admin_panel_game_name").text(name);
            // adminTemplateUsable.find(".admin_panel_game_description").text(gameDescription);
            // adminTemplateUsable.find(".admin_panel_game_type").text(gameType);
            // adminTemplateUsable.find(".admin_panel_game_rules").text(gameRules);
            adminTemplateUsable.appendTo("#admin_panel_game_list");
        }
    }

    async onDeleteGame() {
        for (let i = 0; i <= this.games.length; i++) {
            let gameId = this.games[i]["id_game"]
            let gameName = this.games[i]["name"]

            $('#delete_button_id_' + gameId, this.adminView).on("click", async (e) => {
                console.log(gameId)

                await this.deleteGame(gameId, gameName)
            });
        }
    }

    //Loading users in
    async onGetUser() {

        // get template
        let adminPanelUserTemplate = await $.get("views/adminPanelUserTemplate.html");
        let firstName, lastName, fullName, userId, userRole, userNumber;
        // get data
        this.users = await this.userRepository.getUsers();

        for (let i = 0; i < this.users.length; i++) {
            let adminUserTemplateUsable = $(adminPanelUserTemplate);
            const row = this.users[i];

            userNumber = i + 1;
            firstName = row.firstname;
            lastName = row.lastname;
            fullName = firstName + " " + lastName;

            userId = row.id;
            userRole = row.role;

            adminUserTemplateUsable.find(".admin_panel_user_id").text(userNumber).attr("id", "admin_panel_user_id_" + userId);
            adminUserTemplateUsable.find(".admin_user_delete").attr("id", "delete_button_user_id_" + userId);
            adminUserTemplateUsable.find(".admin_panel_user_name").text(fullName);
            adminUserTemplateUsable.find(".admin_panel_user_role").text(userRole);
            adminUserTemplateUsable.appendTo("#admin_panel_user_list");
        }
    }

    async onDeleteUser() {
        for (let i = 0; i <= this.users.length; i++) {
            let userId = this.users[i]["id"]
            let userName = this.users[i]["firstname"]

            $('#delete_button_user_id_' + userId, this.adminView).on("click", async (e) => {
                console.log(userId)
                alert(userId)
                await this.deleteUser(userId, userName)
            });
        }
    }

    //Called when the home.html has been loaded
    async setup(data) {

        // console.log("Admin panel loaded: AdminController")

        //Load the welcome-content into memory
        this.adminView = $(data);
        this.adminView.find("[data-controller]").on("click", NavbarController.handleClickMenuItem);

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(this.adminView);
        // listen for redirects
        templateManager.listen();
        await this.onGetGame();
        await this.onGetUser();
        await this.onDeleteGame();
        await this.onDeleteUser();
    }

    //Called when the register.html fails to load
    // error() {
    //     $(".content").html("Failed to load content!");
    // }
}