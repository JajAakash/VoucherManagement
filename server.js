const express=require('express');

const bodyParser=require('body-parser');

const path=require('path');

const port =process.env.PORT || 5000;

const app=express();

const api=require('./server/routes/api');



app.use(express.static(path.join(__dirname,'dist')));
//app.use(express.cookieParser());
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use('/',api);

app.get('*',(req,res)=>{
    res.sendfile(path.join(__dirname,'dist'));

});

app.listen(port,function(){
    console.log("server running on port:" + port)

});
