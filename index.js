console.log("hi!")
const express=require('express');
const app=express();
const MongoClient=require('mongodb').MongoClient;
const assert=require('assert');
const session=require('express-session')
app.use(express.json())
app.use(express.urlencoded());
app.use(session({
    secret:"qwerty"
}))

const url="mongodb://localhost:27017";
const dbname='cart';
let db;
MongoClient.connect(url,{ useUnifiedTopology: true },(err,client)=>{
    assert.equal(null,err)
    console.log("Connected");
    db=client.db(dbname)
});
const isLoggedIn=(req,res,next)=>{
    if(req.session.login){
        return next()
    }else{
        return res.json({
            status:false,
            message:"Not logged in"
        })
    }
}
app.get('/login',(req,res)=>{
    res.sendFile(__dirname+"/login.html")
})
app.post('/login',(req,res)=>{
    let {name,password}=req.body;
    db.collection('users').find({name,password}).toArray((err,result)=>{
        if(err){
            console.log(err)
        }else{
           req.session.login=true;
           req.session.save();
           res.redirect('/new')
        }
    })
})
app.get('/logout',(req,res)=>{
    req.session.destroy()
 })
 app.get('/new',(req,res)=>{
     res.sendFile(__dirname+'/index.html')
 })
 app.post('/new',(req,res)=>{
    let {cooking_time,serves_for,recipe_description,recipe_title}=req.body;
    console.log(req.body)
    const collection=db.collection('documents');
    collection.insertOne({cooking_time,serves_for,recipe_description,recipe_title},(err,result)=>{
        if(err){
            console.log(err)
            res.json({success: false, message: "ERROR ENCOUNTERED"})
        }else
        {
            res.json({success: true, message: "RECIPE ADDED",result})
        }
    });
})
app.get('/all',(req,res)=>{
    const collection=db.collection("documents");
    collection.find().toArray((err,result)=>{
        if(err){
            console.log(err)
        }else{
            return res.json({result})
        }
    })
})
app.listen(3010,()=>console.log("Started"))


