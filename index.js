const express = require('express');
const path = require('path');
const app = express();
const session = require('express-session');
const cookieParser = require('cookie-parser');

let PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(session({ secret: "super tajne" }));
app.use('/emoty', express.static(path.join(__dirname, 'static/emoty')));

let users = [];
let messages = [];

app.get('/', (req, res) => {
    if (req.session.nickname) {
        res.redirect('/chat');
    } else {
        res.sendFile(path.join(__dirname + '/views/login.html'))
    }
});

app.get('/chat', (req, res) => {
    if (req.session.nickname) {
        res.sendFile(path.join(__dirname + '/views/index.html'))
    } else {
        res.redirect('/');
    }
});

app.post('/login', (req, res) => {
    console.log(`new player: ${req.body.name}`)
    let inUse = false;
    for (let i = 0; i < users.length; i++) {
        if (users[i].name == req.body.name) {
            inUse = true;
        }
    }
    if (req.body.name == "system") {
        inUse = true;
    }
    if (inUse) {
        res.json({ message: "ten nick jest już zajęty" })
    } else {
        req.session.nickname = req.body.name;
        req.session.color = Math.floor(Math.random() * 16777215).toString(16);
        req.session.msgCount = messages.length;
        console.log(req.session.nickname);
        console.log(req.session.color);
        req.session.number = users.length
        users.push({
            name: req.body.name,
            color: req.session.color
        });
        res.json({ message: "zaraz będziesz na gadał" });
    }
});

app.post("/messages", async function (req, res) {
    let msgCount = messages.length
    let optimize = 0
    while (true) {
        await sleep(100)
        if (optimize == 50 || msgCount != messages.length) {
            if (msgCount < messages.length) {
                res.json({ payload: messages[messages.length - 1] })
            } else {
                res.json({ payload: "no" })
            }
            break
        }
        optimize++;
    }
});
app.post("/send", (req, res) => {
    messages.push({
        text: req.body.message,
        who: users[req.session.number].name,
        color: users[req.session.number].color
    })
    res.sendStatus(200)
});

app.post('/quit', (req, res) => {
    users[req.session.number].name = ""
    req.session.destroy();
    res.json({ message: "kończenie połączenia" })
});

app.post('/nick', (req, res) => {
    let inUse = false;
    for (let i = 0; i < users.length; i++) {
        if (users[i].name == req.body.message) {
            inUse = true;
        }
    }
    if (req.body.message == "system") {
        inUse = true;
    }
    if (inUse) {
        res.json({ message: "nick jest zajęty" })
    } else {
        messages.push({
            text: `${users[req.session.number].name} -> ${req.body.message}`,
            who: "system",
            color: "8d918d"
        })
        users[req.session.number].name = req.body.message;
        res.json({ message: "ok" });
    }
});

app.post('/color', (req, res) => {
    users[req.session.number].color = req.body.message;
});

app.listen(PORT, () => {
    console.log(`:) | robie wzium na: http://localhost:${PORT}`)
});

function sleep(time) {
    return new Promise((resolve, reject) => setTimeout(resolve, time));
};