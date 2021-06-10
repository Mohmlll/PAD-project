//Context: Registration
describe("register", function () {
    //Run before each test in this context
    beforeEach(() => {
        //Go to the specified URL
        cy.visit("http://localhost:8080/#register");
    });
    //Test: Validate login form
    it("Valid register form", function() {
        //Find the field for the username, check if it exists.
        cy.get("#emailRegister").should("exist");

        //Find the field for the password, check if it exists.
        cy.get("#passwordRegister").should("exist");

        //Find the password checker to register, check if it exists.
        cy.get("#passwordCheckRegister").should("exist");

        //Find the register button
        cy.get("#next").should("exist");
    });

    it('Create Account', function () {
        //start up a fake server
        cy.server();

        //sends a request
        //adds an alias to the request: @register
        cy.route("POST", "/register", {"email": "testMail@outlook.com", "password" : "Hallo123"}).as("register");

        //fill in emailregister
        cy.get("#emailRegister").type("testMail@outlook.com");

        //fill in password
        cy.get("#passwordRegister").type("Hallo123");

        //fill in password checker
        cy.get("#passwordCheckRegister").type("Hallo123");

        //click the next button
        cy.get("#next").click();

        //fill in first name
        cy.get("#firstnameRegister").type("Yusuf");

        //Fill in last name
        cy.get("#lastnameRegister").type("Kara");

        //Fill in date
        cy.get("#birthdateRegister").type("2021-09-06");

        //Click next button
        cy.get("#next").click();

        //Fill in school name
        cy.get("#schoolNameRegister").type("HVA");

        //Fill in school country
        cy.get("#countryRegister").type("Netherlands");

        //Click finish button
        cy.get("#finish").click();

        //Wait for the @register-stub to be called by the click-event.
        cy.wait("@register");

        //The @register-stub is called, check the contents of the incoming request.
        cy.get("@register").should((xhr) => {
            //The username should match what we typed earlier
            expect(xhr.request.body.email).equals("testMail@outlook.com");

            //The password should match what we typed earlier
            expect(xhr.request.body.password).equals("Hallo123");

        });
    });
});