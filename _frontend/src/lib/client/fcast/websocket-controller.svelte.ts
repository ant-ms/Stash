import { OPCODE } from './protocol.js';

export type WebSocketEventHandler = {
	onOpen?: () => void;
	onError?: (error: Event) => void;
	onClose?: (event: CloseEvent) => void;
	onPacketReceived?: (opcode: number, body: object | null) => void;
};

export class WebSocketController {
	private currentWebSocket: WebSocket | null = null;
	private eventHandlers: WebSocketEventHandler;
	private proxyUrl: string;

	constructor(ip: string, port = 46899, eventHandlers: WebSocketEventHandler = {}) {
		// Connect to the local proxy, assuming standard Vite port 5173.
		// In a production environment, this URL would need to be configured differently.
		// TODO
		this.proxyUrl = `wss://stash.hera.lan/tcp/${ip}/${port}`;
		this.eventHandlers = eventHandlers;
		this.connect();
	}

	private connect(): void {
		this.closeCurrentWebSocket();

		this.currentWebSocket = new WebSocket(this.proxyUrl);
		this.currentWebSocket.onopen = this.onWebSocketOpen;
		this.currentWebSocket.onerror = this.onWebSocketError;
		this.currentWebSocket.onclose = this.onWebSocketClose;
		this.currentWebSocket.onmessage = this.onWebSocketMessage;
	}

	public disconnect(): void {
		this.closeCurrentWebSocket();
	}

	public sendPacket(opcode: OPCODE, payload?: object): void {
		console.log('Sending WebSocket packet:', opcode, payload);

		const message = {
			opcode,
			body: payload
		};

		if (this.currentWebSocket && this.currentWebSocket.readyState === WebSocket.OPEN) {
			this.currentWebSocket.send(JSON.stringify(message));
		} else {
			console.error('WebSocket is not connected, cannot send packet');
		}
	}

	private onWebSocketOpen = (): void => {
		console.log('WebSocket connection opened to proxy');
		this.eventHandlers.onOpen?.();
	};

	private onWebSocketError = (error: Event): void => {
		console.error('[fcast-proxy]', error);
		this.eventHandlers.onError?.(error);
	};

	private onWebSocketClose = (event: CloseEvent): void => {
		console.log('WebSocket proxy connection closed:', event.reason);
		// Attempt to reconnect after a short delay
		setTimeout(() => this.reconnect(), 1000);
		this.eventHandlers.onClose?.(event);
	};

	private onWebSocketMessage = (event: MessageEvent): void => {
		if (typeof event.data === 'string') {
			try {
				const message = JSON.parse(event.data);
				const { opcode, body } = message;
				this.eventHandlers.onPacketReceived?.(opcode, body);
			} catch (e) {
				console.error('Error parsing JSON message from proxy:', e);
			}
		} else {
			console.warn('Binary message received from proxy, not handled:', event.data);
		}
	};

	private closeCurrentWebSocket = (): void => {
		if (this.currentWebSocket) {
			// Remove the onclose handler before closing to prevent the reconnect logic from firing
			this.currentWebSocket.onclose = null;
			this.currentWebSocket.close();
			this.currentWebSocket = null;
		}
	};

	private reconnect = (): void => {
		this.connect();
	};
}
