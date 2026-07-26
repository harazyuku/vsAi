/* eslint-disable @typescript-eslint/no-explicit-any */
type Listener = (payload?: any) => void;

export class RealtimeSocket {
  private ws: WebSocket | null = null;
  private listeners = new Map<string, Set<Listener>>();
  private reconnectTimer: number | null = null;
  private manuallyClosed = false;
  connected = false;

  constructor(private readonly url: string) {}

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) return;
    this.manuallyClosed = false;
    this.ws = new WebSocket(this.url);
    this.ws.addEventListener("open", () => {
      this.connected = true;
      this.dispatch("connect");
    });
    this.ws.addEventListener("message", (message) => {
      try {
        const data = JSON.parse(String(message.data));
        this.dispatch(data.event, data.payload);
      } catch {
        this.dispatch("connect_error");
      }
    });
    this.ws.addEventListener("error", () => this.dispatch("connect_error"));
    this.ws.addEventListener("close", () => {
      this.connected = false;
      this.dispatch("disconnect");
      if (!this.manuallyClosed) {
        this.reconnectTimer = window.setTimeout(() => this.connect(), 1500);
      }
    });
  }

  disconnect() {
    this.manuallyClosed = true;
    if (this.reconnectTimer) window.clearTimeout(this.reconnectTimer);
    this.ws?.close();
  }

  emit(event: string, payload?: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, payload }));
    }
  }

  on(event: string, listener: Listener) {
    const listeners = this.listeners.get(event) ?? new Set();
    listeners.add(listener);
    this.listeners.set(event, listeners);
  }

  off(event: string, listener: Listener) {
    this.listeners.get(event)?.delete(listener);
  }

  private dispatch(event: string, payload?: any) {
    this.listeners.get(event)?.forEach((listener) => listener(payload));
  }
}
