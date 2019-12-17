const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const fsExtra = require('fs-extra');
const Path = require('path');
// 
let connections = 0,
    users = [];
// 
app.use('/res', express.static(__dirname + '/res'));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/res/html/index.html');
});
// 
io.sockets.on("connection", (socket) => {
    connections++;
    console.log(`Socket Connected, Totall : ${connections}`);
    // 
    socket.on("RequestForm", async () => {
        // users.push(socket);
        // console.log(`Active Users :${users.length}`);
        let resData = await getForms(0);
        socket.emit("ResultedForm", resData);
    });
    // 
    socket.on("disconnect", (data) => {
        connections--;
        console.log(`Socket Disconnected, Totall : ${connections}`);
    });
});
// 
async function getForms(pos) {
    let jsonPath = Path.join(__dirname, "/res/data/data.json");
    let forms = await fsExtra.readJson(jsonPath);
    return forms[pos].data;
}
// 
server.listen(3000, function () {
    console.log('listening on :3000');
});