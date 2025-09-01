const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const userModel = require('./models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { hash } = require("crypto");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// serve static files (including index.html)
app.use(express.static(path.join(__dirname, "public")));

// app.post("/create", (req, res) => {
//     try {
//         let { username, email, password, age } = req.body;
//         bcrypt.genSalt(10, (err, salt) =>{
//             bcrypt.hash(password, salt, async(err,hash) =>{
//                 let createdUser = await userModel.create({
//                     username,
//                     email,
//                     password:hash,
//                     age
//                 })
//                 let token = jwt.sign({email}, "Fhaim")
//                 res.cookie("token", token)
//         res.send(createdUser);
    
//             })
//         })
//     } catch (err) {
//         console.error(err);
//         res.status(500).send(err.message); // show actual error
//     }
// });

app.post('/register', async(req,res) =>{
    let {name, userName, email, password, age} = req.body

    let user = await userModel.findOne({email});
    if(user) return res.status(500).send('User aldready registered');

    bcrypt.genSalt(10, (err, salt) =>{
        bcrypt.hash(password, salt, async(err, hash) =>{
            let user = await userModel.create({
                name,
                userName,
                email,
                password:hash,
                age
            })
            let token = jwt.sign({email:email, userid: user._id}, 'Fahim')
            res.cookie('token', token);
            
            res.send('createdUser')
        })
    }
    )
})
app.get('/login', async function(req,res){
  res.sendFile(__dirname + '/public/login.html');
})

app.post('/login', async (req,res)=>{
    let{email, password}= req.body;
    let user = await userModel.findOne({email})
    if(!user) return res.status(500).send("wrong user")

    bcrypt.compare(password, user.password, function(err, result){
    if(result){
        let token = jwt.sign({emai:email, userid: user._id}, "Fahim")
        res.cookie("token", token)
        res.status(200).redirect('/profile');
        console.log({token});
        
    }
        else res.redirect("/login")
        console.log(result);

})  
})

app.get('/profile', async function(req,res){
  res.sendFile(__dirname + '/public/profile.html');
})
app.get('/profile', isLoggedIn, (req, res)=> {
    console.log(req.user);
    
    res.redirect('/Login')
})

function isLoggedIn (req,res,next){
    if(req.cookies.token === "") res.redirect("/login");
    else{
        let data = jwt.verify(req.cookies.token, "Fahim");
        req.user = data;
        next();

    }
}

app.get('/logout', function(req,res){
    res.cookie('token','')
    res.redirect('/')
})
app.listen(8080, () => {
    console.log("Server running at http://localhost:8080");
});
