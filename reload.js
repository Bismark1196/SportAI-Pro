// reload.js — WebSocket with REST fallback
(function () {
  const LOCALHOST = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const WS_URL = LOCALHOST ? null : "wss://sport-ai-pro.vercel.app/ws/ws"; // Use WS only in prod
  const REST_POLL_INTERVAL = 5000; // 5s fallback

  let ws;
  let pollingInterval;

  function connectWebSocket() {
    if (!WS_URL) {
      console.log("[WebSocket] Skipped, running locally. Using REST fallback.");
      startRestPolling();
      return;
    }

    try {
      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log("[WebSocket] Connected:", WS_URL);
      };

      ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        console.log("[WebSocket] Message received:", data);
        handleUpdate(data);
      };

      ws.onclose = () => {
        console.warn("[WebSocket] Connection closed. Falling back to REST polling.");
        startRestPolling();
      };

      ws.onerror = (err) => {
        console.error("[WebSocket] Error:", err);
        ws.close();
      };
    } catch (err) {
      console.error("[WebSocket] Failed to connect. Falling back to REST polling.", err);
      startRestPolling();
    }
  }

  function startRestPolling() {
    if (pollingInterval) return; // Already polling
    console.log("[REST] Starting polling every", REST_POLL_INTERVAL, "ms");

    pollingInterval = setInterval(async () => {
      try {
        const res = await fetch("/api/notifications?user_id=1"); // Example endpoint
        if (!res.ok) throw new Error("REST fetch failed: " + res.status);
        const data = await res.json();
        handleUpdate(data);
      } catch (err) {
        console.error("[REST] Polling error:", err);
      }
    }, REST_POLL_INTERVAL);
  }

  function handleUpdate(data) {
    // Handle updates (notifications, live data, etc.)
    console.log("[Update] Data:", data);
    // TODO: Update your UI here
  }

  // Start connection
  connectWebSocket();
})();