(function(){
    if ("WebSocket" in window) {
        ws = new WebSocket("ws://localhost:8080/service");
    } else if ("MozWebSocket" in window) {
        ws = new MozWebSocket("ws://localhost:8080/service");
    }
    if (ws) {
        // browser supports websockets
        ws.onopen = function() {
            // websocket is connected
            console.log("websocket connected!");
            initializeMid();
        };
        ws.onmessage = function (evt) {
            var receivedMsg = evt.data;
            console.log(JSON.parse(receivedMsg));
        };
        ws.onclose = function() {
            // websocket was closed
            console.log("websocket was closed");
        };
    } else {
        // browser does not support websockets
        console.log("sorry, your browser no support websockets.");
    }
})();
	
