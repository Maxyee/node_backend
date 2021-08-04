# Ecommerce Microservice With Node and Rabbitmq

# Structure for this application using rabbitmq

![alt text](https://github.com/Maxyee/node_backend/blob/master/ecom-microservice-node-rabbitmq/ScreenShot/rabbitmq_one.png)

![alt text](https://github.com/Maxyee/node_backend/blob/master/ecom-microservice-node-rabbitmq/ScreenShot/rabbitmq_two.png)

- we have to make three service
- auth, order and product service
- Into the `auth-service`, `order-service` and `product-service` folder we need to install some packages

```bash
npm install express jsonwebtoken amqplib nodemon
```

- do this work for three separate time into 3 separate folders

- Lets start with the `auth-service`
- we have to install `mongoose` package into the auth service packages

```bash
npm install mongoose
```

- now we have to make a file `index.js` into the auth service folder and put this code into it.

```js
const express = require("express");
const app = express();
const PORT = process.env.PORT_ONE || 7070;
const mongoose = require("mongoose");
app.use(express.json());

mongoose.connect(
  "mongodb://localhost/auth-service",
  {
    userNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => {
    console.log(`Auth-Service DB Connected`);
  }
);

app.listen(PORT, () => {
  console.log(`Auth-Service at ${PORT}`);
});
```

- let create a `Model` file called `User.js` and put the code for user

```js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: String,
  email: String,
  password: String,
  created_at: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = User = mongoose.model("user", UserSchema);
```

- lets export that User model into `index.js` file

```js
const User = require("./User");
```

- now we have to write our register and login API `auth-service/index.js` file

```js
const jwt = require("jsonwebtoken");

// Register
app.post("/auth/register", async (req, res) => {
  const { email, password, name } = req.body;
  const userExists = await User.findOne({ email: email });
  if (userExists) {
    return res.json({ message: "User already registered" });
  } else {
    const newUser = new User({
      name,
      email,
      password,
    });
    newUser.save();
    return res.json(newUser);
  }
});
// Login
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.json({ message: "User does not exist" });
  } else {
    if (password !== user.password) {
      return res.json({ message: "Password Incorrect" });
    }
    const payload = {
      email,
      name: user.name,
    };
    jwt.sign(payload, "secret", (err, token) => {
      if (err) {
        console.log(err);
      } else {
        return res.json({ token: token });
      }
    });
  }
});
```

- now we have to create a authenticated middleware
- lets create a folder `middleware`
- into that folder use below commands

```bash
npm init -y
npm install jsonwebtoken
```

- lets create a file called `isAuthentication.js` into the middleware folder

```bash
touch middleware/isAuthentication.js
```

- put below code to the `isAuthentication.js` file

```js
const jwt = require("jsonwebtoken");

export async function isAuthenticated(req, res, next) {
  const token = req.headers["authorization"].split(" ")[1];
  //"Bearer <token>".split(" ")[1]
  // ["Bearer","<token>"]

  jwt.verify(token, "secret", (err, user) => {
    if (err) {
      return res.json({ message: err });
    } else {
      req.user = user;
      next();
    }
  });
}
```

- now we have to ready our `product-service`

- at first, put the code in `index.js` file

```js
const express = require("express");
const app = express();
const PORT = process.env.PORT_ONE || 8080;
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const amqp = require("amqp");
app.use(express.json());

var channel, connection;

mongoose.connect(
  "mongodb://localhost/product-service",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => {
    console.log(`Product-Service DB Connected`);
  }
);

async function connect() {
  const amqpServer = "amqp://localhost:5672";
  connection = await amqp.connect(amqpServer);
  channel = await connection.createChannel();
  await channel.assertQueue("PRODUCT");
}
connect();

app.listen(PORT, () => {
  console.log(`Product-Service at ${PORT}`);
});
```

- create a file called `Product.js` into the `product-service` directory

- put the code to the file and create the ProductSchema

```js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  name: String,
  description: String,
  price: Number,
  created_at: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = Product = mongoose.model("product", ProductSchema);
```

- now implement that product schema to the `index.js` file

```js
const Product = require("./Product");
```

- lets make the product api

```js
// create product API
app.post("/product/create", isAuthenticated, async (req, res) => {
  const { name, description, price } = req.body;
  const newProduct = new Product({
    name,
    description,
    price,
  });
  newProduct.save();
  return res.json(newProduct);
});

// product buy API
app.post("/product/buy", isAuthenticated, async (req, res) => {
  const { ids } = req.body;
  const products = await Product.find({ _id: { $in: ids } });
});
```

- now for buy product we need store our Orders. So we have to Work with `order-service` first

- into the `order-service` folder create a file called `index.js` and `Order.js` file

```js
// order.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  products: [
    {
      product_id: String,
    },
  ],
  user: String,
  total_price: Number,
  created_at: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = Order = mongoose.model("order", OrderSchema);
```

- and for order `index.js` file

```js
// order service index
const express = require("express");
const app = express();
const PORT = process.env.PORT_ONE || 9090;
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const amqp = require("amqplib");
const Order = require("./Order");
const { isAuthenticated } = require("../middleware/isAuthentication");
app.use(express.json());

var channel, connection;

mongoose.connect(
  "mongodb://localhost/order-service",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => {
    console.log(`Order-Service DB Connected`);
  }
);

async function connect() {
  const amqpServer = "amqp://localhost:5672";
  connection = await amqp.connect(amqpServer);
  channel = await connection.createChannel();
  await channel.assertQueue("ORDER");
}
connect();

app.listen(PORT, () => {
  console.log(`Order-Service at ${PORT}`);
});
```

- now lets complete our product buy API `product-service/index`

```js
app.post("/product/buy", isAuthenticated, async (req, res) => {
  const { ids } = req.body;
  const products = await Product.find({ _id: { $in: ids } });

  channel.sendToQueue(
    "ORDER",
    Buffer.from(
      JSON.stringify({
        products,
        userEmail: req.user.email,
      })
    )
  );
});
```

- for the queue work we now have to open `order-service/index` file

```js
connect().then(() => {
  channel.consume("ORDER", (data) => {
    const { products, userEmail } = JSON.parse(data.content);
    console.log("Consuming Order queue");
    console.log(products);
  });
});

// by writting this code we now can consume data from one service to another using the rabbitmq
```

- Order and Product service queue handling

```js
// product service index
app.post("/product/buy", isAuthenticated, async (req, res) => {
  const { ids } = req.body;
  const products = await Product.find({ _id: { $in: ids } });

  channel.sendToQueue(
    "ORDER",
    Buffer.from(
      JSON.stringify({
        products,
        userEmail: req.user.email,
      })
    )
  );

  channel.consume("PRODUCT", (data) => {
    console.log("Consuming PRODUCT Queue");
    order = JSON.parse(data.content);
    channel.ack(data);
  });
  return res.json(order);
});
```

- finally the order service queue

```js
async function connect() {
  const amqpServer = "amqp://localhost:5672";
  connection = await amqp.connect(amqpServer);
  channel = await connection.createChannel();
  await channel.assertQueue("ORDER");
}

function createOrder(product, userEmail) {
  let total = 0;
  for (let t = 0; t < products.length; t++) {
    total += products[t].price;
  }
  const newOrder = new Order({
    products,
    user: userEmail,
    total_price: total,
  });
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
          newOrder,
        })
      )
    );
  });
});
```

- thats all ..
