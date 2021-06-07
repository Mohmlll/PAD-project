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
        Swal.fire({
            title: 'Weet je het zeker?',
            text: "Verwijderen is definitief!",
            icon: '',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ja, graag!',
            cancelButtonText: 'liever niet',
        }).then(async (result) => {
            if (result.isConfirmed) {
                Swal.fire(
                    'Verwijderd!',
                    gameName + ' is verwijderd.',
                    'success'
                )
                await this.gameRepository.deleteGame(gameId)
            }
            if (result.isConfirmed) {
                message.success("Spel succesvol verwijderd!")
                $('.admin_panel_game_delete[data-id="' + gameId + '"]', this.adminView).parent().parent().hide()
            } else {
                message.warning("Probleem opgelopen met verwijderen!")
            }

        })


    }

    async deleteUser(userId, userName) {
        //confirmation bericht
        Swal.fire({
            title: 'Weet je het zeker?',
            text: "Verwijderen is definitief!",
            icon: '',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ja, graag!',
            cancelButtonText: 'liever niet',
        }).then(async (result) => {
            if (result.isConfirmed) {
                Swal.fire(
                    'Verwijderd!',
                    userName + ' is verwijderd.',
                    'success'
                )
                await this.gameRepository.deleteGame(gameId)
            }
            if (result.isConfirmed) {
                message.success("Spel succesvol verwijderd!")
                $('.admin_user_delete[data-id="' + userId + '"]', this.adminView).parent().parent().hide()
            } else {
                message.warning("Probleem opgelopen met verwijderen!")
            }

        })
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

            adminTemplateUsable.find(".admin_panel_game_id").text(gameNumber)
            adminTemplateUsable.find(".admin_panel_game_delete").attr("data-id", gameId);
            adminTemplateUsable.find(".admin_panel_game_name").text(name);
            adminTemplateUsable.appendTo("#admin_panel_game_list");

        }
    }

    onDeleteGame() {
        $('.admin_panel_game_delete', this.adminView).on("click", async (e) => {
            const gameId = $(e.currentTarget).attr("data-id")
            const game = this.games.find(function (a) {
                return a.id_game == gameId;
            })
            await this.deleteGame(gameId, game.name)
        });
    }

    onDeleteUser() {
        $('.admin_user_delete', this.adminView).on("click", async (e) => {
            const userId = $(e.currentTarget).attr("data-id")
            const user = this.users.find(function (a) {
                return a.id == userId;
            });
            console.log(user);
            await this.deleteUser(userId, user.firstname)
        });
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

            adminUserTemplateUsable.find(".admin_panel_user_id").text(userNumber)
            adminUserTemplateUsable.find(".admin_user_delete").attr("data-id", userId);
            adminUserTemplateUsable.find(".admin_panel_user_name").text(fullName);
            adminUserTemplateUsable.find(".admin_panel_user_role").text(userRole);
            adminUserTemplateUsable.appendTo("#admin_panel_user_list");
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
        this.onDeleteUser();
        this.onDeleteGame();
    }

}