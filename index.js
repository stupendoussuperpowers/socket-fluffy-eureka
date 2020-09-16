const path = require("path")

const express = require('express')
const app = express()
const server = require('http').createServer(app);
const WebSocket = require('ws');

const wss = new WebSocket.Server({ server:server });

var countOfClients = 0;

var semaphore = 0;

wss.on('connection', function connection(ws) {
    console.log('A new client Connected!');
    ws.send(JSON.stringify({type:'welcome', message:'Welcome New Client!'}));

    countOfClients++;
    
    console.log("Number of clients:", countOfClients);

    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        
        var msgJson = JSON.parse(message);

        resolveResponse(msgJson);

    });
});

const resolveResponse = (msgJson) => {
    if (msgJson.type == "buzz") {
        console.log("Here");
        if(semaphore++ == 0){
            wss.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                    var f = {
                        type: 'buzz-response',
                        name: msgJson.name,
                    };
                    client.send(JSON.stringify(f));
                }
            });
        } 
    }

    if (msgJson.type == "reset") {
        console.log("Here again");
        semaphore = 0;
        wss.clients.forEach(function each(client) {
            // console.log("Client", client);
            if (client.readyState === WebSocket.OPEN) {
                var f = {
                    type: 'clear-response',
                };
                client.send(JSON.stringify(f));
            }
        });
    }

    if (msgJson.type == "chat") {
        wss.clients.forEach((client) => {
            console.log("Here Chat");
            if(client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'chat-response',
                    message: msgJson.message,
                    sender: msgJson.sender,
                    time: msgJson.time,
                }))   
            }
        })
    }


}

app.use(express.static(path.join(__dirname, "client/")))

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "index.html"))
})

server.listen(3000, () => console.log(`Lisening on port :3000`))