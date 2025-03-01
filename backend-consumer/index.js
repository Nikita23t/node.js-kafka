const express = require("express");
const kafka = require("kafka-node");
const cors = require("cors");
const app = express();
app.use(cors());

const clients = new Set();

let categoryStats = {
  scientific: 0,
  entertainment: 0,
  other: 0
};


const client = new kafka.KafkaClient({ kafkaHost: "127.0.0.1:9092" });
const consumer = new kafka.Consumer(
  client,
  [{ topic: "first.topic", partition: 0 }],
  { autoCommit: true }
);

consumer.on("message", (kafkaMessage) => {
  if (kafkaMessage.topic === "first.topic") {
    try {
      const message = JSON.parse(kafkaMessage.value);
      
      const category = message.category?.toLowerCase() || 'other';
      if (categoryStats.hasOwnProperty(category)) {
        categoryStats[category]++;
      } else {
        categoryStats.other++;
      }
      
      console.log("\n=== Новый пост ===");
      console.log("Наполнениие:", message.content);
      console.log("Категории:", category);
      console.log("Статистика:");
      console.table(categoryStats);
      
      clients.forEach(client => {
        client.res.write(`Данные: ${JSON.stringify(message)}\n\n`);
      });
    } catch (err) {
      console.error("Ошибка:", err);
    }
  }
});

consumer.on("message", (kafkaMessage) => {
  if (kafkaMessage.topic === "first.topic") {
    const message = JSON.parse(kafkaMessage.value);
    clients.forEach(client => {
      client.res.write(`data: ${JSON.stringify(message)}\n\n`);
    });
  }
});


app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const clientId = Date.now();
  clients.add({ id: clientId, res });

  req.on("close", () => {
    clients.delete(clientId);
  });
});

app.get("/stats", (req, res) => {
  res.json(categoryStats);
});

app.listen(5002, () => {
  console.log("бэк 2: 5002");
  console.log("Ожидание сообщений...");
});