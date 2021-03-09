/**
 * Responsible for handling the actions happening on home view
 *
 * @author Lennard Fonteijn & Pim Meijer
 */

class HomeController {
    constructor() {
        console.log('aa')

        $.get("views/home.html")
            .done((data) => this.setup(data))
            .fail(() => this.error());
    }

    //Called when the home.html has been loaded
    setup(data) {
        //Load the welcome-content into memory
        this.welcomeView = $(data);

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(this.welcomeView);
    }

    //Called when the home.html fails to load
    error() {
        $(".content").html("Failed to load content!");
    }
}