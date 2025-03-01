import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [input, setInput] = useState("");
  const [category, setCategory] = useState("scientific");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:5002/events");
    
    eventSource.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        setMessages(prev => [...prev, msg]);
      } catch (err) {
        console.error("Ошибка парсинга сообщения:", err);
      }
    };

    return () => eventSource.close();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    try {
      await axios.post("http://localhost:5001/send", {
        message: input,
        category: category
      });
      setInput("");
    } catch (err) {
      console.error("ошибка:", err);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Посты в кафке</h1>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Введите новый пост..."
          style={{ marginRight: "10px", padding: "5px", width: "300px" }}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ marginRight: "10px", padding: "5px" }}
        >
          <option value="scientific">Научная</option>
          <option value="entertainment">Развлекательная</option>
        </select>
        <button onClick={sendMessage} style={{ padding: "5px 15px" }}>
          Опубликовать
        </button>
      </div>
      <div>
        <h3>Последние посты:</h3>
        {messages.map((msg, i) => (
          <div key={i} style={{ 
            padding: "10px", 
            marginBottom: "10px", 
            border: "1px solid #ddd",
            borderRadius: "5px"
          }}>
            <div style={{ color: "#666", fontSize: "0.8em" }}>
              {new Date(msg.timestamp).toLocaleString()} | 
              <strong> Категории: {msg.category}</strong>
            </div>
            <div>{msg.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;