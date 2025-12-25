import { WebSocketServer } from "ws";
import { randomUUID } from "crypto";

const wss = new WebSocketServer({ port: 25565 });

let data = {
		rooms: {
				"000000":{
						password: null,
						users: null
				},
		},
};

wss.on("connection", (ws) => {
	ws.on("message", (data) => {
		let msg;
		try {
				msg = JSON.parse(data.toString());
		} catch (e) {
				console.log("JSONエラーが起きました");
				return; // ここでスルー
		}

		console.log(msg);

		if (msg.type === "server_debug") {
			ws.send(JSON.stringify(data));
			console.log(data)
		}

		if (msg.type === "create_room") {
			const roomId = randomUUID();
			data.set(roomId, {
				password: msg.password ?? null,
				users: new Map()
			});

			ws.send(JSON.stringify({
				type: "room_info",
				roomId
			}));
		}

		if (msg.type === "join_room") {
			const room = rooms.get(msg.roomId);
			if (!room) return;

			if (room.password && room.password !== msg.password) {
				ws.send(JSON.stringify({ type: "error", msg: "password error" }));
				return;
			}

			ws.roomId = msg.roomId;
			ws.userName = msg.user;
			room.users.set(ws, { name: msg.user });
		}

		if (msg.type === "chat") {
			const room = rooms.get(ws.roomId);
			if (!room) return;

			for (const [client] of room.users) {
				client.send(JSON.stringify({
					type: "chat_broadcast",
					user: ws.userName,
					msg: msg.msg
				}));
			}
		}
	});

	ws.on("close", () => {
		console.log("ws client close");
		// const room = data.rooms.get(ws.roomId);
		// room?.users.delete(ws);
	});
});