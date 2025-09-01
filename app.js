const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const userModel = require('./models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// serve static files (including index.html)
app.use(express.static(path.join(__dirname, "public")));

app.post("/create", (req, res) => {
    try {
        let { username, email, password, age } = req.body;
        bcrypt.genSalt(10, (err, salt) =>{
            bcrypt.hash(password, salt, async(err,hash) =>{
                let createdUser = await userModel.create({
                    username,
                    email,
                    password:hash,
                    age
                })
                let token = jwt.sign({email}, "Fhaim")
                res.cookie("token", token)
        res.send(createdUser);
    
            })
        })
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message); // show actual error
    }
});

app.get('/login', async function(req,res){
  res.sendFile(__dirname + '/public/login.html');
})

app.post('/login', async function(req,res){
    let user = await userModel.findOne({email: req.body.email})
    console.log({user});
    if(!user) return res.send("wrong user")

    bcrypt.compare(req.body.password, user.password, function(err, result){
    if(result){
        let token = jwt.sign({email:user.email}, "Fahim")
        res.cookie("token", token)
        console.log(token);
        
        res.send('You can login')
    }
        else res.send("something wrong")
        console.log(result);

})
        
    
})
app.get('/logout', function(req,res){
    res.cookie('token','')
    res.redirect('/')
})

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
