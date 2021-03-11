/**
 * Server application - contains all server config and api endpoints
 *
 * @author Pim Meijer
 */
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const db = require("./utils/databaseHelper");
const cryptoHelper = require("./utils/cryptoHelper");
const corsConfig = require("./utils/corsConfigHelper");
const app = express();
const fileUpload = require("express-fileupload");

//logger lib  - 'short' is basic logging info
app.use(morgan("short"));

//init mysql connectionpool
const connectionPool = db.init();

//parsing request bodies from json to javascript objects
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//CORS config - Cross Origin Requests
app.use(corsConfig);

//File uploads
app.use(fileUpload());

// ------ ROUTES - add all api endpoints here ------
const httpOkCode = 200;
const badRequestCode = 400;
const authorizationErrCode = 401;

app.post("/user/login", (req, res) => {
    const username = req.body.username;

    //TODO: We shouldn't save a password unencrypted!! Improve this by using cryptoHelper :)
    const password = req.body.password;

    db.handleQuery(connectionPool, {
        query: "SELECT username, password FROM user WHERE username = ? AND password = ?",
        values: [username, password]
    }, (data) => {
        if (data.length === 1) {
            //return just the username for now, never send password back!
            res.status(httpOkCode).json({"username": data[0].username});
        } else {
            //wrong username
            res.status(authorizationErrCode).json({reason: "Wrong username or password"});
        }

    }, (err) => res.status(badRequestCode).json({reason: err}));
});
// app.get('/register', (req, res) => {
//     db.handleQuery(connectionPool, {
//         query: "INSERT INTO id, email, password FROM user",
//         values: [id, req.body.emailadres, req.body.passwordRegister]
//     }, r => {
//
//         res.json({});
//     }, (err) => {
//         console.log(err);
//         res.status(500);
//         res.json({
//             message: err.message
//         })
//     });
// });
//dummy data example - rooms
app.post("/room_example", (req, res) => {

    db.handleQuery(connectionPool, {
            query: "SELECT id, surface FROM room_example WHERE id = ?",
            values: [req.body.id]
        }, (data) => {
            //just give all data back as json
            res.status(httpOkCode).json(data);
        }, (err) => res.status(badRequestCode).json({reason: err})
    );

});

app.post("/upload", function (req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(badRequestCode).json({reason: "No files were uploaded."});
    }

    let sampleFile = req.files.sampleFile;

    sampleFile.mv(wwwrootPath + "/uploads/test.jpg", function (err) {
        if (err) {
            return res.status(badRequestCode).json({reason: err});
        }

        return res.status(httpOkCode).json("OK");
    });
});

app.get("/rooms", (req, res) => {
    db.handleQuery(connectionPool, {
        query: "select * from room_example"
    }, data => {
        res.json(data);
    }, err => {
        res.json({message: "noooope"})
    })
})

app.get('/register', (req, res) => {
    db.handleQuery(connectionPool, {
        query: "INSERT INTO room_example(surface) values(5)"
        // values: ["Yusuf"]
    }, data => {
        res.json(data);
    }, err => {
        console.log(err);
        res.json({message: "f"})
    })

})


app.get('/games', (req, res) => {
    db.handleQuery(connectionPool, {
        query: "select * from game"
    }, d => {
        res.json(d);
    }, err => {
        res.status(500);
        res.json({
            message: err.message
        })
    });
});

app.get('/games/:id', (req, res) => {
    db.handleQuery(connectionPool, {
        query: "select * from game where id=?",
        values: [req.params.id]
    }, d => {
        if (d.length === 0) {
            res.status(404);
            res.message(`Game with id ${req.params.id} not found`);
        } else {
            res.json(d[0]);
        }
    }, err => {
        console.error(err);
        res.status(500);
        res.json({
            message: err.message
        })
    });
});

app.post('/games', (req, res) => {
    db.handleQuery(connectionPool, {
        query: "insert into game(name, description, rules, target_audience, type, amount_players) values(?, ?)",
        // values: [req.body.name, req.body.description, req.body.materials, req.body.rules, req.body.difEasy, req.body.difHard, req.body.targetAudience, req.body.gameType, req.body.amountStudents]
        values: [req.body.name, req.body.description, req.body.rules, req.body.targetAudience, req.body.type, req.body.amountStudents]
    }, (data) => {
        res.json({data})
    }, (err) => {
        console.log(err);
        res.json({message: "F"})
    });
});

app.post('/register', (req, res) => {
    db.handleQuery(connectionPool, {
        query: "INSERT INTO user(email, password, firstname, lastname, birthdate, school, country) values(?,?,?,?,?,?,?)",
        values: [req.body.email, req.body.password, req.body.firstname, req.body.lastname, req.body.birthdate, req.body.schoolName, req.body.country]
    }, data => {
        res.json(data);
    }, err => {
        console.log(err);
        res.json({message: "F"})
    })

})

//------- END ROUTES -------

module.exports = app;

