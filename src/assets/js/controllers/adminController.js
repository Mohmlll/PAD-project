class AdminController {
    constructor() {
        this.userRepository = new UserRepository();

        $.get("views/adminPanel.html")
            .then((data) => this.setup(data))
            .catch(() => this.error());
    }

    //Called when the home.html has been loaded
    async setup(data) {

        //Load the welcome-content into memory
        this.adminView = $(data);
        this.adminView.find("[data-controller]").on("click", NavbarController.handleClickMenuItem);

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(this.adminView);
        // listen for redirects
        templateManager.listen();
    }
}