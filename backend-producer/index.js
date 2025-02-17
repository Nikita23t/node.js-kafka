const express = require("express");
const kafka = require("kafka-node");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Kafka setup
const client = new kafka.KafkaClient({ kafkaHost: "127.0.0.1:9092" });
const producer = new kafka.Producer(client);

producer.on("ready", () => {
  console.log("Kafka Producer ready");
});

// API endpoint
app.post("/send", (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: "Message required" });
  }

  const payload = {
    topic: "first.topic",
    messages: JSON.stringify({
      content: message,
      timestamp: new Date().toISOString()
    })
  };

  producer.send([payload], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ status: "Message sent to Kafka" });
  });
});

app.listen(5001, () => console.log("Producer API: 5001"));