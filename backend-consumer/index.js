const express = require("express");
const kafka = require("kafka-node");
const cors = require("cors");

const app = express();
app.use(cors());

// SSE clients storage
const clients = new Set();

// Kafka Consumer setup
const client = new kafka.KafkaClient({ kafkaHost: "127.0.0.1:9092" });
const consumer = new kafka.Consumer(
  client,
  [{ topic: "first.topic", partition: 0 }],
  { autoCommit: true }
);

// Send messages to all connected clients
consumer.on("message", (kafkaMessage) => {
  if (kafkaMessage.topic === "first.topic") {
    const message = JSON.parse(kafkaMessage.value);
    clients.forEach(client => {
      client.res.write(`data: ${JSON.stringify(message)}\n\n`);
    });
  }
});


// SSE endpoint
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

app.listen(5002, () => console.log("Consumer SSE: 5002"));