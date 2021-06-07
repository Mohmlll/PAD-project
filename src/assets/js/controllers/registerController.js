class RegisterController {
    constructor() {
        this.userRepository = new UserRepository();

        $.get("views/register.html")
            .then((data) => this.setup(data))
            .catch(() => this.error());
    }


    //Called when the home.html has been loaded

    setup(data) {
        //Load the welcome-content into memory
        this.registerView = $(data);

        $("#next", this.registerView).on("click", async (e) => {
            //email value from input checked in data base with emailCheck
            let email = $('input[name=email]', this.registerView).val();

            //password duplicate check values
            let password = $('input[name=password]', this.registerView).val();
            let passwordCheck = $('input[name=passwordCheck]', this.registerView).val();

            //currentStep is the current registration step and nextStep is the next registration step
            const currentStep = $(".tab[data-wizard-state='current']", this.registerView);
            const nextStep = currentStep.next();

            //email duplicate check
            const emailValidation = await this.validateEmail(email);

            //password check
            const passwordValidation = await this.validatePassword(password, passwordCheck);

            // validate for
            if (!emailValidation || !passwordValidation || !await this.validateStepForm(currentStep)) {
                return;
            }

            if (nextStep.length === 1) {
                currentStep.attr('data-wizard-state', 'done');
                nextStep.attr('data-wizard-state', 'current');
            }
            // set buttons
            this.setWizardButtons(nextStep);


        });

        $("#back", this.registerView).on("click", async (e) => {
            const currentStep = $(".tab[data-wizard-state='current']", this.registerView);
            const prevStep = currentStep.prev();

            if (prevStep.length === 1) {
                currentStep.attr('data-wizard-state', 'pending');
                prevStep.attr('data-wizard-state', 'current');
            }
            this.setWizardButtons(prevStep);
        });

        $("#finish", this.registerView).on("click", async (e) => {
            const currentStep = $(".tab[data-wizard-state='current']", this.registerView);
            //the 'return;' stops when has invalid fields
            if (!this.validateStepForm(currentStep))
                return message.error("error");

            // post user
            await this.onRegister();
        });

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(this.registerView);

        // listen for redirects
        templateManager.listen();
    }

    async onRegister() {
        let email = $('input[name=email]', this.registerView).val();
        let password = $('input[name=password]', this.registerView).val();
        let firstname = $('input[name=firstname]', this.registerView).val();
        let lastname = $('input[name=lastname]', this.registerView).val();
        let birthdate = $('input[name=birthdate]', this.registerView).val();
        let schoolName = $('input[name=schoolName]', this.registerView).val();
        let country = $('input[name=country]', this.registerView).val();

        try {
            const user = await this.userRepository.register(email, password, firstname, lastname, birthdate, schoolName, country)
            console.log(user);
            if (user.status === 404) {
                message.error(user.message || DEFAULT_ERROR_MESSAGE);
            } else {
                sessionManager.set("email", user.email);
                message.success("Succesvol geregistreerd")
                app.loadController(CONTROLLER_HOME);
            }

        } catch (e) {
            if (e.code === 401) {
                this.registerView
                    .find(".error")
                    .html(e.reason);
            } else {
                console.log(e);
            }
        }
    }

    setWizardButtons(currentStep) {
        const buttons = $(".bottom-nav", this.registerView);

        if (currentStep.next().length === 0) {

            buttons.find('#next').hide();
            buttons.find('#finish').show();
        } else {
            buttons.find('#next').show();
            buttons.find('#finish').hide();
        }

        if (currentStep.prev().length === 0) {
            buttons.find('#back').hide();
        } else {
            buttons.find('#back').show();
        }
    }

    async validateEmail(email) {
        const emailCheck = await this.userRepository.duplicateCheck(email);
        const emailInput = $("#emailRegister");

        if (emailCheck.email) {
            emailInput.removeClass('input-success');
            emailInput.addClass('input-error');
            message.error("Email is al in gebruik")
            return false;
        } else {
            emailInput.removeClass('input-error');
            emailInput.addClass('input-success');
            return true;
        }
    }

    validatePassword(password, passwordCheck) {
        const passwordInput = $("#passwordCheckRegister");
        if (password !== passwordCheck) {
            passwordInput.removeClass('input-success');
            passwordInput.addClass('input-error');
            message.error("Wachtwoorden komen niet overeen");
            return false;
        } else {
            passwordInput.removeClass('input-error');
            passwordInput.addClass('input-success');
            return true;
        }
    }

    validateStepForm(tab) {
        const inputs = tab.find('[required]:not([type=email]):not([type=password])');
        let errorCount = 0;
        for (const input of inputs) {
            const elem = $(input);
            if (!elem.is(":valid")) {
                elem.removeClass('input-success');
                elem.addClass('input-error');
                errorCount++;
            } else {
                elem.removeClass('input-error');
                elem.addClass('input-success');
            }
        }
        return errorCount === 0;
    }

    //Called when the register.html fails to load
    error() {
        $(".content").html("Failed to load content!");
    }


}
