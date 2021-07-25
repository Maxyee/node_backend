const express = require('express');
const app = express();
const PORT = process.env.PORT_THREE || 7073;

app.use(express.json());

app.listen(PORT, () => {
    console.log(`Product-Service at ${PORT}`);
});