document.addEventListener('DOMContentLoaded', () => {

	let ws = null
	let local_data = {
		title:"無名",
		waku:1,
		time: 10000,
		entryStatus:false,
		entryLife: 5
	}

	function showOverlay(message) {
		const overlay = document.getElementById("overlay");
		const messageElem = document.getElementById("overlay-message");
    	const closeButton = document.getElementById("overlay-close");
		// messageElem.textContent = message;
		messageElem.innerHTML = message.replace(/\n/g, "<br>");
		overlay.style.display = "block";
		closeButton.focus();
	}
	function hideOverlay() {
		document.getElementById("overlay").style.display = "none";
	}
	document.getElementById("overlay-close").addEventListener("click", hideOverlay);


	function showConfetti() {
		const effect = document.getElementById("effect");
		effect.innerHTML = "";
		const colors = ["#c31414ff", "#fff59aff", "#0d9111ff", "#7f7510ff"];
		for (let i = 0; i < 80; i++) {
			const c = document.createElement("div");
			c.className = "confetti";
			c.style.background = colors[Math.floor(Math.random() * colors.length)];
			// 左下 or 右下
			const fromLeft = Math.random() < 0.5;
			c.style.left = fromLeft ? "0px" : "100%";
			c.style.bottom = "0px";
			// 飛ぶ方向
			const x = fromLeft
				? Math.random() * 300 + 100
				: -Math.random() * 300 - 100;
			const y = -(Math.random() * 300 + 200);
			c.style.setProperty("--x", `${x}px`);
			c.style.setProperty("--y", `${y}px`);
			effect.appendChild(c);
		}
		setTimeout(() => {
			effect.innerHTML = "";
		}, 1500);
	}




	const startButton = document.getElementById('button');
	startButton.addEventListener('click', () => {
		// check values
		const roomId = document.getElementById('room-name').value.trim();
		const name = document.getElementById('name').value.trim();
		const yomi = document.getElementById('yomi').value.trim();

		// 入力チェック
		if (!name || !yomi) {
			showOverlay("すべての項目を入力してください。");
			return;
		}

		_data={
			type:"join_room",
			roomId:roomId,
			userdata:{
				name:name,
				yomi:yomi
			}
		}

		// create new room
		if(!roomId){_data.type = "create_room"}

		ws = new WebSocket('ws://localhost:25565');
		showOverlay("接続中...");
		setTimeout(() => {
			if (ws.readyState !== WebSocket.OPEN) {
				ws.close();
				ws = null
				showOverlay("サーバーに接続できませんでした\n（タイムアウト）");
				return
			}
		}, 500);


		ws.addEventListener('open', () => {
			showOverlay("接続できました！")
			ws.send(JSON.stringify(_data));

			ws.addEventListener('message', (event) => {
			console.log('サーバーから受信:', event.data);
				onReceiveMessage(JSON.parse(event.data))
			});
			ws.addEventListener("error", (w, e) => {
				showOverlay("サーバーとうまく対話ができませんでした。")
				ws = null
			})


			/* ホストボタン */
			document.getElementById("host-button-reset").addEventListener("click", () => {
				document.getElementById('setting-entry').checked = false;
				ws.send(JSON.stringify({
					type: "roomInfo-reset",
					data:[
						document.getElementById('setting-title').value.trim(),
						document.getElementById('setting-number').value.trim(),
						document.getElementById('setting-time').value.trim(),
						document.getElementById('setting-entry').checked,
					]
				}));
			});
			document.getElementById("host-button-update").addEventListener("click", () => {
				ws.send(JSON.stringify({
					type: "roomInfo-update",
					data:[
						document.getElementById('setting-title').value.trim(),
						document.getElementById('setting-number').value.trim(),
						document.getElementById('setting-time').value.trim(),
						document.getElementById('setting-entry').checked,
					]
				}));
			});
			document.getElementById("host-button-start").addEventListener("click", () => {
				ws.send(JSON.stringify({
					type: "start-game",
				}));
			});


			const chatInput = document.getElementById("chat-input");
			const chatSend = document.getElementById("chat-send");
			chatSend.addEventListener("click", () => {
				const msg = chatInput.value.trim();
				if (!msg) return;
				ws.send(JSON.stringify({
					type: "chat",
					msg: msg
				}));

				chatInput.value = ""; // 送信後クリア
				chatInput.focus();
			});

			// Enterキーでも送信
			chatInput.addEventListener("keydown", (e) => {
				if (e.key === "Enter") chatSend.click();
			});

		});

		ws.addEventListener('close', () => {
			if (ws != null) {
				showOverlay("接続が切れました。")
				set_screen()
			}
		});
	});

	function onReceiveMessage(data){
		console.log("server message received!")
		switch (data.type) {
			case "room_info":
				set_screen("play")
				set_room_data(data.data)
				document.getElementById("play-host").style.display = data.isHost? "block": "none";
				break;

			case "chat_broadcast":
				// here for new message
				chatMessages = document.getElementById("chat-messages");
				const p = document.createElement("p");
				p.innerHTML = `<strong>${data.user}:</strong> ${data.msg}`;
				chatMessages.appendChild(p);

				// スクロールを常に一番下に
				chatMessages.scrollTop = chatMessages.scrollHeight;
				break;

			case "roomInfo-update_broadcast":
				set_room_data(data.data)
				break;

			case "test":
				console.log("サーバーから受信\n"+data.msg)
				break;
		}
	}

	function set_room_data(data){
		local_data.title = data[0]
		local_data.waku = data[1]
		local_data.time = data[2]
		const entryable = data[3]
		document.getElementById("game-scr-title").innerHTML = "現在の景品："+local_data.title
		document.getElementById("game-scr-count").innerHTML = "当選者数："+local_data.waku
		document.getElementById("game-entry").disabled = entryable==false? true : false;

	}

	function set_screen(mode="welcome"){
		switch (mode) {
			default:
			case "welcome":
				document.getElementById("welcome").style.display = "block";
				document.getElementById("play-screen").style.display = "none";
				break;
			case "play":
				document.getElementById("welcome").style.display = "none";
				document.getElementById("play-screen").style.display = "block";
				break;
		}
	}

	const testButton = document.getElementById('test-button');
	testButton.addEventListener('click', () => {

		showConfetti()

		if (ws == null) {
			showOverlay("接続して！")
			return
		}

		ws.send('{"type": "test"}');
		console.log('送信: テストメッセージ');
	});
	document.getElementById('test-button2').addEventListener('click', () => {

		if (ws == null) {
			showOverlay("接続して！")
			return
		}

		ws.send('{"type": "server_debug"}');
	});



});

