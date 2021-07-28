const express = require('express');
const app = express();
const PORT = process.env.PORT_ONE || 7070;
const mongoose = require('mongoose');
const User = require('./User');
const jwt = require('jsonwebtoken');
app.use(express.json());

mongoose.connect("mongodb://localhost/auth-service", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    },
    () => {
        console.log(`Auth-Service DB Connected`);
    }
);


// Register
app.post("/auth/register", async (req, res) => {
    const { email, password, name } = req.body;
    const userExists = await User.findOne({ email: email});
    if(userExists){
        return res.json({ message: "User already registered"});
    }else{
        const newUser = new User({
            name,
            email,
            password
        });
        newUser.save();
        return res.json(newUser);
    }
});
// Login
app.post("/auth/login",async (req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({ email: email});
    if(!user){
        return res.json({ message: "User does not exist"});
    }else{
        if(password !== user.password){
            return res.json({ message: "Password Incorrect"});
        }
        const payload ={
            email,
            name: user.name
        };
        jwt.sign(payload, "secret", (err, token) => {
            if(err){
                console.log(err);
            }
            else{
                return res.json({token: token});
            }
        })
    }
});


app.listen(PORT, () => {
    console.log(`Auth-Service at ${PORT}`);
});