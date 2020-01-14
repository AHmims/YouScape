const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const fsExtra = require('fs-extra');
const Path = require('path');
// 
let connections = 0,
    set = 1,
    localTime = 2700, //2700 = 45min x 60sec
    users = [];
let timerInter;
// 
let jsonPath = Path.join(__dirname, "/res/data/data.json");
const _ENIGMES = fsExtra.readJSONSync(jsonPath);

/*const _TEMPLATE = {
    group: "",
    progress: [],
    mistakes: []
}*/
// 
app.use('/res', express.static(__dirname + '/res'));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/res/html/index.html');
});
// 
io.sockets.on("connection", (socket) => {
    connections++;
    // console.log();
    console.log(`cc ${socket.id}`);
    console.log(`CONNECTED | Totall : ${connections}`);
    // console.log(users);
    // 
    socket.on("NewGroup", (session) => {
        if (users.length < 4) {
            const _TEMPLATE = {
                socketId: socket.id,
                group: session,
                progress: [],
                mistakes: [],
                time: localTime
            }
            // socket.emit('TimeUpdate', _TEMPLATE.time);
            users.push(_TEMPLATE);
        } else
            accessDenied("Max Number of Users is 4", "session", socket);
    });
    // 
    socket.on("refreshSession", (session) => {
        for (let i = 0; i < users.length; i++) {
            if (users[i].group = session)
                users[i].socketId = socket.id;
        }
        console.log(`cc ${socket.id}`);
    });
    // 
    socket.on("getForm", (session) => {
        // if (true)
        socket.emit("maxValue", _ENIGMES[set - 1].data.length);
        serveForm(session, socket);
    });
    // 
    socket.on('validateForm', (session, data) => {
        // users.forEach(async element => {
        for (let i = 0; i < users.length; i++) {
            element = users[i];
            if (element.group == session) {
                let part = _ENIGMES[set - 1].data[element.progress.length];
                // 
                // 
                let values = {
                    original: part.response,
                    user: data
                }
                // 
                // 
                if (part.strict_response == "false") {
                    values.original = values.original.toLowerCase();
                    values.user = values.user.toLowerCase();
                }
                // 
                // console.log(values.user.toLowerCase());
                // 
                let valide = false;
                if (values.original == values.user)
                    valide = true;
                // 
                if (valide) {
                    users[i].progress.push(part.id);
                    // console.log(users[i]);
                    serveForm(session, socket);
                } else {
                    users[i].mistakes.push([part.id, values.user]);
                    serverPunishment(session, socket);
                }
            }
        }
        // });
    });
    // 
    socket.on("disconnect", (data) => {
        connections--;
        console.log(`DISCONNECTED | Totall : ${connections}`);
    });
    // 
    socket.on('getHint', (session) => {
        serveHint(session, socket);
    })
    // 
    socket.on('treason', (session) => {
        timeReduction(300, session);
    });
    // 
    socket.on('ADMIN_START', () => {
        timer(socket);
    });
    // 
    socket.on('ADMIN_PAUSE', () => {
        clearInterval(timerInter);
    });
    // 
    socket.on('ADMIN_RESET', () => {
        localTime = 2700;
        for (let i = 0; i < users.length; i++) {
            users[i].time = localTime;
        }
    });
    // 
    socket.on('ADMIN_ADD_TIME', (time) => {
        global_timeAddition(time);
    });
    // 
    socket.on('ADMIN_SUB_TIME', (time) => {
        global_timeReduction(time);
    });
});
// 
function accessDenied(msg, type, socket) {
    socket.emit("Denied", msg, type);
}
// 
function serveForm(session, socket) {
    users.forEach(async element => {
        if (element.group == session) {
            if (element.progress.length < 5) {
                let part = _ENIGMES[set - 1].data[element.progress.length];
                socket.emit("currValue", element.progress.length + 1);
                socket.emit("setForm", part.type, part.question);
            } else
                socket.emit('finished');
        }
    });
}
// 
function serverPunishment(session, socket) {
    socket.emit("WRONG");
    timeReduction(300, session);
}
// 
function serveHint(session, socket) {
    users.forEach(async element => {
        if (element.group == session) {
            let part = _ENIGMES[set - 1].data[element.progress.length];
            timeReduction(900, session);
            socket.emit('setHint', part.hint);
        }
    });
}
// 
function timer(socket) {
    timerInter = setInterval(() => {
        if (users.length > 0) {
            for (let i = 0; i < users.length; i++) {
                localTime--;
                users[i].time--;
                io.to(`${users[i].socketId}`).emit('TimeUpdate', users[i].time);
                socket.emit('ADMIN_TIMER', localTime);
                // 
                if (users[i].time == 0)
                    io.to(`${users[i].socketId}`).emit('finished');
            }
        }
        // console.log(users);
    }, 1000);
}
// 
function timeReduction(value, session) {
    for (let i = 0; i < users.length; i++) {
        if (users[i].group = session)
            users[i].time -= value;
    }
}
// 
function global_timeReduction(value) {
    for (let i = 0; i < users.length; i++) {
        users[i].time -= value;
    }
}

function global_timeAddition(value) {
    for (let i = 0; i < users.length; i++) {
        users[i].time += value;
    }
}
// server.listen(3000, function () {
//     console.log('listening on :3000');
// });
server.listen(3000, '0.0.0.0', function () {
    console.log('Listening to port:  ' + 3000);
});