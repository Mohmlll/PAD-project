/**
 * Controller responsible for all events in view and setting data
 *
 * @author Pim Meijer
 */
class LoginController {

    constructor() {
        this.userRepository = new UserRepository();

        $.get("views/login.html")
            .done((data) => this.setup(data))
            .fail(() => this.error());
    }

    //Called when the login.html has been loaded
    setup(data) {
        //Load the login-content into memory
        this.loginView = $(data);

        $("#login", this.loginView).on("submit", (e) => this.handleLogin(e));
        $("#forgot", this.loginView).on("submit", (e) => this.handleForgot(e));

        $("#forgot-btn", this.loginView).on("click", (e) => this.setPage(e, 'forgot'));
        $("#login-btn", this.loginView).on("click", (e) => this.setPage(e, 'login'));

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(this.loginView);

        // listen for redirects
        templateManager.listen();
    }

    setPage(event, type) {
        event.preventDefault();

        const login_elements = $("#login, .login-show");
        const forgot_elements = $("#forgot, .forgot-show");

        switch (type) {
            case 'forgot':
                login_elements.hide();
                forgot_elements.show();
                break;
            case 'login':
                login_elements.show();
                forgot_elements.hide();
                break;
        }
    }

    /**
     * Async function that does a login request via repository
     * @param event
     */
    async handleLogin(event) {
        //prevent actual submit and page refresh
        event.preventDefault();

        //Find the email and password
        const email = this.loginView.find("[name='login_email']").val();
        let password = this.loginView.find("[name='password']").val();

        try {
            //await keyword 'stops' code until data is returned - can only be used in async function
            const result = await this.userRepository.login(email, password)
            sessionManager.set("email", result.email);
            app.loadController(CONTROLLER_HOME);
        } catch(e) {
            //if unauthorized error show error to user
            if (e.code === 401) {
                this.loginView
                    .find(".error")
                    .html(e.reason);

            } else {
                console.log(e);

            }
        }
    }

    async handleForgot(event) {
        //prevent actual submit and page refresh
        event.preventDefault();

        //Find the email and password
        const email = this.loginView.find("[name='forgot_email']").val();

        // send email
        try {


        } catch (e) {
            //if unauthorized error show error to user
            if (e.code === 401) {
                this.loginView
                    .find(".error")
                    .html(e.reason);
            } else {
                console.log(e);
            }
        }
    }

    //Called when the login.html failed to load
    error() {
        $(".content").html("Failed to load content!");
    }
}