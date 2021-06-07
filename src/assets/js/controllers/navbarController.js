/**
 * Responsible for handling the actions happening on sidebar view
 *
 * @author Lennard Fonteijn, Pim Meijer
 */
class NavbarController {
    constructor() {
        this.userRepository = new UserRepository();
        this.userId = sessionManager.get("id");
        $.get("views/navbar.html")
            .done((data) => this.setup(data))
            .fail(() => this.error());
    }



    //Called when the navbar.html has been loaded
    async setup(data) {
        //Load the sidebar-content into memory
        const sidebarView = $(data);

        this.admin = await this.userRepository.checkAdmin(this.userId);
        let admin = this.admin;
        console.log(admin + "56654")


        $("#logout", sidebarView).on('click', function () {
            sessionManager.clear();
            message.success("Succesvol uitgelogd")
            app.loadController(CONTROLLER_HOME);
        });
        //Empty the sidebar-div and add the resulting view to the page
        $(".header-area").empty().append(sidebarView);

        templateManager.initSideBar()
    }

    //Called when the login.html failed to load
    error() {
        $(".content").html("Failed to load the sidebar!");
    }
}
