const express =require("express");
const app=express();
const router=require("./routes/pages");
const mysql=require("mysql");
const transaction=require("./routes/transaction");
const client=require("./routes/client_login");
const session=require("express-session");
const bd=require("body-parser");

const dotenv=require('dotenv')


dotenv.config({path:'./.env'});

const oneDay=1000*60*60*24;
 app.use(session({
	secret:'secrete',
	resave:false,
	saveUninitialized:true,
	cookie:{maxAge:oneDay}
}))

app.use(bd.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs");

db=mysql.createConnection({
	host:process.env.HOST_NAME,
	user:process.env.USER,
	password:process.env.PASSWORD,
	database:process.env.DATABASE
});

db.connect(function(err){
	if(err) throw err;
	console.log("Connected mysql");
});

app.use("/admin",router);

app.use("/transaction",transaction);

app.use("/client_login",client);

app.listen(3000,function(){
	console.log('started at 3000');
});