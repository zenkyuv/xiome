import {prepareChatClientCore} from "../cores/chat-client-core.js"

export async function chatSocketClient(url:string) {
		const {chatConnect} = prepareChatClientCore({
			connectToServer: async ({handleDataFromServer}) => {
				const socket = new WebSocket(url)
				console.log(socket.readyState);
				console.log(socket.CONNECTING, socket.OPEN);
				socket.onopen = (event) => {
					socket.send("This is a message from client");
				}
				socket.onmessage = (message) => {
					console.log(message);
					handleDataFromServer(message.data)
				}
				console.log(socket.readyState);
			return {
				// sendDataToServer: socket.onopen = async function () {socket.send('elo')},
				async sendDataToServer(...data: any[]) {
					console.log(data);
					socket.onopen = function () {socket.send(JSON.stringify(data))}
				},
				disconnect: async () => socket.close(),
			}
		}
		})
	return chatConnect
}
