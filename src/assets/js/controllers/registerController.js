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

        if (password === passwordCheck) {
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
        } else {
            alert("password doesnt match");
        }
    }


    //Called when the home.html has been loaded
    setup(data) {
        console.log(data);
        //Load the welcome-content into memory
        this.registerView = $(data);

        $('#nextWizard1', this.registerView).on("click", (e) => {
            e.preventDefault();
            $('.registerPart1').css("display", "none");
            $('.registerPart2').css("display", "block");
        });

        $('#backWizard1', this.registerView).on("click", (e) => {
            e.preventDefault();
            $('.registerPart1').css("display", "block");
            $('.registerPart2').css("display", "none");
        });

        $('#nextWizard2', this.registerView).on("click", (e) => {
            e.preventDefault();
            $('.registerPart2').css("display", "none");
            $('.registerPart3').css("display", "block");

        });

        $('#backWizard2', this.registerView).on("click", (e) => {
            e.preventDefault();
            $('.registerPart2').css("display", "block");
            $('.registerPart3').css("display", "none");
        });

        $('#register', this.registerView).on("submit", (e) => {
            e.preventDefault();
            this.onRegister();
        })

        //Empty the content-div and add the resulting view to the page
        $(".content").empty().append(this.registerView);
    }

    //Called when the register.html fails to load
    error() {
        $(".content").html("Failed to load content!");
    }
}


