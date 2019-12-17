window.onload = () => {
    const socket = io();
    // 
    socket.emit("RequestForm");
    // 
    socket.on('ResultedForm', (result) => {
        makeForm(result[2]);
        // console.log(result)
    });
}
// 
function makeForm(data) {
    let container = document.createElement('div');
    let question = document.createElement('span');
    let response = document.createElement('input');
    let submit = document.createElement('span');
    // Set Attribs
    question.setAttribute('id', 'formQuestion');
    response.setAttribute('id', 'formInput');
    response.setAttribute('type', 'text');
    submit.setAttribute('id', 'formSubmit');
    // 
    container.setAttribute('id', data.id);
    container.setAttribute('class', 'formContainer');
    // Set Props
    question.innerText = data.question;
    response.placeholder = "Response ?";
    submit.innerText = "Check !";
    // 
    container.appendChild(question);
    container.appendChild(response);
    container.appendChild(submit);
    // 
    document.getElementById('Right').appendChild(container);
}