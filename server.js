import { WebSocketServer } from "ws";
import { randomUUID } from "crypto";
import { json } from "stream/consumers";

const wss = new WebSocketServer({ port: 25565 });

let app_data = {
		rooms: {
				"tempalte":{
						password: null,
						data:{
							title:"無題の景品",
							waku:1,
							time:3,
							entry: false,
							currentEntries:[
								"", "", ""
							]
						},
						history:[
							{
								"無題":{
									title:"無題の景品",
									waku:1,
									time:3,
									winners:[
										"", "",
									]
								}
							},{
								"無題2":{
									title:"無題の景品",
									waku:1,
									time:3,
									winners:[
										"", "",
									]
								}
							}
						],
						users: null // map
				},
		},
};

function debug() {console.log(app_data)}

wss.on("connection", (ws) => {
	ws.on("message", (data) => {

		let msg;
		try { msg = JSON.parse(data.toString()); } catch (e) { console.log("JSONエラーが起きました"); return; }

		let room = null

		switch (msg.type){
			case "test":
				ws.send(JSON.stringify({type:"test", msg:"hi"}));
				debug()
				break;

			case "create_room":
				const roomId = randomUUID();
				app_data.rooms[roomId] = {
					password: msg.password ?? null,
					users: new Map(),
					data: {
						title: "無題の景品",
						waku: 1,
						time: 2,
						entry: false,
					}
				}

				ws.send(JSON.stringify({
					type: "room_info",
					roomId: roomId,
					isHost: true,
					data: [
							app_data.rooms[roomId].data.title,
							app_data.rooms[roomId].data.waku,
							app_data.rooms[roomId].data.time,
							app_data.rooms[roomId].data.entry,
						]
				}));

				ws.roomId = roomId;
				ws.userName = msg.userdata.name;
				ws.yomi = msg.userdata.yomi;
				app_data.rooms[roomId].users.set(ws, { name: msg.userdata.name, yomi: msg.userdata.yomi });

				break;

			case "join_room":
				room = app_data.rooms[msg.roomId];
				if (!room) return;

				if (room.password && room.password !== msg.password) {
					ws.send(JSON.stringify({ type: "error", msg: "password error" }));
					return;
				}

				ws.roomId = msg.roomId;
				ws.userName = msg.userdata.name;
				ws.yomi = msg.userdata.yomi;
				room.users.set(ws, { name: msg.userdata.name, yomi: msg.userdata.yomi });

				ws.send(JSON.stringify({
					type: "room_info",
					roomId: ws.roomId,
					data: [
							room.data.title,
							room.data.waku,
							room.data.time,
							room.data.entry,
						]
				}));

				break;

			case "roomInfo-reset":
				room = app_data.rooms[ws.roomId];
				if (!room) return;
				room.data.title = msg.data[0]
				room.data.waku = msg.data[1]
				room.data.time = msg.data[2]
				room.data.entry = msg.data[3]
				room.data.currentEntries = []
				for (const [client] of room.users) {
					client.send(JSON.stringify({
						type: "roomInfo-update_broadcast",
						data: [
							room.data.title,
							room.data.waku,
							room.data.time,
							room.data.entry,
							room.data.currentEntries,
						]
					}));
				}
				break

			case "roomInfo-update":
				room = app_data.rooms[ws.roomId];
				if (!room) return;
				room.data.title = msg.data[0]
				room.data.waku = msg.data[1]
				room.data.time = msg.data[2]
				room.data.entry = msg.data[3]
				for (const [client] of room.users) {
					client.send(JSON.stringify({
						type: "roomInfo-update_broadcast",
						data: [
							room.data.title,
							room.data.waku,
							room.data.time,
							room.data.entry,
						]
					}));
				}
				break;

			case "chat":
				room = app_data.rooms[ws.roomId];
				if (!room) return;

				for (const [client] of room.users) {
					client.send(JSON.stringify({
						type: "chat_broadcast",
						user: ws.userName,
						msg: msg.msg
					}));
				}
				break;
		}
	});

	ws.on("close", () => {
		if(!ws.roomId) return;
		const room = app_data.rooms[ws.roomId];
		if (!room) return;
		room.users.delete(ws);
		if(room.users.size === 0){
			delete app_data.rooms[ws.roomId]
			console.log("room deleted "+ ws.roomId)
		}
	});
});