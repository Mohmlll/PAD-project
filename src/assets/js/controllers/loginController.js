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
        $("#forgot_2", this.loginView).on("submit", (e) => this.handleToken(e));

        $("#forgot-btn", this.loginView).on("click", (e) => this.setPage(e, 'forgot'));
        $("#login-btn", this.loginView).on("click", (e) => this.setPage(e, 'login'));
        $("#forgot-2-btn", this.loginView).on("click", (e) => this.setPage(e, 'forgot'));

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(this.loginView);

        // listen for redirects
        templateManager.listen();
    }

    setPage(event, type) {
        if (event !== null)
            event.preventDefault();

        const login_elements = $("#login, .login-show");
        const forgot_elements = $("#forgot, .forgot-show");
        const forgot_2_elements = $("#forgot_2, .forgot-2-show");

        switch (type) {
            case 'forgot':
                login_elements.hide();
                forgot_elements.show();
                forgot_2_elements.hide();
                break;
            case 'forgot_2':
                login_elements.hide();
                forgot_elements.hide();
                forgot_2_elements.show();
                break;
            case 'login':
                login_elements.show();
                forgot_elements.hide();
                forgot_2_elements.hide();
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

            console.log(result);
            sessionManager.set("email", result.email);
            sessionManager.set("id", result.id)
            sessionManager.set("right", result.right)

            message.success("Succesvol ingelogd")
            app.loadController(CONTROLLER_HOME);
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

    async handleForgot(event) {
        //prevent actual submit and page refresh
        event.preventDefault();

        //Find the email and password
        const email = this.loginView.find("[name='forgot_email']").val();

        // send email
        const result = await this.userRepository.resetPassword(email);

        switch (result.status) {
            case 200:
                // continue form
                this.setPage(null, 'forgot_2')
                break;
            default:
                message.error(result.message)
                break;
        }
    }

    async handleToken(event) {
        //prevent actual submit and page refresh
        event.preventDefault();

        //Find the token and password
        const token = this.loginView.find("[name='forgot_token']").val();

        // validate token
        const result = await this.userRepository.validateToken(token);

        switch (result.status) {
            case 200:
                // login
                sessionManager.set("email", result.user.email);
                sessionManager.set("id", result.user.id)
                sessionManager.set("right", result.user.right)

                // redirect to change password page
                app.loadController(CONTROLLER_HOME);

                message.success();
                break;
            default:
                message.error(result.message)
                break;
        }
    }

    //Called when the login.html failed to load
    error() {
        $(".content").html("Failed to load content!");
    }
}