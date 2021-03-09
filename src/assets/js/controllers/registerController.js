
class registerController {

    constructor() {
        this.userRepository = new UserRepository();

        $.get("views/register.html")
            .done((data) => this.setup(data))
            .fail(() => this.error());
    }

    //Called when the login.html has been loaded
    setup(data) {
        this.registerView = $(data);
        this.registerView.find("").on("", (e) => this.handleRegister(e))

        $(".content").empty().append(this.registerView);
    }

    /**
     * Async function that does a login request via repository
     * @param event
     */
    async handleRegister(event) {
        //prevent actual submit and page refresh
        event.preventDefault();
        const emailAdres = $("#registerInputEmail").value;
        const password = $("#registerInputPassword").value;

        try{

        } catch(e) {

        }
    }

    //Called when the login.html failed to load
    error() {
        $(".content").html("Failed to load content!");
    }
}