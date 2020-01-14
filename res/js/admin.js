window.onload = () => {
    const _SOCKET = io();
    let started = false;
    // 
    document.getElementById('start').addEventListener('click', () => {
        if (!started) {
            _SOCKET.emit('ADMIN_START');
            console.log('started');
            started = !started;
        }
    });
    // 
    document.getElementById('pause').addEventListener('click', () => {
        if (started) {
            _SOCKET.emit('ADMIN_PAUSE');
            console.log('paused');
            started = !started;
        }
    });
    // 
    document.getElementById('reset').addEventListener('click', () => {
        _SOCKET.emit('ADMIN_RESET');
        console.log('reset');
    });
    // 
    document.getElementById('plusTime').addEventListener('click', () => {
        const _VALUE = parseInt(document.getElementById('addTime').value) * 60;
        _SOCKET.emit('ADMIN_ADD_TIME', _VALUE);
    });
    // 
    document.getElementById('minusTime').addEventListener('click', () => {
        const _VALUE = parseInt(document.getElementById('subTime').value) * 60;
        _SOCKET.emit('ADMIN_SUB_TIME', _VALUE);
    });
    // 
    // 
    _SOCKET.on('ADMIN_TIMER', (time) => {
        let min = Math.floor(time / 60);
        let sec = time - min * 60;
        // 
        if (getIntegerLength(min) == 1)
            min = timeCorrection(min);
        if (getIntegerLength(sec) == 1)
            sec = timeCorrection(sec);
        // 
        document.getElementById('timer').innerText = `${min}:${sec}`;
    });
}
// 
function timeCorrection(time) {
    return `0${time}`;
}
// 
function getIntegerLength(value) {
    return value.toString().length;
}