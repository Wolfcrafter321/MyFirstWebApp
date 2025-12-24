document.addEventListener('DOMContentLoaded', () => {
	const testButton = document.getElementById('test-button');

	testButton.addEventListener('click', () => {
		console.log('テストボタンが押されました');

		const ws = new WebSocket('ws://localhost:25565');

		ws.addEventListener('open', () => {
		console.log('WebSocket 接続完了');

		ws.send('テストメッセージ');
		console.log('送信: テストメッセージ');

		ws.close();
		});

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
});