import {disconnect} from "process"
import {prepareChatClientCore} from "../cores/chat-client-core.js"

let client = new WebSocket('ws://localhost:8000');
console.log(client);

   //sending a message when connection opens
    client.onopen = (event) => client.send("This is a message from client");
    //receiving the message from server


	const {chatConnect} = prepareChatClientCore({
		connectToServer: async ({handleDataFromServer}) => {
			const serverConnection = client;
			return {
				sendDataToServer: serverConnection,
				disconnect: async () => serverConnection.close(),
	
			}
		}
	})
