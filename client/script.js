const socket = new WebSocket('ws://localhost:3000');

const clientNames = ['Buzz Light Year', 'Person of the Year 2006', 'Dawid Vise', 'Faulkland Islands'];

const playerName = clientNames[Math.floor(Math.random()*3)]
console.log(playerName);

socket.addEventListener('open', function (event) {
    console.log('Connected to WS Server')
    console.log("URL:", socket.url);
});

socket.addEventListener('message', function (event) {
    console.log('Message from server ', event.data);
});

const updateWinner = (msgJson) => {
    var buzzWin = document.getElementById('buzz-win');
    buzzWin.innerHTML = msgJson.name + "!";
}

const resetResponse = () => {
    var buzzWin = document.getElementById('buzz-win');
    buzzWin.innerHTML = "Buzzer Clear";
}

const resolveResponse = (message) => {
    
    var msgJson = JSON.parse(message.data);

    if(msgJson.type == "buzz-response"){
        updateWinner(msgJson);
    }
    if(msgJson.type == "clear-response"){
        resetResponse();
    }
    if(msgJson.type == "chat-response"){
        receiveText(msgJson);
    }
}

socket.onmessage = resolveResponse;

const sendMessage = () => {

    var f = {
        type: 'buzz',
        name: playerName,
    };

    socket.send(JSON.stringify(f));
}

const resetBuzzer = () => {
    var f = {
        type: 'reset',
    }
    socket.send(JSON.stringify(f));
}

const sendText = () => {
    var chatBox = document.getElementById('chat');
    var chatText = chatBox.value;
    socket.send(JSON.stringify({
            type: 'chat',
            message: chatText,
            sender: playerName,
            time: new Date().toString().slice(15, 21)
        })
    );
}

const receiveText = (msgJson) => {
    var messageBox = document.getElementById('messages');
    // var ul = document.getElementById("list");
    var li = document.createElement("li");
    li.appendChild(document.createTextNode(msgJson.sender + `[${msgJson.time}] :` + msgJson.message));
    messageBox.appendChild(li);
}