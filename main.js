//express is the framework we're going to use to handle requests
const express = require('express'); // npm install express
//Create a new instance of express
const app = express();

//path
const path = require('path');

//used to parse POST requests
const bodyParser = require("body-parser"); // npm install body-parser

// for template engine
// npm install ejs

const mysql = require('mysql'); // npm install mysql

app.use(bodyParser.urlencoded({ extended: true })); 
app.engine('html', require('ejs').renderFile);

// con variable for sql connection
let con;

/**
 * Creates a connection.
 */
function newConnection() {
    con = mysql.createConnection({
        host: process.env.HOST,
        user: process.env.USERNAME,
        password: process.env.PASSWORD,
        database: process.env.DATABASE
});
}

/**
 * Closes connection.
 */
function closeConnection() {
    con.end();
}

/**
 * Constant array of month names
 */
const month = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
];

/**
 * Home page
 */
app.get('/', (req, res) => {
    res.render(path.join(__dirname + '/index.html'));
});

/**
 * GET request for suggestion tab
 */
app.get('/suggestions', (req, res) => {
    newConnection();
    var sql = "SELECT * FROM Suggestion;";
    con.query(sql, function(error, result) {
        if (error) {
            throw error;
        }
        let sqlRes = "";
        for(i = result.length - 1; i >= 0; i--) {
            sqlRes += "<h4>" + result[i].Name + "</h4>";
            sqlRes += "<p>" + result[i].Comment + "</p> <hr>"  
        }
        res.render(path.join(__dirname + '/suggestion.html'), {type:"suggestions", result:sqlRes});
        closeConnection();
    });
});

/**
 * POST request for suggestion tab when
 * user submits a comment
 */
app.post('/suggestions', (req, res) => {
    newConnection();
    let name = (req.body.name).substring(0, 99);
    let feedback = (req.body.feedback).substring(0, 999);
    if (name.length == 0) {
        name = "user";
    }
    if (feedback.length != 0) {
        let date = new Date();
        let d = date.getDate();
        let m = month[date.getMonth()];
        let y = date.getFullYear();
        let h = date.getHours();
        let min = date.getMinutes();
        let time = m + " " + d + ", " + y + " " + h + ":" + min;
        var sql = "INSERT INTO Suggestion VALUES (\"" + name + "\"," +
        " \"" + feedback + "\", \"" + time + "\" );";
        con.query(sql, function(error, result) {
            if (error) {
                throw error;
            }
        });
    }
    
    var sql = "SELECT * FROM Suggestion;";
    con.query(sql, function(error, result) {
        if (error) {
            throw error;
        }
        let sqlRes = "";
        for(i = result.length - 1; i >= 0; i--) {

            sqlRes += "<h4>" + result[i].Name + " | " + result[i].Time + "</h4>";
            sqlRes += "<p>" + result[i].Comment + "</p> <hr>"
            
            
        }
        res.render(path.join(__dirname + '/suggestion.html'), {type:"suggestions", result:sqlRes});
        closeConnection();
    });
 
});

/**
 * GET request for warframe tab
 */
app.get('/warframe', (req, res) => {
    newConnection();
    var sql = "SELECT * FROM Warframe;";
    con.query(sql, function(error, result) {
        if (error) {
            throw error;
        }
        let sqlRes = "";
        for(i = 0; i < result.length; i++) {
            let link = "<form action=\"http://bestgio-445-project.herokuapp.com/warframe\" method=\"POST\">" + 
            " <input type=\"submit\" name=\"name\" value=\"" + result[i].Name + "\">" +
            " </form>";
            sqlRes += link + "<br />";
        }
        res.render(path.join(__dirname + '/list.html'), {type:"Warframes", result:sqlRes});
        closeConnection();
    });
});

/**
 * POST request for warframe tab
 */
app.post('/warframe', (req, res) => {
    newConnection();
    var sql = "SELECT Name, Description, Type FROM Warframe WHERE Name =\"" +
                req.body.name + "\";";
    let sqlRes;
    con.query(sql, function(error, result) {
        if (error) {
            throw error;
        }
        sqlRes = result[0];
        
    });
    var sql2 = "SELECT * FROM warframe_component WHERE Name =\"" + req.body.name + "\";";
    let sqlRes2 = "";
    con.query(sql2, function(error, result) {
        if (error) {
            throw error;
        }
        
        for (i = 0; i < result.length; i++) {
            let link = "<form action=\"http://bestgio-445-project.herokuapp.com/relic\" method=\"POST\">" + 
            " <input type=\"submit\" name=\"name\" value=\"" + result[i].RelicName + "\">" +
            " </form>";
            sqlRes2 += "<p>" + result[i].ComponentName + ": " + link +  "</p>";
        }
        res.render(path.join(__dirname + '/info.html'), {name:sqlRes.Name, 
                                                                type:sqlRes.Type, 
                                                                description:sqlRes.Description,
                                                                component:sqlRes2});
        closeConnection();
    });
});

/**
 * GET request for weapon tab
 */
app.get('/weapon', (req, res) => {
    newConnection();
    var sql = "SELECT * FROM Weapon;";
    
    con.query(sql, function(error, result) {
        if (error) {
            throw error;
        }
        let sqlRes = "";
        for(i = 0; i < result.length; i++) {
            let link = "<form action=\"http://bestgio-445-project.herokuapp.com/weapon\" method=\"POST\">" + 
            " <input type=\"submit\" name=\"name\" value=\"" + result[i].Name + "\">" +
            " </form>";
            sqlRes += link + "<br />";
        }
        res.render(path.join(__dirname + '/list.html'), {type:"Weapons", result:sqlRes});
        closeConnection();
    });
});

/**
 * POST request for weapon tab
 */
app.post('/weapon', (req, res) => {
    newConnection();
    var sql = "SELECT Name, Description, Type FROM Weapon WHERE Name =\"" +
                req.body.name + "\";";
    let sqlRes;
    con.query(sql, function(error, result) {
        if (error) {
            throw error;
        }
        sqlRes = result[0];
        
    });
    var sql2 = "SELECT * FROM weapon_component WHERE Name =\"" + req.body.name + "\";";
    let sqlRes2 = "";
    con.query(sql2, function(error, result) {
        if (error) {
            throw error;
        }
        for (i = 0; i < result.length; i++) {
            let link = "<form action=\"http://bestgio-445-project.herokuapp.com/relic\" method=\"POST\">" + 
            " <input type=\"submit\" name=\"name\" value=\"" + result[i].RelicName + "\">" +
            " </form>";
            sqlRes2 += "<p>" + result[i].ComponentName + ": " + link +  "</p>";
        }
        res.render(path.join(__dirname + '/info.html'), {name:sqlRes.Name, 
                                                                type:sqlRes.Type, 
                                                                description:sqlRes.Description,
                                                                component:sqlRes2});
        closeConnection();
    });
});

/**
 * GET request for archwing tab
 */
app.get('/archwing', (req, res) => {
    newConnection();
    var sql = "SELECT * FROM Archwing;";
    
    con.query(sql, function(error, result) {
        if (error) {
            throw error;
        }
        let sqlRes = "";
        for(i = 0; i < result.length; i++) {
            let link = "<form action=\"http://bestgio-445-project.herokuapp.com/archwing\" method=\"POST\">" + 
            " <input type=\"submit\" name=\"name\" value=\"" + result[i].Name + "\">" +
            " </form>";
            sqlRes += link + "<br />";
        }
        res.render(path.join(__dirname + '/list.html'), {type:"Archwings", result:sqlRes});
        closeConnection();
    });
});

/**
 * POST request for archwing
 */
app.post('/archwing', (req, res) => {
    newConnection();
    var sql = "SELECT Name, Description, Type FROM Archwing WHERE Name =\"" +
                req.body.name + "\";";
    let sqlRes;
    con.query(sql, function(error, result) {
        if (error) {
            throw error;
        }
        sqlRes = result[0];
        
    });
    var sql2 = "SELECT * FROM archwing_component WHERE Name =\"" + req.body.name + "\";";
    let sqlRes2 = "";
    con.query(sql2, function(error, result) {
        if (error) {
            throw error;
        }
        for (i = 0; i < result.length; i++) {
            let link = "<form action=\"http://bestgio-445-project.herokuapp.com/relic\" method=\"POST\">" + 
            " <input type=\"submit\" name=\"name\" value=\"" + result[i].RelicName + "\">" +
            " </form>";
            sqlRes2 += "<p>" + result[i].ComponentName + ": " + link +  "</p>";
        }
        res.render(path.join(__dirname + '/info.html'), {name:sqlRes.Name, 
                                                                type:sqlRes.Type, 
                                                                description:sqlRes.Description,
                                                                component:sqlRes2});
        closeConnection();
    });
});

/**
 * GET request for companion tab
 */
app.get('/companion', (req, res) => {
    newConnection();
    var sql = "SELECT * FROM Companion;";
    
    con.query(sql, function(error, result) {
        if (error) {
            throw error;
        }
        let sqlRes = "";
        for(i = 0; i < result.length; i++) {
            let link = "<form action=\"http://bestgio-445-project.herokuapp.com/companion\" method=\"POST\">" + 
            " <input type=\"submit\" name=\"name\" value=\"" + result[i].Name + "\">" +
            " </form>";
            sqlRes += link + "<br />";
        }
        res.render(path.join(__dirname + '/list.html'), {type:"Companions", result:sqlRes});
        closeConnection();
    });
});

/**
 * POST request for companion
 * This provides link handling
 */
app.post('/companion', (req, res) => {
    newConnection();
    var sql = "SELECT Name, Description, Type FROM Companion WHERE Name =\"" +
                req.body.name + "\";";
    let sqlRes;
    con.query(sql, function(error, result) {
        if (error) {
            throw error;
        }
        sqlRes = result[0];
        
    });
    var sql2 = "SELECT * FROM companion_component WHERE Name =\"" + req.body.name + "\";";
    let sqlRes2 = "";
    con.query(sql2, function(error, result) {
        if (error) {
            throw error;
        }
        for (i = 0; i < result.length; i++) {
            let link = "<form action=\"http://bestgio-445-project.herokuapp.com/relic\" method=\"POST\">" + 
            " <input type=\"submit\" name=\"name\" value=\"" + result[i].RelicName + "\">" +
            " </form>";
            sqlRes2 += "<p>" + result[i].ComponentName + ": " + link +  "</p>";
        }
        res.render(path.join(__dirname + '/info.html'), {name:sqlRes.Name, 
                                                                type:sqlRes.Type, 
                                                                description:sqlRes.Description,
                                                                component:sqlRes2});
        closeConnection();
    });
});

/**
 * GET request for relic
 */
app.get('/relic', (req, res) => {
    newConnection();
    var sql = "SELECT * FROM Relic;";
    
    con.query(sql, function(error, result) {
        if (error) {
            throw error;
        }
        let sqlRes = "";
        for(i = 0; i < result.length; i++) {
            let link = "<form action=\"http://bestgio-445-project.herokuapp.com/relic\" method=\"POST\">" + 
            " <input type=\"submit\" name=\"name\" value=\"" + result[i].RelicName + "\">" +
            " </form>";
            sqlRes += link + "<br />";
        }
        res.render(path.join(__dirname + '/list.html'), {type:"Relics", result:sqlRes});
        closeConnection();
    });
});

/**
 * POST request for relic
 * This provides link handling
 */
app.post('/relic', (req, res) => {
    newConnection();
    var sql = "SELECT * FROM Location WHERE RelicName =\"" + req.body.name + "\";";
    let sqlRes = "";
    con.query(sql, function(error, result) {
        if (error) {
            throw error;
        }
       
        sqlRes = result[0];
        res.render(path.join(__dirname + '/relicInfo.html'), {name:sqlRes.RelicName, 
                                                                mission:sqlRes.Mission, 
                                                                tier:sqlRes.Tier,
                                                                rotation:sqlRes.Rotation,
                                                                chance:sqlRes.Chance});
        closeConnection();
    });
});

/**
 * POST search request to 
 * handle searching feature
 */
app.post('/search', (req, res) => {
    newConnection();
    var search = req.body.search;
    var sql = "SELECT Name" + 
    " FROM( " + 
        "SELECT Name FROM Warframe where Warframe.Name like \"%" + search + "%\" " + 
        "UNION " +
        "SELECT Name FROM Weapon where Weapon.Name like \"%" + search + "%\" " +
        "UNION " +
        "SELECT Name FROM Archwing where Archwing.Name like \"%" + search + "%\" " +
        "UNION " +
        "Select Name From Companion where Companion.Name like \"%" + search + "%\" " +
        "UNION " + 
        "SELECT RelicName AS Name from Relic where relic.RelicName like \"%" + search + "%\" " +
    ") A;";
    con.query(sql, async function(error, result) {
        if (error) {
            throw error;
        }

        let sqlRes = "";
        for(i = 0; i < result.length; i++) {
            let type = await determine(result[i].Name);
            let link = "<form action=\"http://bestgio-445-project.herokuapp.com/" + type + "\" method=\"POST\">" + 
            " <input type=\"submit\" name=\"name\" value=\"" + result[i].Name + "\">" +
            " </form>";
            sqlRes += link + "<br />";
        }

        res.render(path.join(__dirname + '/search.html',), {result:sqlRes, search:search});
        closeConnection();
    });
});

/**
 * Runs the server
 */
app.listen(process.env.PORT || 5000, () => {
    console.log("Server up and running on port: " + (process.env.PORT || 5000));
});

/**
 * Specifies what item type the user just clicked. 
 * @param {resulting query} result
 */
function determine(result) {
    return new Promise(function(resolve, reject) {
        let sql = "SELECT * FROM Warframe WHERE Name =\"" + result + "\";";
        con.query(sql, function(error, result) {
            if (error) {
                throw error;
            }
            if (result.length != 0) {
                resolve("warframe");
            }
        });
        sql = "SELECT * FROM Weapon WHERE Name =\"" + result + "\";";
        con.query(sql, function(error, result) {
            if (error) {
                throw error;
            }
            if (result.length != 0) {
                resolve("weapon");
            }
        });
        sql = "SELECT * FROM Archwing WHERE Name =\"" + result + "\";";
        con.query(sql, function(error, result) {
            if (error) {
                throw error;
            }
            if (result.length != 0) {
                resolve("archwing");
            }
        });
        sql = "SELECT * FROM Companion WHERE Name =\"" + result + "\";";
        con.query(sql, function(error, result) {
            if (error) {
                throw error;
            }
            if (result.length != 0) {
                resolve("companion");
            }
        });
        sql = "SELECT * FROM Relic WHERE RelicName=\"" + result + "\";";
        con.query(sql, function(error, result) {
            if (error) {
                throw error;
            }
            if (result.length != 0) {
                resolve("relic");
            }
        });
    })
    
}