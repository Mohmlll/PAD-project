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

        console.log(email + ", " + password)
        console.log($('input[name=email]', this.registerView))
        console.log(this.registerView)
        //TODO: We shouldn't save a password unencrypted!! Improve this by using cryptoHelper :)

        await $.ajax({
            url: baseUrl + "/register",
            data: JSON.stringify({email: email, password: password,
                firstname: firstname, lastname: lastname, birthdate: birthdate
                , schoolName: schoolName, country: country}),
            contentType: "application/json",
            method: "POST"
        });
    }

    //Called when the home.html has been loaded
    setup(data) {
        console.log(data);
        //Load the welcome-content into memory
        this.registerView = $(data);

        $('#register', this.registerView).on("submit", (e) => {
            e.preventDefault();
            console.log($(this));
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


