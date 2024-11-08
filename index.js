const express = require('express');
const path = require('path');

const jwt = require('jsonwebtoken')

const {open} = require('sqlite');
const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');
const cors = require('cors');

const dbPath = path.join(__dirname, 'mydb.db');

const app = express()
app.use(cors()); 
app.use(express.json())
app.use((req, res, next) => {
    if (req.url === '/favicon.ico') {
        // Ignore favicon requests or handle them as needed
        res.status(204).end(); // Respond with no content
    } else {
        next(); // Pass control to the next middleware/route handler
    }
});

let db = null;

const initializeDBAndServer = async () => {
    try{
        db = await open({
            filename : dbPath,
            driver : sqlite3.Database
        })
        app.listen(3002, () => {
            console.log("Server Running At http://localhost:3002");
        })
    }catch (e){
        console.log(`DATABASE ERROR ${e.message}`);
        process.exit(0);
    }
}

initializeDBAndServer()

app.get("/", (requset, response) => {
    response.sendFile("helllo.html", {root:__dirname})
//   try {
//     response.json({ message: 'Hello from Node.js!' });
// } catch (error) {
//   console.error(error);
//   response.status(500).json({ error: 'Internal Server Error' }); // Return JSON on error
// }

})

app.get("/createuser/", (requset, response) => {
    response.sendFile("createuser.html", {root:__dirname})
})

// app.get('/:id', async (request, responce) => {
//     const {id} = request.params;
//     // console.log(id)
//     const getNameQuery = 
// //     `CREATE TABLE user (
// //         id INTEGER
// //         name VARCHAR(200),
// //         user_name VARCHAR(200),
// //         password VARCHAR(200)
// //       );
// // `

//     `
//         SELECT 
//             * 
//         FROM 
//             USER
//             ;`;

//         // WHERE 
//         //     ID = ${id}
//     const name = await db.all(getNameQuery);
//     responce.send(name);
// })

app.post('/login/', async(request, response) => {
    const {username, password} = request.body;

    // const hashedPassword = await bcrypt.hash(request.body.password, 10);
    // const hashedPassword = await bcrypt.hash("gayathre@123", 10);
    // console.log("password : ", hashedPassword)
    
    // response.send({hashedPassword})

    const getUserQuery = `SELECT * FROM user WHERE username = "${username}";`
    const dbUser = await db.get(getUserQuery);

    if (dbUser === undefined){
        response.send({"user": "Invalid User"})
    }else{
        const isPasswordMatched = await bcrypt.compare(password, dbUser.password);

        if(isPasswordMatched){
            const payload = { username: username };
            const jwtToken = await jwt.sign(payload, "MY_SECRET_TOKEN");
            // console.log(jwtToken);
            response.send({ jwtToken, name : dbUser.name });
        }else{
            response.send({"password":"Invalid Password"})
        }
    }
})

app.post("/user/", async (request, response) => {
    const {name, username, password, gender} = request.body;

    // console.log(options)

      const hashedPassword = await bcrypt.hash(password, 10);

    // response.send(request.body)

    const getUserQuery = `SELECT username, password FROM user WHERE username = "${username}";`
    const dbUser = await db.get(getUserQuery);

    if(dbUser === undefined){

        const putUserQuery = `INSERT INTO user (name, password, username, gender) VALUES ('${name}', '${hashedPassword}', '${username}', '${gender}');`

        const dbResponse = await db.run(putUserQuery);
        const newUserId = dbResponse.lastID;
        response.send({response : `Created new user with user ID : ${newUserId}`});

    }else{
        response.send({"user":"User allready existing"});
    }
})
            
            













// TO KNOW THE NO. OF TABLE IN A DB USE QUARY

// sqlite> .tables                                      
// user             user_login_info

// sqlite> PRAGMA TABLE_INFO(user_login_info);
// 0|name|varchar(200)|0||0
// 1|username|varchar(200)|0||0
// 2|password||0||0
// 3|gender|varchar(100)|0||0
// 4|mailid|varchar(200)|0||0
// sqlite> 









// |vamshi|$2b$10$AlUM6KVv..F1kV.xdNRT6uYMyAMO7E.GXRYm4cSPmeXYSVi6S52uy||