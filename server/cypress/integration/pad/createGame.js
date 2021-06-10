//Context: Registration
describe("gameCreate", function () {
    //Run before each test in this context
    beforeEach(() => {
        //Go to the specified URL
        cy.visit("http://localhost:8080/#gameCreate");

    });
    it("Valid gameCreate form", function () {

        cy.get("#game_name").should("exist");

        cy.get("#game_description").should("exist");

        cy.get("#min-players").should("exist");

        //Find the register button
        cy.get("#game").should("exist");
    });

    it('Create Game', function () {

        cy.server();

        cy.route("POST", "/game", {"data": "formdata"}).as("createGame");

        cy.get("#game_name").type("gamename");

        cy.get("#game_description").type("test wow test weow");

        cy.get("#min-players").type("5");

        cy.get("#game").click();
        
        cy.wait("@gameCreate");

    });
});