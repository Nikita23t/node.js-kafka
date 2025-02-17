import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  // SSE listener
  useEffect(() => {
    const eventSource = new EventSource("http://localhost:5002/events");
    
    eventSource.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      setMessages(prev => [...prev, msg]);
    };

    return () => eventSource.close();
  }, []);

  const sendMessage = async () => {
    try {
      await axios.post("http://localhost:5001/send", { message: input });
      setInput("");
    } catch (err) {
      console.error("Send error:", err);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Kafka Chat</h1>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <button onClick={sendMessage} style={{ padding: "5px 15px" }}>
          Send
        </button>
      </div>
      <div>
        <h3>Messages:</h3>
        {messages.map((msg, i) => (
          <div key={i} style={{ padding: "5px", borderBottom: "1px solid #eee" }}>
            <small>{msg.timestamp}</small>
            <div>{msg.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;