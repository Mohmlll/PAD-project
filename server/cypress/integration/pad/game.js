//Context: GameCreate
describe("GameCreate", function () {
    //Run before each test in this context
    beforeEach(() => {
        //Go to the specified URL
        cy.visit("http://localhost:8080/#gameCreate");
    });

    //Test: Validate create game form
    it("Valid login form", function() {
        //Find the field for the username, description and the amount of students -> check if it exists.
        cy.get('input[name="name"]').should("exist");
        cy.get('input[name="description"]').should("exist");
        cy.get('input[name="amount-students"]').should("exist");

        //Find the field for the target audience and check if it exists
        cy.get("#target-audience-min").should("exist");
        cy.get("#target-audience-max").should("exist");

        //Find the field for the type of game -> check if it exists
        cy.get("#gametype").should("exist");

        //Find the button to login -> check if it exists.
        cy.get("#form-submit").should("exist");

        //Find the field for the type of material, substraction and addition button -> check if it exists
        for (let i = 1; i < 9; i++) {
            cy.get("#noOfRoom" + i).should("exist");
            cy.get("#adds" + i).should("exist");
            cy.get("#subs" + i).should("exist");
        }

    });

    // describe("GameCreate", () => {
    //     beforeEach(() => {
    //         cy.visit("http://localhost:8080/#gameCreate");
    //         const session = {"username": "jim"};
    //         localStorage.setItem("session", JSON.stringify(session));
    //     });
    //     it("Shows all pokemon from request", () => {
    //         cy.server();
    //         const pokemonList = [
    //             {id: 1, name: "Bulbasaur"},
    //             {id: 151, name: "Mew"}
    //         ];
    //         cy.route("POST", "/pokemon", pokemonList).as("pokemonRoute");
    //         cy.get("a.nav-link[data-controller='pokemon']").click();
    //         cy.wait("@pokemonRoute");
    //         cy.url().should("contain", "#pokemon");
    //         cy.get("#pokemonlist").should("exist");
    //         cy.get("#pokemonlist tr").should("have.length", 2);
    //         cy.get("#pokemonlist").contains("Bulbasaur");
    //         cy.get("#pokemonlist").contains("Mew");
    //     });
    // });

    // //Test: Failed login
    // it("Failed login", function () {
    //     //Start a fake server
    //     cy.server();
    //
    //     //Add a stub with the URL /user/login as a POST
    //     //Respond with a JSON-object when requested and set the status-code tot 401.
    //     //Give the stub the alias: @login
    //     cy.route({
    //         method: "POST",
    //         url: "/user/login",
    //         response: {
    //             reason: "ERROR"
    //         },
    //         status: 401
    //     }).as("login");
    //
    //     //Find the field for the username and type the text "test".
    //     cy.get("#exampleInputUsername").type("test");
    //
    //     //Find the field for the password and type the text "test".
    //     cy.get("#exampleInputPassword").type("test");
    //
    //     //Find the button to login and click it.
    //     cy.get(".login-form button").click();
    //
    //     //Wait for the @login-stub to be called by the click-event.
    //     cy.wait("@login");
    //
    //     //After a failed login, an element containing our error-message should be shown.
    //     cy.get(".error").should("exist").should("contain", "ERROR");
    // });
});