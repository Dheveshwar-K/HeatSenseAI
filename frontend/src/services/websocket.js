/**
 * WebSocket Live Stream Manager
 * Maintains connection to ws://127.0.0.1:8000/ws/live with auto-reconnect.
 */

class WebSocketClient {
  constructor() {
    this.ws = null;
    this.url = 'ws://127.0.0.1:8000/ws/live';
    this.listeners = new Set();
    this.statusListeners = new Set();
    this.reconnectTimer = null;
    this.isConnected = false;
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.isConnected = true;
        this._notifyStatus('CONNECTED');
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.listeners.forEach((listener) => listener(data));
        } catch (e) {
          console.error('Error parsing WebSocket frame:', e);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this._notifyStatus('DISCONNECTED');
        this._scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        this.isConnected = false;
        this._notifyStatus('ERROR');
        this.ws?.close();
      };
    } catch (err) {
      this._scheduleReconnect();
    }
  }

  _scheduleReconnect() {
    if (!this.reconnectTimer) {
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null;
        this.connect();
      }, 3000);
    }
  }

  _notifyStatus(status) {
    this.statusListeners.forEach((fn) => fn(status));
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  subscribeStatus(listener) {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  send(payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  setScenario(scenarioName) {
    this.send({ action: 'SET_SCENARIO', scenario: scenarioName });
  }

  setTelemetry(telemetryObj) {
    this.send({ action: 'SET_TELEMETRY', ...telemetryObj });
  }

  acknowledgeAlarm() {
    this.send({ action: 'ACKNOWLEDGE' });
  }

  resolveEmergency() {
    this.send({ action: 'RESOLVE' });
  }

  triggerManualCall() {
    this.send({ action: 'MANUAL_CALL' });
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) this.ws.close();
  }
}

export const wsClient = new WebSocketClient();
