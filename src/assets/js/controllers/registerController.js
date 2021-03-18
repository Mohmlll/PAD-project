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
            const emailCheck = await this.userRepository.duplicateCheck(email);

            //password duplicate check values
            let password = $('input[name=password]', this.registerView).val();
            let passwordCheck = $('input[name=passwordCheck]', this.registerView).val();

            //currentStep is the current registration step and nextStep is the next registration step
            const currentStep = $(".tab[data-wizard-state='current']", this.registerView);
            const nextStep = currentStep.next();
            //
            const validate = await this.validateStepForm(currentStep, emailCheck, password, passwordCheck);
            // validate for
            if (!validate)
                return;
            
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
            let password = $('input[name=password]', this.registerView).val();
            let passwordCheck = $('input[name=passwordCheck]', this.registerView).val();
            let email = $('input[name=email]', this.registerView).val();
            const emailCheck = await this.userRepository.duplicateCheck(email);

            //the 'return;' stops when has invalid fields
            if (!this.validateStepForm(currentStep, emailCheck, password, passwordCheck))
                return;

            // post user
            await this.onRegister();
        });

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(this.registerView);

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
            sessionManager.set("email", user.email);
            app.loadController(CONTROLLER_HOME);
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

    validateStepForm(tab, email, password, passwordCheck) {
        const inputs = tab.find('[required]');
        let errorCount = 0;
        const passwordInput = $("#passwordCheckRegister");
        const emailInput = $("#emailRegister");


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
            if (password !== passwordCheck) {
                errorCount++
                passwordInput.removeClass('input-success');
                passwordInput.addClass('input-error');
            } else {
                passwordInput.removeClass('input-error');
                passwordInput.addClass('input-success');
            }
            if (email.length !== 0) {
                errorCount++
                emailInput.removeClass('input-success');
                emailInput.addClass('input-error');
            } else {
                emailInput.removeClass('input-error');
                emailInput.addClass('input-success');
            }
        }

        return errorCount === 0;
    }

    //Called when the register.html fails to load
    error() {
        $(".content").html("Failed to load content!");
    }


}
