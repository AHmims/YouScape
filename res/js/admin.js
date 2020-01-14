window.onload = () => {
    const _SOCKET = io();
    let started = false;
    // 
    document.getElementById('start').addEventListener('click', () => {
        if (!started) {
            _SOCKET.emit('ADMIN_START');
            console.log('clicked');
            started = !started;
        }
    });
}