const express=require("express");
const session=require('express-session');
const bcrypt=require('bcryptjs');
const router=express.Router();

const authenticate_admin=function(req,res,next){
	if(!req.session.admin_id){
		res.send(`<center><b>Please login<b><br><br><form method="get" action="/admin"><input type="submit" value="Login"></form></center>`);
	}else{
		next();
	}
}

router.get("/",function(req,res){
	res.render('Admin_login',{value:''});
});

var password;
router.post("/login",async function(req,res){
	let sql="SELECT username,password FROM admin";
	// const salt = await bcrypt.genSalt(8);
	var val=req.body.pw;
	
	// var hashvalue=await bcrypt.hash(val,salt);
	// console.log(hashvalue);
	// bcrypt.compareSync(req.body.pw,)
	db.query(sql,function(err,result){
		if (err) throw err;
		var dbun=result[0].username;
		var dbpw=result[0].password;
		var un=req.body.un;
		var pw=req.body.pw;
		bcrypt.compare(val,result[0].password, function(err, result) {
         password=result;
         // console.log(password);
         // console.log(password)
		if (dbun===un && password){
			req.session.admin_id=dbun;
			res.redirect('/admin/Adminpage');
			// console.log(req.session.loggedin); Gives us true value
		}
		else{
			// errr="username or password incorrect";
			res.render('Admin_login',{value:'username or password incorrect'});
		}
     })
	});
});

var result1;
var value=0;
var value2=0;
// Admin page
router.get("/Adminpage",authenticate_admin,function(req,res){
		let sql="Select * FROM client";
		db.query(sql,function(err,result){
			if (err) throw err;
			value=0;
			value2=0;
			result1=result;
			result.forEach( function(no) {
				value=value+no.client_pending;
				value2=value2+no.admin_pending;
			});
			res.render("Admin",{data:result,value:value,value2:value2,success:''});
			// router.locals.data=result
		});
});

// var datainsert=""
router.get("/add",authenticate_admin,function(req,res){
	res.render("add");
})

router.get("/Adminpage2",authenticate_admin,function(req,res){
	let sql="Select * FROM client";
		db.query(sql,function(err,result){
			if (err) throw err;
			value=0;
			value2=0;
			result1=result;
			result.forEach( function(no) {
				value=value+no.client_pending;
				value2=value2+no.admin_pending;
			});
			res.render("Admin",{data:result1,value:value,value2:value2,success:'Data inserted Succesfully'});
		});
	
})

router.post("/adduser",authenticate_admin,async function(req,res){
		var name=req.body.nm;
		var username=req.body.un;
		var email=req.body.em;
		var password=req.body.pw;
		
		const salt = await bcrypt.genSalt(8);
		var hashvalue=await bcrypt.hash(password,salt);
		
		var data=[[name,username,email,hashvalue]];
		if(req.body.nm && req.body.un && req.body.em && req.body.pw){
			let sql="INSERT INTO client (name,username,email,password) VALUES ?";
			db.query(sql,[data],function(err){
				if(err){ 
					console.log(err);
					datainsert="";
					res.send("Enter Valid Data");

				}else{
				// console.log("data inserted");
				// datainsert="User Added"
				res.redirect('/admin/Adminpage2');
				// res.render("Admin",{data:result1,value:value,value2:value2,success:'Data inserted Succesfully'});
			}
		});		
	}
});

router.get("/Adminpage3",authenticate_admin,function(req,res){
	let sql="Select * FROM client";
		db.query(sql,function(err,result){
			if (err) throw err;
			value=0;
			value2=0;
			result1=result;
			result.forEach( function(no) {
				value=value+no.client_pending;
				value2=value2+no.admin_pending;
			});
			res.render("Admin",{data:result1,value:value,value2:value2,success:'User Deleted Succesfully'});
		});
});

router.post("/delete/:id",authenticate_admin,function(req,res){
	let sql=`delete from transaction where client_id=${req.params.id}`;
	db.query(sql,function(err){
		if(err) throw err;
		let sql1=`delete from client where client_id=${req.params.id}`;
		db.query(sql1,function(err){
			if(err) throw err;
			// res.redirect("/admin/Adminpage");
			res.redirect("/admin/Adminpage3")
		})
	})
})

router.get("/logout",function(req,res){
	req.session.admin_id=null;
	res.send(`<center><b>Loggedout</b><br><br><form method="get" action="/admin"><input type="submit" value="Login"></form></center>`);
})

module.exports=router;