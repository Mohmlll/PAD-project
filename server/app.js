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
const helper = require("./utils/helper");
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
        query: "SELECT * FROM user WHERE email = ? AND password = ?",
        values: [email, password]
    }, (data) => {
        if (data.length === 1) {
            //return just the email for now, never send password back!
            res.status(httpOkCode).json(data[0]);
        } else {
            //wrong email
            res.status(authorizationErrCode).json({reason: "Wrong email or password", values: [password, email]});
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
    let diff_titles = req.body['diffs[]'];
    let diff_descriptions = req.body['diffs_descriptions[]'];
    let raw_rules = req.body['rules[]'];

    if (typeof diff_titles === 'string')
        diff_titles = [diff_titles];

    if (typeof diff_descriptions === 'string')
        diff_descriptions = [diff_descriptions];

    if (typeof raw_rules === 'string')
        raw_rules = [raw_rules];

    const rules = JSON.stringify(raw_rules);
    const diffs = JSON.stringify(diff_titles.map(function (x, i) {
        return [x, diff_descriptions[i]]
    }));

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(badRequestCode).json({reason: "No files were uploaded."});
    }

    // game icon
    let gameIcon = req.files['game-icon'];
    let gameIconPath = `${wwwrootPathUpload}/uploads/${helper.randomImageString()}_gameIcon.${gameIcon.name.split(".").pop()}`

    // game plan
    let gamePlan = req.files['game-plan'];
    let gamePlanPath = `${wwwrootPathUpload}/uploads/${helper.randomImageString()}_gamePlan.${gamePlan.name.split(".").pop()}`
    gameIcon.mv(gameIconPath, function (err) {
        if (err) {
            return res.status(badRequestCode).json({reason: err});
        }
        gamePlan.mv(gamePlanPath, function (err) {
            if (err) {
                return res.status(badRequestCode).json({reason: err});
            }



            db.handleQuery(connectionPool, {
                query: "insert into game(name, description, target_audience_min, target_audience_max, type, amount_players, game_icon, game_plan, rules, diffs) values(?,?,?,?,?,?,?,?,?,?)",
                values: [req.body.name, req.body.description, req.body['target-audience-min'], req.body['target-audience-max'], req.body.type, req.body['min-players'], "."+gameIconPath, "."+gamePlanPath, rules, diffs]
                }, (data) => {
                    res.json({data})
                },
            );
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
app.get("/getAllInfoMaterials", (req, res) => {
    db.handleQuery(connectionPool, {
        query: "SELECT * FROM game_has_material",
        values: [req.body.game_id_game]
    }, data => {
        res.json(data);
    }, err => {
        res.json({message: "noooope"})
    })
})

app.post('/register', async (req, res) => {
    const password = req.body.password;
    let hashedPassword = cryptoHelper.getHashedPassword(password);
    const user = await helper.user.getByEmail(req.body.email);
    if (user) {
        res.json({status: 404, message: "Dit email adres is al in gebruik"})
    }
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

app.post('/duplicateCheck', async (req, res) => {
    const user = await helper.user.getByEmail(req.body.email);

    if (user){
        res.json(user);
    } else {
        res.json({status: 404, message: "Dit email adres is niet bij ons bekend."})
    }
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

app.get('/popularGames', (req, res) => {
    db.handleQuery(connectionPool, {
        query: "SELECT game.*, avg(rating.rating) AS rating\n" +
            "FROM game\n" +
            "INNER JOIN rating\n" +
            "ON game.id_game = rating.id_game\n" +
            "order by rating DESC;"
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
app.get('/clickGameListLimit3', (req, res) => {
    db.handleQuery(connectionPool, {
        query: "select *, count(*) as totalClicks from game g left join click c on g.id_game = c.id_game group by g.id_game order by totalClicks desc limit 3"
    }, d => {
        res.json(d);
    }, err => {
        res.status(500);
        res.json({
            message: err.message
        })
    });
});
app.get('/ratingGameListLimit3', (req, res) => {
    db.handleQuery(connectionPool, {
        query: "select *, avg(rating) as avgRating from game g left join rating r on g.id_game = r.id_game group by g.id_game order by avgRating desc limit 3"
    }, d => {
        res.json(d);
    }, err => {
        res.status(500);
        res.json({
            message: err.message
        })
    });
});
app.post('/favGameListLimit3', (req, res) => {
    db.handleQuery(connectionPool, {
        query: "select * from game g inner join favorite f on g.id_game = f.id_game where f.id_user = ? order by g.id_game limit 3",
        values: [req.body.id_user]
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


app.post('/click', (req, res) => {
    db.handleQuery(connectionPool, {
        query: "insert into click(id_user, id_game, click) values(?,?,?)",
        values: [req.body.id_user, req.body.id_game, req.body.click]
    }, (data) => {
        res.json({data})
    }, (err) => {
        console.log(err);
        res.json({message: "/click doesnt work"})
    });
});
app.post('/fav', (req, res) => {
    db.handleQuery(connectionPool, {
        query: "insert into favorite(id_user, id_game) values(?,?)",
        values: [req.body.id_user, req.body.id_game]
    }, (data) => {
        res.json({data})
    }, (err) => {
        console.log(err);
        res.json({message: "/fav doesnt work"})
    });
});
app.post('/favDelete', (req, res) => {
    db.handleQuery(connectionPool, {
        query: "delete from favorite where id_user = ? and id_game = ?",
        values: [req.body.id_user, req.body.id_game]
    }, (data) => {
        res.json({data})
    }, (err) => {
        console.log(err);
        res.json({message: "/favDelete doesnt work"})
    });
});

app.post('/favCheck', (req, res) => {
    db.handleQuery(connectionPool, {
        query: "select * from favorite where id_game = ? AND id_user = ?",
        values: [req.body.id_game, req.body.id_user]
    }, (data) => {
        res.json({data})
    }, (err) => {
        console.log(err);
        res.json({message: "/favCheck doesnt work"})
    });
});
app.post('/getRating', (req, res) => {
    db.handleQuery(connectionPool, {
        query: "select rating from rating where id_game = ? AND id_user = ?",
        values: [req.body.id_game, req.body.id_user]
    }, (data) => {
        res.json({data})
    }, (err) => {
        console.log(err);
        res.json({message: "/getRating doesnt work"})
    });
});

app.post('/clickCheck', (req, res) => {
    db.handleQuery(connectionPool, {
        query: "select click from click where id_game = ? AND id_user = ?",
        values: [req.body.id_game, req.body.id_user]
    }, (data) => {
        res.json({data})
    }, (err) => {
        console.log(err);
        res.json({message: "/clickCheck doesnt work"})
    });
});

app.post('/rating', (req, res) => {
    db.handleQuery(connectionPool, {
        query: "insert into rating(id_user, id_game, rating) values(?,?,?) ON DUPLICATE KEY update rating = ?",
        values: [req.body.id_user, req.body.id_game, req.body.rating, req.body.rating]
    }, (data) => {
        res.json({data})
    }, (err) => {
        console.log(err);
        res.json({message: "/rating doesnt work"})
    });
});

app.post('/ratings', (req, res) => {
    db.handleQuery(connectionPool, {
        query: "select avg(rating) as average, count(*) as total, rating from rating where id_game = ?",
        values: [req.body.id_game]
    }, (data) => {
        console.log("Query success")
        res.json({data})
    }, (err) => {
        console.log(err);
        res.json({message: "/ratings doesnt work"})
    });
});
app.post('/clicks', (req, res) => {
    db.handleQuery(connectionPool, {
        query: "select count(*) as totalClicks from click where id_game = ?",
        values: [req.body.id_game]
    }, (data) => {
        console.log("Query success")
        res.json({data})
    }, (err) => {
        console.log(err);
        res.json({message: "/clicks doesnt work"})
    });
});
app.post('/deleteGame', (req, res) => {
    db.handleQuery(connectionPool, {
        query: "delete from game where id_game = ?",
        values: [req.body.id_game]
    }, (data) => {
        res.json({data})
    }, (err) => {
        console.log(err);
        res.json({message: "/delete doesnt work"})
    });

});
app.post('/editGame', (req, res) => {
    db.handleQuery(connectionPool, {
        query: "update game where id_game = ? set name = ?, description = ? , target_audience_min = ?, target_audience_max = ?, type= ?, amount_players = ?, game_plan = ?, game_icon = ?, rules = ? ",
        values: [req.body.id_game, req.body.name,req.body.description,req.body.target_audience_min,req.body.target_audience_max,req.body.type,req.body.amount_players,req.body.game_plan, req.body.game_icon, req.body.rules]
    }, (data) => {
        res.json({data})
    }, (err) => {
        console.log(err);
        res.json({message: "/fav doesnt work"})
    });
});

app.post('/validateToken', async (req, res) => {
    const token = req.body.token;

    const valid = await helper.user.findValidToken(token);

    if (!valid.user_id)
        return res.json({status: 404, message: "Token niet gevonden."})

    const user = await helper.user.getById(valid.user_id)

    if (!user)
        return res.json({status: 404, message: "Er is iets fout gegaan."})

    return res.json({status: 200, user: user})
});

app.post('/resetPassword', async (req, res) => {
    const email = req.body.email;
    const user = await helper.user.getByEmail(email);

    if (!user)
        return res.json({status: 404, message: "Dit email adres is niet bij ons bekend."})

    const token = await helper.user.createResetToken(user);

    if (!token)
        return res.json({status: 400, message: "Er is iets fout gegaan."})

    const message = {
        "from": {
            "name": "Limitless Jungle",
            "address": "no-reply@limitlessjungle.nl"
        },
        "to": [
            {
                "name": user.name,
                "address": email,
            }
        ],
        "subject": "Wachtwoord opnieuw instellen",
        "html": `Code: ${token}`
    };

    const mailed = await helper.mailer.sendEmail(message);

    if (mailed) {
        return res.json({status: 200, user: user})
    } else {
        return res.json({status: 400, message: "Er is iets fout gegaan."})
    }
});
app.get("/users", (req, res) => {
    db.handleQuery(connectionPool, {
        query: "select * from user"
    }, data => {
        res.json(data);
    }, err => {
        res.json({message: "get users failed"})
    })
})

app.post('/deleteUser', (req, res) => {
    db.handleQuery(connectionPool, {
        query: "delete from user where id = ?",
        values: [req.body.id]
    }, (data) => {
        res.json({data})
    }, (err) => {
        console.log(err);
        res.json({message: "/deleteUser doesnt work"})
    });
});

app.post('/editRole', (req, res) => {
    db.handleQuery(connectionPool, {
        query: "UPDATE user SET user.right = ? WHERE id = ?",
        values: [ req.body.right, req.body.id]
    }, (data) => {
        res.json({data})
        console.log(data)
    }, (err) => {
        console.log(err);
        res.json({message: "/edit role doesnt work"})
    });
});

//------- END ROUTES -------

module.exports = app;
