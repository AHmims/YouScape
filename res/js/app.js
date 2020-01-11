window.onload = () => {
    const _SOCKET = io();
    const _SESSION = 'dev-token';
    // 
    let firstRun = true;
    // 
    _SOCKET.on("Denied", (msg, type) => {
        errorMsg(msg);
        if (type == 'session')
            sessionStorage.removeItem(_SESSION);
    });
    // 
    if (getSession(_SESSION)) {
        removeLayer('auth');
        // getIn(getSession(), _SOCKET);
    } else {
        document.getElementById('auth-btn').addEventListener('click', () => {

            sessionStorage.setItem(_SESSION, document.getElementById('auth-id').value);
            removeLayer('auth');
            saveSession(getSession(_SESSION), _SOCKET);
        });
    }
    // START LISTENER
    document.getElementById('start-btn').addEventListener('click', () => {
        _SOCKET.emit('getForm', getSession(_SESSION));
    });
    // 
    document.getElementById('form-submit-btn').addEventListener('click', () => {
        _SOCKET.emit('validateForm', getSession(_SESSION), document.getElementById('form-submit-input').value);
    });
    // 
    _SOCKET.on('maxValue', (nb) => {
        setValue('progress-max', nb);
    });
    // 
    _SOCKET.on('currValue', (nb) => {
        setValue('progress-curr', nb);
    });
    // 
    _SOCKET.on('TimeUpdate', (time) => {
        let min = Math.floor(time / 60);
        let sec = time - min * 60;
        // 
        setValue('timer-min', min);
        setValue('timer-sec', sec);
    });
    // 
    _SOCKET.on('setForm', (type, question) => {
        if (firstRun) {
            removeLayer('start')
            document.getElementById('Container').style.display = 'flex';
            // 
            firstRun = !firstRun;
        }
        // 
        console.log({
            type,
            question
        });
        makeForm({
            type,
            question
        });
    });
    // 
    _SOCKET.on('WRONG', () => {
        console.log('slavery');
    });
    // 
    _SOCKET.on('finished', () => {
        finisher();
    });
    // 
    /*socket.emit("RequestForm");
    // 
    socket.on('ResultedForm', (result) => {
        makeForm(result[2]);
        // console.log(result)
    });*/
}
// 
function makeForm(data) {
    const _CONTAINER = document.getElementById('content');
    _CONTAINER.innerHTML = "";
    document.getElementById('form-submit-input').value = "";
    const _ATTRIBUTES = ['content-title', 'content-image'];
    switch (data.type) {
        case 'text':
            let title = document.createElement('span');
            title.setAttribute('class', _ATTRIBUTES[0]);
            title.innerText = data.question;
            _CONTAINER.appendChild(title);
            break;
        case 'array':
            for (let nb = 0; nb < data.question.length; nb++) {
                let title = document.createElement('span');
                title.setAttribute('class', _ATTRIBUTES[0]);
                title.innerText = data.question[nb];
                _CONTAINER.appendChild(title);
            }
            break;
    }
}
// 
function getSession(_SESSION) {
    return sessionStorage.getItem(_SESSION);
}
//
function removeLayer(id) {
    document.getElementById(id).remove();
}
// 
function setValue(id, value) {
    document.getElementById(id).innerText = value;
}
// 
function saveSession(session, socket) {
    socket.emit("NewGroup", session);
}
// 
function errorMsg(msg) {
    let cont = document.createElement('div');
    cont.innerText = msg;
    // 
    cont.id = "error";
    document.getElementsByTagName('body')[0].appendChild(cont);
    // 
    removeLayer('start');
    removeLayer('Container');
}
// 
function finisher() {
    let cont = document.createElement('div');
    cont.innerText = "Game Over";
    // 
    cont.id = "finished";
    document.getElementsByTagName('body')[0].appendChild(cont);
    // 
    removeLayer('Container');
}