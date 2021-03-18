const express=require('express');
const bodyParser=require('body-parser');
const mongoose = require ('mongoose');
const PatronHistory=require('./api/routes/PatronHistory');
const shortid = require('shortid');
const cookie_parser=require('cookie-parser');
require('dotenv').config({path: __dirname + '/.env'});
const app=express();
app.use(bodyParser.json());
app.use(cookie_parser());



mongoose.connect("mongodb://"+process.env['HOST']+"/"+process.env['DATABASE'],{
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
.then(result=>console.log('mongodb connected'))
.catch(err =>console.log(error,err.message));
    app.use('/patron',PatronHistory);

const PORT=process.env['PORT'] || 8080;
app.listen(PORT,()=>console.log('localhost:'+PORT));