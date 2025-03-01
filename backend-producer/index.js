const express = require("express");
const kafka = require("kafka-node");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const client = new kafka.KafkaClient({ kafkaHost: "127.0.0.1:9092" });
const producer = new kafka.Producer(client);

producer.on("ready", () => {
  console.log("кафка подключена");
});

producer.on("error", (err) => {
  console.error("Ошибка кафки:", err);
});

app.post("/send", (req, res) => {
  const { message, category } = req.body;
  
  if (!message || !category) {
    return res.status(400).json({ error: "Сообщения или категория ошибка" });
  }

  const payload = {
    topic: "first.topic",
    messages: JSON.stringify({
      content: message,
      category: category,
      timestamp: new Date().toISOString()
    })
  };

  producer.send([payload], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ status: "Сообщение отправлено в кафку" });
  });
});

app.listen(5001, () => console.log("бэк первый: 5001"));