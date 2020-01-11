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
    console.log(`Socket Connected, Totall : ${connections}`);
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
            users.push(_TEMPLATE);
        } else
            accessDenied("Max Number of Users is 4", "session", socket);
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
        console.log(`Socket Disconnected, Totall : ${connections}`);
    });
    // 
    socket.broadcast.emit('TimeUpdate')
    // 
    // 
    socket.on('ADMIN_START', () => {
        // console.log(socket.id);
        timer(socket);
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
}
// 
function timer(socket) {
    setInterval(() => {
        if (users.length > 0) {
            for (let i = 0; i < users.length; i++) {
                localTime--;
                users[i].time--;
                io.to(`${users[i].socketId}`).emit('TimeUpdate', users[i].time);
            }
        }
        // console.log(users);
    }, 1000);
}
// server.listen(3000, function () {
//     console.log('listening on :3000');
// });
server.listen(3000, '0.0.0.0', function () {
    console.log('Listening to port:  ' + 3000);
});