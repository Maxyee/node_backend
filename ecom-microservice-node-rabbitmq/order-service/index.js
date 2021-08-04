const express = require('express');
const app = express();
const PORT = process.env.PORT_ONE || 9090;
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const amqp = require("amqplib");
const Order = require('./Order');
const { isAuthenticated } = require('../middleware/isAuthentication');
app.use(express.json());

var channel, connection;

mongoose.connect("mongodb://localhost/order-service", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    },
    () => {
        console.log(`Order-Service DB Connected`);
    }
);

async function connect(){
    const amqpServer = "amqp://localhost:5672";
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    await channel.assertQueue("ORDER");
}

function createOrder(product, userEmail){
    let total = 0;
    for(let t=0; t<products.length; t++){
        total += products[t].price;
    }
    const newOrder = new Order({
        products, 
        user: userEmail,
        total_price: total
    })
    newOrder.save();
    return newOrder;
}

connect().then(() => {
    channel.consume("ORDER", (data) => {
        console.log("Consuming Order queue");
        const { products, userEmail } = JSON.parse(data.content);
        const newOrder = createOrder(products, userEmail);
        channel.ack(data);
        channel.sendToQueue(
            "PRODUCT", 
            Buffer.from(
                JSON.stringify({
                    newOrder
                })
            )
        );
    });
});



app.listen(PORT, () => {
    console.log(`Order-Service at ${PORT}`);
});