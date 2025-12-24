# MyFirstWebApp

抽選ルーレットができるシンプルなWebアプリケーションです。  
サーバーサイドとクライアントサイドを分けて実装しており、  
Node.js + WebSocket によるリアルタイム通信を行います。

---

## 概要

- 抽選ルーレット機能を持つWebアプリ
- サーバーサイド / クライアントサイドを分離
- WebSocketでメッセージを送受信
- 学習・サンプル用途向けのシンプルな構造

---

## 技術構成

### サーバーサイド
- Node.js
- WebSocket

### クライアントサイド
- Vite
- HTML / CSS / JavaScript


---

## セットアップ

依存関係をインストールします。

```bash
npm install
node .\server.js
npm run vite