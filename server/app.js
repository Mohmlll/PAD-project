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
    const email = req.body.email;
    const password = cryptoHelper.getHashedPassword(req.body.password);

    db.handleQuery(connectionPool, {
        query: "SELECT id, email, password FROM user WHERE email = ? AND password = ?",
        values: [email, password]
    }, (data) => {
        console.log(data);
        console.log(data);
        if (data.length === 1) {
            //return just the email for now, never send password back!
            res.status(httpOkCode).json({email: data[0].email, id: data[0].id});
        } else {
            //wrong email
            res.status(authorizationErrCode).json({reason: "Wrong email or password", values:[password, email]});
        }

    }, (err) => res.status(badRequestCode).json({reason: err}));
});
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

app.post("/game", function (req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(badRequestCode).json({ reason: "No files were uploaded." });
    }
    let sampleFile = req.files.sampleFile;
    let filename = sampleFile.name;
    let extension = filename.split(".").pop();
    let picName = req.body.id_game;
    let path = wwwrootPathUpload + "uploads/"+ picName + "." + extension;

    // return res.status(badRequestCode).json({  request: path });

    sampleFile.mv(path, function (err) {
        if (err) {
            return res.status(badRequestCode).json({reason: err});
        }
        db.handleQuery(connectionPool, {
            query: "insert into game(name, description, rules, target_audience_min, target_audience_max, type, amount_players, differentiates_easy, differentiates_hard) values(?,?,?,?,?,?,?,?,?)",
            values: [req.body.name, req.body.description, req.body.rules, req.body.audienceMin, req.body.audienceMax, req.body.type, req.body.amountStudents, req.body.difEasy, req.body.difHard]
        }, (data) => {
            res.json({data})
        }, (err) => {
            console.log(err);
            res.json({message: "F"})
        });
    });
});

app.post("/gameInfo", (req, res) => {
    db.handleQuery(connectionPool, {
        query: "SELECT * FROM game WHERE id_game = ?",
        values: [req.body.id_game]
    }, data => {
        res.json(data);
    }, err => {
        res.json({message: "noooope"})
    })
})
app.post("/gameInfoMaterials", (req, res) => {
    db.handleQuery(connectionPool, {
        query: "SELECT * FROM game_has_material WHERE game_id_game = ?",
        values: [req.body.game_id_game]
    }, data => {
        res.json(data);
    }, err => {
        res.json({message: "noooope"})
    })
})

app.post('/register', (req, res) => {
    const password = req.body.password;
    let hashedPassword = cryptoHelper.getHashedPassword(password);

    db.handleQuery(connectionPool, {
        query: "INSERT INTO user(email, password, lastname, firstname, birthdate, school, country) values(?,?,?,?,?,?,?)",
        values: [req.body.email, hashedPassword, req.body.firstname, req.body.lastname, req.body.birthdate, req.body.schoolName, req.body.country]
    }, data => {
        res.json(data);
    }, err => {
        console.log(err);
        res.json({message: "F"})
    })

})

app.post('/duplicateCheck', (req, res) => {
    const email = req.body.email;

    db.handleQuery(connectionPool, {
        query: "SELECT email FROM user WHERE email = ?",
        values: [email.toLowerCase()]
    }, data => {
        res.json(data);

    }, err => {
        res.status(500);
        res.json({
            message: err.message
        })
    });
});

app.get('/game', (req, res) => {
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
app.get('/newGameListLimit3', (req, res) => {
    db.handleQuery(connectionPool, {
        query: "select * from game order by id_game desc limit 3"
    }, d => {
        res.json(d);
    }, err => {
        res.status(500);
        res.json({
            message: err.message
        })
    });
});

app.get('/material', (req, res) => {
    db.handleQuery(connectionPool, {
        query: "select * from material"
    }, d => {
        res.json(d);
    }, err => {
        res.status(500);
        res.json({
            message: err.message
        })
    });
});
app.get('/materials', (req, res) => {
    db.handleQuery(connectionPool, {
        query: "select * from game_has_material"
    }, d => {
        res.json(d);
    }, err => {
        res.status(500);
        res.json({
            message: err.message
        })
    });
});
app.get('/displayMaterials', (req, res) => {
    db.handleQuery(connectionPool, {
        query: "select * from game_has_material inner join material on game_has_material.material_id = material.id"
    }, d => {
        res.json(d);
    }, err => {
        res.status(500);
        res.json({
            message: err.message
        })
    });
});


app.get('/audience', (req, res) => {
    db.handleQuery(connectionPool, {
        query: "select * from audience"
    }, d => {
        res.json(d);
    }, err => {
        res.status(500);
        res.json({
            message: err.message
        })
    });
});

app.get('/gametype', (req, res) => {
    db.handleQuery(connectionPool, {
        query: "select * from type"
    }, d => {
        res.json(d);
    }, err => {
        res.status(500);
        res.json({
            message: err.message
        })
    });
});


app.post('/materials', (req, res) => {
    db.handleQuery(connectionPool, {
        query: "insert into game_has_material(game_id_game, material_id, amount) values(?,?,?)",
        values: [req.body.game, req.body.material, req.body.amount]
    }, (data) => {
        res.json({data})
    }, (err) => {
        console.log(err);
        res.json({message: "F"})
    });
});

app.post('/rating', (req, res) => {
    db.handleQuery(connectionPool, {
        query: "insert into rating(id_user, id_game, rating) values(?,?,?)",
        values: [req.body.id_user, req.body.id_game, req.body.rating]
    }, (data) => {
        res.json({data})
    }, (err) => {
        console.log(err);
        res.json({message: "F"})
    });
});


// app.post('/game', (req, res) => {
//     db.handleQuery(connectionPool, {
//         query: "insert into game(name, description, rules, target_audience_min, target_audience_max, type, amount_players, differentiates_easy, differentiates_hard) values(?,?,?,?,?,?,?,?,?)",
//         values: [req.body.name, req.body.description, req.body.rules, req.body.audienceMin, req.body.audienceMax, req.body.type, req.body.amountStudents, req.body.difEasy, req.body.difHard]
//     }, (data) => {
//         res.json({data})
//     }, (err) => {
//         console.log(err);
//         res.json({message: "F"})
//     });
// });

//------- END ROUTES -------

module.exports = app;