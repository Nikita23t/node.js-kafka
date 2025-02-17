### How start app on macOS:

'''bach

// start kafka services

brew services start zookeeper $$ brew services start kafka

//init kafka topic

kafka-topics --bootstrap-server localhost:9092 --topic first.topic --create --partitions 3 --replication-factor 1

// start backend servers

cd backend-producer && npm run start

cd backend-consumer && npm run start

// start frontend 

cd frontend && npm run dev

'''

***With plans to later add message persistence by saving messages to a database. Like psql or mongo, I don't know what it is yet.***
