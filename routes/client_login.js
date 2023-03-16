const express=require("express");
// const session=require("express-session");
const client=express.Router();
const bcrypt=require("bcryptjs");

const authenticate_client=function(req,res,next){
	if(req.session.client_usr!=req.params.username){
		res.send(`<center><b>Please login<b><br><br><form method="get" action="/client_login"><input type="submit" value="Login"></form></center>`);
	}else{
		next();
	}
}
var errr="";
var pw;
var dbun;
var dbpw;
client.get("/",function(req,res){
	res.render("client_login",{value:errr});
});

client.post("/login",async function(req,res){
	errr=""
	var un=req.body.un;
	var unv;
	pw=req.body.pw;
	let sql=`SELECT username,password FROM client`;
	db.query(sql,function(err,result){
		if (err){
			throw err;
			}else{
				var pwv;
		for(var i=0;i<result.length;i++){
			if(result[i].username===un){
				unv=true;
				dbpw=result[i].password;
				dbun=result[i].username;

			bcrypt.compare(pw,dbpw,pwv=function(err,result){
			if(err) {throw err};
			return result;
			})
			
			break;
			}else{
				unv=false;
				pwv=false;
			}
		};

		if (unv && pwv){

			req.session.client_usr=dbun;

			dbpw="";
			res.redirect(`/client_login/client/${req.body.un}`);
		}
		else{
			errr="username or password incorrect";
			dbpw="";
			res.redirect('/client_login');
		}
	}
	});
});

var client_detail;
var client_trans;
client.get("/client/:username",authenticate_client,function(req,res){
		let sql=`select client_id,username,client_pending,admin_pending from client where username='${req.params.username}'`;
		db.query(sql,function(err,result){
			if(err) throw err;
			client_detail=result;
			var id=client_detail[0].client_id;
			let sql1=`select * from transaction where client_id=${id}`;
			db.query(sql1,function(err,result){
				client_trans=result;
				res.render("client",{data:client_detail,d:client_trans});
			})
			
		})
})

client.get("/scan/:username",authenticate_client,function(req,res){
	res.render("client-qrcode",{client_usr:req.params.username});
})

client.get("/logout",function(req,res){
	req.session.client_usr=null;
	res.send(`<center><b>Logged out<b><br><br><form method="get" action="/client_login/"><input type="submit" value="Login"></form></center>`);
})

module.exports=client;