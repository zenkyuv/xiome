import {prepareChatClientCore} from "../cores/chat-client-core.js"

export async function chatSocketClient(url:string) {
	const socket = new WebSocket(url)
		const {chatConnect} = prepareChatClientCore({
			connectToServer: async ({handleDataFromServer}) => {
					socket.onmessage = (message) => {
						handleDataFromServer(JSON.stringify(message))
				}
				socket.onopen = (event) => {
					socket.send("This is a message from client");
				}
			return {
				async sendDataToServer(...args: any[]) {
					socket.onopen = function () {socket.send(JSON.stringify(args))}
				},
				disconnect: async () => socket.close(),
			}
		}
		})
	return chatConnect
}
