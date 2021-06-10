//Context: Give Rating
describe("GiveRating", function () {
    //Run before each test in this context
    beforeEach(() => {
        //Go to the specified URL
        cy.visit("http://localhost:8080/#login");
    });

    //Test: Validate login form
    it("Valid login form", function() {
        //Find the field for the username, check if it exists.
        cy.get("#login_email").should("exist");
        cy.get("#login_email").
        //Find the field for the password, check if it exists.
        cy.get("#password").should("exist");

        //Find the button to login, check if it exists.
        cy.get("#login_button").should("exist");
    });
});