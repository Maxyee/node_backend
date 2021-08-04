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

```
