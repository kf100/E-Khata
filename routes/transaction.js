const express=require("express");
const session=require("express-session");
const tr=express.Router();

const authenticate=function(req,res,next){
	if(!req.session.admin_id){
		res.send(`<center><b>Please login<b><br><br><form method="get" action="/admin/"><input type="submit" value="Login"></form></center>`);
	}else{
		next();
	}
}

var gave=0;
var received=0
var cp,ap=0;

tr.post("/edit/:id",authenticate,function(req,res){
	let sql=`select * from client where client_id=${req.params.id}`
	db.query(sql,function(err,result){
		if(err) throw err;
		res.render("edit",{data:result});
	})
	
})

tr.post("/gave/:client_id",authenticate,function(req,res){
		var today = new Date();
		var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
		var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
		var dateTime = date+' '+time;
	// gave=req.body.yougave;
		let sql1=`select client_pending,admin_pending from client where client_id=${req.params.client_id}`
		db.query(sql1,function(err,result){
			if(err) throw err;
			cp=result[0].client_pending;
			ap=result[0].admin_pending;
			gave=Number(req.body.yougave);		
			if(ap===0){

				cp=cp+gave;
				let sql2=`update client set client_pending=? where client_id=${req.params.client_id}`;
				db.query(sql2,cp,function(err,result){
					if(err) throw err;
					console.log("No admin Pending and Updated Client Pending");
				});
				
				let tsql=`insert into transaction (client_id,date,debited,credited,comment) values (${req.params.client_id},'${dateTime}',${gave},0,'${req.body.comment}')`;
				
				// var values=[[dateTime,0,received,""]];
				db.query(tsql,function(err,result){
					if(err) throw err;
				})
			}
		
			else if(ap>=gave){
				ap=ap-gave;
				let sql2=`update client set admin_pending=? where client_id=${req.params.client_id}`;
				db.query(sql2,ap,function(err,result){
					if(err) throw err;
					console.log("Admin Pending Greater Than admin gave So admin Updated");
				});

				let tsql=`insert into transaction (client_id,date,debited,credited,comment) values (${req.params.client_id},'${dateTime}',${gave},0,'${req.body.comment}')`;
				
				// var values=[[dateTime,0,received,""]];
				db.query(tsql,function(err,result){
					if(err) throw err;
				})
			}
			else {
				var gv=gave;
				gave=gave-ap;
				let sql3=`update client set admin_pending=0,client_pending=? where client_id=${req.params.client_id}`;
				db.query(sql3,gave,function(err){
					if(err) throw err;
					console.log("Amount greater than Admin Pending So Admin set to 0 and Client to Amount")
				})

				let tsql=`insert into transaction (client_id,date,debited,credited,comment) values (${req.params.client_id},'${dateTime}',${gv},0,'${req.body.comment}')`;
				
				// var values=[[dateTime,0,received,""]];
				db.query(tsql,function(err,result){
					if(err) throw err;
				})
			}
			res.redirect("/admin/Adminpage");
		});

})

tr.post("/received/:client_id",authenticate,function(req,res){
		var today = new Date();
		var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
		var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
		var dateTime = date+' '+time;
		
		let sql=`select client_pending,admin_pending from client where client_id=${req.params.client_id}`;
		db.query(sql,function(err,result){
			
			if(err) throw err;
			cp=result[0].client_pending;
			ap=result[0].admin_pending;
			received=Number(req.body.youreceived);
			if(cp===0){
				ap=ap+received;
				let sql1=`update client set admin_pending=? where client_id=${req.params.client_id}`;
				db.query(sql1,ap,function(err,result){
					if(err) throw err;
					console.log("No Client pending so amount added to admin pending");
				});

				let tsql=`insert into transaction (client_id,date,debited,credited,comment) values (${req.params.client_id},'${dateTime}',0,${received},'${req.body.comment}')`;
				
				// var values=[[dateTime,0,received,""]];
				db.query(tsql,function(err,result){
					if(err) throw err;
				})

			}
			else if(received<=cp){
				cp=cp-received;
				let sql2=`update client set client_pending=? where client_id=${req.params.client_id}`
				db.query(sql2,cp,function(err,result){
					if (err) throw err;
					console.log("Received payment less than client pendind so minused amount stored in client_pending");
				})
				let tsql=`insert into transaction (client_id,date,debited,credited,comment) values (${req.params.client_id},'${dateTime}',0,${received},'${req.body.comment}')`;
				
				// var values=[[dateTime,0,received,""]];
				db.query(tsql,function(err,result){
					if(err) throw err;
				})
			}
			else{
				var rc=received;
				received=received-cp;
				let sql3=`update client set client_pending=0,admin_pending=? where client_id=${req.params.client_id}`;
				db.query(sql3,received,function(err,result){
					if (err) throw err;
					console.log("Received Amount greater than client so remaining amount stored in admin_pending");
				});
				
				let tsql=`insert into transaction (client_id,date,debited,credited,comment) values (${req.params.client_id},'${dateTime}',0,${rc},'${req.body.comment}')`;
				
				db.query(tsql,function(err,result){
					if(err) throw err;
				})
			}
			res.redirect("/admin/Adminpage");
		});

});

tr.post("/trans/:client_id/:username/:name",authenticate,function(req,res){
	let sql=`select * from transaction where client_id=${req.params.client_id}`;
	db.query(sql,function(err,result){
		if(err) throw err;
		var user=req.params.username;
		var name=req.params.name;
		var c_id=req.params.client_id;
		res.render("transaction.ejs",{data:result,username:user,cid:c_id,name:name});
	});
});

module.exports=tr;