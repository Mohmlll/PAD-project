class RegisterController {
    constructor() {
        $.get("views/register.html")
            .then((data) => this.setup(data))
            .catch(() => this.error());
    }


    async onRegister() {
        let email = $('input[name=email]', this.registerView).val();
        // let password = $('input[name=password]', this.registerView).val();
        let password = "test";
        console.log(email + ", " + password)
        //TODO: We shouldn't save a password unencrypted!! Improve this by using cryptoHelper :)

        await $.ajax({
            url: baseUrl + "/register",
            data: JSON.stringify({email: email, password: password}),
            contentType: "application/json",
            method: "POST"
        });
    }

    //Called when the home.html has been loaded
    setup(data) {
        //Load the welcome-content into memory
        this.registerView = $(data);

        $('button#save', this.registerView).on("click", () => {
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

// $('button#save', this.newGameView).on("click", () => {
//     let name = $('input[name=name]', this.newGameView).val();
//     let description = $('textarea[name=description]', this.newGameView).val();
//
//     $.ajax({
//         url: baseUrl + "/games",
//         data: JSON.stringify({name: name, description: description}),
//         contentType: "application/json",
//         method: "POST"
//     }).then(() => {
//         this.refresh();
//     })
// });
