const WebSocket = require('ws');
const sanitize = require("./sanitize");

const PING_INTERVAL = 30000;

class WebSocketManager {
    constructor(server) {
        this.clients = new Map(); // Map<connectionId, { ws: WebSocket, subscriptions: Set<string>, isAlive: boolean }>;
        this.wss = new WebSocket.Server({ server });

        this.init();
        this.startPing();
    }

    init() {
        this.wss.on('connection', (ws) => {
            const connectionId = this.generateConnectionId();
            this.clients.set(connectionId, { ws, subscriptions: new Set(), isAlive: true });

            ws.on('pong', () => {
                const client = this.clients.get(connectionId);
                if (client) client.isAlive = true;
            });

            ws.on('message', (message) => this.handleMessage(connectionId, message));
            ws.on('close', () => this.clients.delete(connectionId));

			ws.send(JSON.stringify({ action: "start", body: connectionId }));
        });
    }

    generateConnectionId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    handleMessage(connectionId, message) {
        try {
            const msg = JSON.parse(message);
            const client = this.clients.get(connectionId);

            if (!client) return;

            if (msg.action === 'subscribe') {
                client.subscriptions.add(msg.name);
            } else if (msg.action === 'unsubscribe') {
                client.subscriptions.delete(msg.name);
            }
        } catch (err) {
            console.error('Error parsing WebSocket message:', err);
        }
    }

    broadcast(action, body) {
        const entity = body.name;

        for (const [connectionId, client] of this.clients.entries()) {
            const { ws, subscriptions } = client;

            if (subscriptions.has(entity) && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ action, body: sanitize(body) }));
            }
        }
    }

    startPing() {
        setInterval(() => {
            for (const [connectionId, client] of this.clients.entries()) {
                const { ws, isAlive } = client;

                if (!isAlive) {
                    ws.terminate();
                    this.clients.delete(connectionId);
                    continue;
                }

                client.isAlive = false;
                ws.ping();
            }
        }, PING_INTERVAL);
    }
}

module.exports = WebSocketManager;