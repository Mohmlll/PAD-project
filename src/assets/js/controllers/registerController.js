class RegisterController {
    constructor() {
        $.get("views/register.html")
            .then((data) => this.setup(data))
            .catch(() => this.error());
    }


    async onRegister() {
        let email = $('input[name=email]', this.registerView).val();
        let password = $('input[name=password]', this.registerView).val();
        let passwordCheck = $('input[name=passwordCheck]', this.registerView).val();
        let firstname = $('input[name=firstname]', this.registerView).val();
        let lastname = $('input[name=lastname]', this.registerView).val();
        let birthdate = $('input[name=birthdate]', this.registerView).val();
        let schoolName = $('input[name=schoolName]', this.registerView).val();
        let country = $('input[name=country]', this.registerView).val();


            await $.ajax({
                url: baseUrl + "/register",
                data: JSON.stringify({
                    email: email, password: password,
                    firstname: firstname, lastname: lastname, birthdate: birthdate
                    , schoolName: schoolName, country: country
                }),
                contentType: "application/json",
                method: "POST"
            });

    }

    setWizardButtons(currentStep){
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

    validateStepForm(tab) {
        const inputs = tab.find('[required]');
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

    //Called when the home.html has been loaded
    setup(data) {
        //Load the welcome-content into memory
        this.registerView = $(data);

        $("#next", this.registerView).on("click", (e) => {
            const currentStep = $(".tab[data-wizard-state='current']", this.registerView);
            const nextStep = currentStep.next();
            

            // validate for
            if (!this.validateStepForm(currentStep))
                return;

            if (nextStep.length === 1) {
                currentStep.attr('data-wizard-state', 'done');
                nextStep.attr('data-wizard-state', 'current');
            }

            // set buttons
            this.setWizardButtons(nextStep);
        });

        $("#back", this.registerView).on("click", (e) => {
            const currentStep = $(".tab[data-wizard-state='current']", this.registerView);
            const prevStep = currentStep.prev();

            if (prevStep.length === 1) {
                currentStep.attr('data-wizard-state', 'pending');
                prevStep.attr('data-wizard-state', 'current');
            }

            this.setWizardButtons(prevStep);
        });

        $("#finish", this.registerView).on("click", (e) => {
            const currentStep = $(".tab[data-wizard-state='current']", this.registerView);

            //the 'return;' stops when has invalid fields
            if (!this.validateStepForm(currentStep))
                return;

            // post user
            this.onRegister();
        });

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(this.registerView);

    }
    //Called when the register.html fails to load
    error() {
        $(".content").html("Failed to load content!");
    }

}
