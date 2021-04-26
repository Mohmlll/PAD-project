/**
 * Responsible for handling the actions happening on sidebar view
 *
 * @author Lennard Fonteijn, Pim Meijer
 */
class NavbarController {
    constructor() {
        $.get("views/navbar.html")
            .done((data) => this.setup(data))
            .fail(() => this.error());
    }

    //Called when the navbar.html has been loaded
    setup(data) {
        //Load the sidebar-content into memory
        const sidebarView = $(data);

        $("#logout", sidebarView).on('click', function (){
            sessionManager.clear();
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
