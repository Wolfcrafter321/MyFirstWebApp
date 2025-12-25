document.addEventListener('DOMContentLoaded', () => {

	let ws = null

	function showOverlay(message) {
		const overlay = document.getElementById("overlay");
		const messageElem = document.getElementById("overlay-message");
    	const closeButton = document.getElementById("overlay-close");
		messageElem.textContent = message;
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
			"type":"join_room",
			"userdata":{
				"name":name,
				"yomi":yomi
			}
		}


		if(!roomId){
			// create new room
			_data.type = "create_room"
		}

		ws = new WebSocket('ws://localhost:25565');
		showOverlay("接続中...")
		ws.addEventListener('open', () => {
			showOverlay("接続できました！")
			ws.send(JSON.stringify(_data));

			ws.addEventListener('message', (event) => {
			console.log('サーバーから受信:', event.data);
				try{
					onReceiveMessage(JSON.parse(event.data))
				}
				catch{
					showOverlay("エラーが発生しました。\n"+event.data)
				}
			});
			ws.addEventListener("error", (w, e) => {
				showOverlay("サーバーに接続できませんでした。")
				ws = null
			})

		});

	});

	function onReceiveMessage(data){
		console.log(data.type)
	}


	const testButton = document.getElementById('test-button');
	testButton.addEventListener('click', () => {

		showConfetti()

		if (ws == null) {
			showOverlay("接続して！")
			return
		}

		ws.send('{"msg": "test"}');
		console.log('送信: テストメッセージ');

		ws.addEventListener('message', (event) => {
		console.log('サーバーから受信:', event.data);
		});
		ws.addEventListener('error', (err) => {
		console.error('WebSocket エラー:', err);
		});
		ws.addEventListener('close', () => {
		console.log('WebSocket 切断');
		});
	});
	document.getElementById('test-button2').addEventListener('click', () => {

		if (ws == null) {
			showOverlay("接続して！")
			return
		}

		ws.send('{"type": "server_debug"}');
	});



});

