class AdminController {
    constructor() {
        this.userRepository = new UserRepository();

        $.get("views/adminPanel.html")
            .then((data) => this.setup(data))
            .catch(() => this.error());
    }
}