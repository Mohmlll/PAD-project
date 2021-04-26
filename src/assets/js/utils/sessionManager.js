/**
 * Implementation of a simple Session Manager
 *
 * @author Lennard Fonteijn & Pim Meijer
 */
class SessionManager {

    constructor() {
        try {
            this.session = JSON.parse(localStorage.getItem("session"));
        }
        catch (e) {
            //Do nothing
        }

        if(!this.session) {
            this.session = {};

            this.saveSession();
        }
    }

     get(key) {
        return this.session[key];
    }

     set(key, value) {
         console.log("sessionSet", key, value);

         this.session[key] = value;

         this.saveSession();

         console.log('sessionIs', this.get(key));
     }

     remove(key) {
        delete(this.session[key]);

        this.saveSession();
    }

     clear() {
        this.session = {};

        this.saveSession();
    }

     saveSession() {
        localStorage.setItem("session", JSON.stringify(this.session));
    }

}