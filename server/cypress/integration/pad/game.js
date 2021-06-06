//Context: GameCreate
describe("GameCreate", function () {
    //Run before each test in this context
    beforeEach(() => {
        //Go to the specified URL
        cy.visit("http://localhost:8080/#gameCreate");
    });

    //Test: Validate create game form
    it("Valid game create form", function () {
        //Find the field for the username, description, amount of players, game icon and game plan -> check if it exists.
        cy.get('input[name="name"]').should("exist");
        cy.get('input[name="description"]').should("exist");
        cy.get('input[name="min-players"]').should("exist");
        cy.get('input[name="game-icon"]').should("exist");
        cy.get('input[name="game-plan"]').should("exist");

        //Find the field for the target audience -> check if it exists
        cy.get("#target-audience-min").should("exist");
        cy.get("#target-audience-max").should("exist");

        //Find the field for the game rules -> check if it exists
        cy.get("#game-rules").should("exist");

        //Find the fields for the material input -> check if they exist
        for (let i = 1; i < 9; i++) {
            cy.get("#subs" + i).should("exist");
            cy.get("#noOfRoom" + i).should("exist");
            cy.get("#adds" + i).should("exist");
        }

        //Find the field for the type of game -> check if it exists
        cy.get("#game_type").should("exist");

        //Find the button to submit the game create form -> check if it exists.
        cy.get("#game").should("exist");

    });

    //Test: Failed to create game
    it("Failed to create game", () => {
        //Start a fake server
        cy.server();

        //Add a stub with the URL /game as a POST
        //Respond with a JSON-object when requested and set the status-code tot 401.
        //Give the stub the alias: @gameCreate
        cy.route({
            method: "POST",
            url: "/game",
            response: {
                reason: "ERROR"
            },
            status: 401
        }).as("gameCreate");

        //Find the field for the name and type the text "test".
        cy.get('input[name="name"]').type("test");

        //Find the field for the description and type the text "test".
        cy.get('input[name="description"]').type("test");

        //Find the button to login and click it.
        cy.get("#game").click();

        //Wait for the @gameCreate-stub to be called by the click-event.
        cy.wait("@gameCreate");

        //After a failing to create a game, an element containing our error-message should be shown.
        cy.get(".error").should("exist").should("contain", "ERROR");
    });

    // describe("GameCreate", () => {
    //     beforeEach(() => {
    //         cy.visit("http://localhost:8080/#gameCreate");
    //         const session = {"email": "root", "id": 87};
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

});