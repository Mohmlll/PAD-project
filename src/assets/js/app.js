/**
 * Entry point front end application - there is also an app.js for the backend (server folder)!
 *
 * Available: `sessionManager` or `networkManager` or `app.loadController(..)`
 *
 * You only want one instance of this class, therefor always use `app`.
 *
 * @author Lennard Fonteijn & Pim Meijer
 */
const CONTROLLER_SIDEBAR = "sidebar";
const CONTROLLER_LOGIN = "login";
const CONTROLLER_LOGOUT = "logout";
const CONTROLLER_WELCOME = "welcome";
const CONTROLLER_HOME = "home";
const CONTROLLER_UPLOAD = "upload";
const CONTROLLER_REGISTER = "register";
const CONTROLLER_GAME = "game";
const CONTROLLER_GAME_CREATE = "gameCreate";

const sessionManager = new SessionManager();
const networkManager = new NetworkManager();
const templateManager = new TemplateManager();
let result;
class App {


    init() {
        //Always load the sidebar
        this.loadController(CONTROLLER_SIDEBAR);

        //Attempt to load the controller from the URL, if it fails, fall back to the welcome controller.
        this.loadControllerFromUrl(CONTROLLER_HOME)

        // init template js
        templateManager.initPage();


    }

    /**
     * Loads a controller
     * @param name - name of controller - see constants
     * @param controllerData - data to pass from on controller to another
     * @returns {boolean} - successful controller change
     */
    loadController(name, controllerData) {
        console.log("loadController: " + name);

        if (controllerData) {
            console.log(controllerData);
        } else {
            controllerData = {};
        }

        switch (name) {
            case CONTROLLER_SIDEBAR:
                new NavbarController();
                break;

            case CONTROLLER_HOME:
                new HomeController();
                this.setHash(name);
                break;

            case CONTROLLER_LOGIN:
                this.setHash(name);
                this.isLoggedIn(() => new WelcomeController(), () => new LoginController());
                break;

            case CONTROLLER_LOGOUT:
                this.setHash(name);
                this.handleLogout();
                break;

            case CONTROLLER_WELCOME:
                this.setHash(name);
                this.isLoggedIn(() => new WelcomeController, () => new LoginController())
                break;

            case CONTROLLER_UPLOAD:
                new UploadController();
                break;

            case CONTROLLER_REGISTER:
                new RegisterController();
                this.setHash(name)
                break;

            case CONTROLLER_GAME:
                this.setHash(name);
                new GameController();
                break;
            case CONTROLLER_GAME_CREATE:
                this.setHash(name);
                new GameCreateController();
                break;

            default:
                return false;
        }

        templateManager.setActiveState();

        return true;
    }

    isCurrentController(controller) {
        return controller === this.getHash();
    }

    /**
     * Alternative way of loading controller by url
     * @param fallbackController
     */
    loadControllerFromUrl(fallbackController) {
        const currentController = this.getHash();

        if (currentController) {
            if (!this.loadController(currentController)) {
                this.loadController(fallbackController);
            }
        } else {
            this.loadController(fallbackController);
        }
    }

    getHash() {
        return location.hash.slice(1);
    }

    setHash(name) {
        location.hash = name;
    }

    /**
     * Convenience functions to handle logged-in states
     * @param whenYes - function to execute when user is logged in
     * @param whenNo - function to execute when user is logged in
     */
    isLoggedIn(whenYes, whenNo) {
        if (sessionManager.get("username")) {
            whenYes();
        } else {
            whenNo();
        }
    }

    /**
     * Removes username via sessionManager and loads the login screen
     */
    handleLogout() {
        sessionManager.remove("username");

        //go to login screen
        this.loadController(CONTROLLER_LOGIN);
    }
}

const app = new App();

//When the DOM is ready, kick off our application.
$(function () {
    app.init();
});
