const express = require('express');
const app = express();
const PORT = process.env.PORT_ONE || 8080;
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const amqp = require('amqp');
const Product = require('./Product');
app.use(express.json());

var channel, connection;

mongoose.connect("mongodb://localhost/product-service", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    },
    () => {
        console.log(`Product-Service DB Connected`);
    }
);

async function connect(){
    const amqpServer = "amqp://localhost:5672";
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    await channel.assertQueue("PRODUCT");
}
connect();

//Create a new product.
// Buy a product.

app.listen(PORT, () => {
    console.log(`Product-Service at ${PORT}`);
});