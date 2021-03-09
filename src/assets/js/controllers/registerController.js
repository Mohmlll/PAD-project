class RegisterController {
    constructor() {
        $.get("views/register.html")
            .then((data) => this.setup(data))
            .catch(() => this.error());
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
