const express=require('express')
const path=require('path')

const hbs=require('express-handlebars')
const session=require("express-session")
var nodemailer=require('nodemailer')
const bodyparser=require('body-parser')
const mysql=require('mysql')

var app=express();

app.use(session({secret:"asdff"}))
app.set('views',path.join(__dirname,'views'))
app.set('view engine','hbs')
app.engine('hbs', hbs({
                        extname: 'hbs',
                        defaultLayout : 'mainLayouts' ,
                        layoutDir: __dirname + '/views/layouts'
                      }));


const con=mysql.createConnection({
        host:'localhost',
        port:'3306',
        database:'cmsdb',
        user:'root',
        password:'Root'
      })

      con.connect(function(err) {
                      if (err) throw err;
                      console.log("Connected!");
                    });


app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended:true}))

app.listen(5000,()=>{console.log(  "Server Started........at 5000"  );})


//code to open admin login page
app.get("/",(req,res)=>{res.render("alog")})


app.get("/home",(req,res)=>{
  res.render("home",{login:req.session.usera})
})


//admin login check
app.post('/logcheck',(request,response)=>{
             var logid=request.body.email;
             var pass=request.body.pass;
             var sql="select * from admin where email=? and password=?";
             var values=[logid,pass]
             sql=mysql.format(sql,values)
                 con.query(sql,(err,result)=>{
                   if (err) throw err;
                   else if(result.length>0)
                      {
                       console.log(result);
                       request.session.usera=logid;
                       response.render('home',{admin:request.session.usera})
                      }
                   else
                       response.render('alog',{ msg:'Login fail, try Again!' })
                     })

                   })


 //code to open a form to add customer
app.get("/addcustomer",(req,res)=>{
                      res.render("createcustomer",{ admin:req.session.usera  })
                   })

 //code to insert new customer data into mysql table
 app.post("/creatcustomer",(request,response)=>{
                    var fname=request.body.fname;
                    var lname=request.body.lname;
                    var logid=request.body.email;
                    var pass=request.body.psw;
                    var mob=request.body.cmob;
                        console.log(pass);
                    var sql="insert into customer (firstname,lastname,email,password,mobileno) values(?,?,?,?,?);"
                    var values=[fname,lname,logid,pass,mob]
                    sql=mysql.format(sql,values)
                    con.query(sql,(err)=>{
                        if(err) throw err;
                        else {response.render("createcustomer",{msg:"Data inserted",admin:request.session.usera})}
                                      })
                                    })


//code to see all customer
app.get("/showcustomer",(request,response)=>{
        var sql="select * from customer;";
        con.query(sql,(err,result)=>{
        if(err) throw err;
        else
        response.render('showcustomer',{data:result,admin:request.session.usera})
                                    })
                                  })



//code to delete customer
app.get('/deletecustomer',(request,response)=>{
  var customerid=request.query.id;
  var sql="delete from customer where customerId=?;"
  var value=[customerid]
  sql=mysql.format(sql,value)
  con.query(sql,(err,result)=>{
    if(err) throw err;
    else if(result.affectedRows!=0){
      var sql="select * from customer;"
                con.query(sql,(err,result)=>{
                      if(err) throw err;
                      else
                     response.render('showcustomer',{data:result,msg:"data deleted successfully....!!",admin:request.session.usera})
                                })
                              }
                            })
                          })




  //code to open update customer form
  app.get("/editcust",(req,res)=>{
    var customerid=req.query.id

    var sql="select * from customer where customerId=?;"
    var value=[customerid]
    sql=mysql.format(sql,value)
              con.query(sql,(err,result)=>{
                console.log(result);
                    if(err) throw err;

            else{

    res.render("updatecustomer",{data:result,admin:req.session.usera}) }
  })
  })



  //code to update customer into mysql table
  app.post("/updatecustomer",(request,response)=>{
                       var customerid=request.body.customerId;
                       var fname=request.body.fname;
                       var lname=request.body.lname;
                       var logid=request.body.logid;
                       var pass=request.body.pass;
                        var mob=request.body.cmob
                     var sql="update customer set firstname=?,lastname=?,email=?,password=?,mobileNo=? where customerId=?;"
                     var values=[fname,lname,logid,pass,mob,customerid]
                     sql=mysql.format(sql,values)
                      con.query(sql,(err)=>{
                      if(err) throw err;
                           else
                           {
                             var sql="select * from customer;";
                                       con.query(sql,(err,result)=>{
                                             if(err) throw err;
                                     else
                                  response.render('showcustomer',{data:result,msg:"data updated successfully....!!",admin:request.session.usera})
                                  })
                           }
                   })
                   })







//code to open a form to add plan
app.get("/addp",(req,res)=>{
        res.render("addplan",{admin:req.session.usera})
                                  })



//code to insert new plan into mysql table
app.post("/addplan",(request,response)=>{
         var pid=request.body.pid;
         var pname=request.body.pname;
         var charge=request.body.charge;

         var sql="insert into plan (planid,planname,charges) values(?,?,?);"
         var values=[pid,pname,charge]
         sql=mysql.format(sql,values)
         con.query(sql,(err)=>{
         if(err) throw err;
         else {response.render("addplan",{msg:"Data inserted",admin:request.session.usera})}
                                                     })
                                                   })


//code to see all plan
app.get("/showplan",(request,response)=>{
        var sql="select * from plan;";
        con.query(sql,(err,result)=>{
        if(err) throw err;
        else
        response.render('showplan',{data:result,admin:request.session.usera})
                                      })
                                    })


//code to delete plan
app.get('/deleteplan',(request,response)=>{
  var planid=request.query.planid;
  var sql="delete from plan where planid=?;"
  var value=[planid]
  sql=mysql.format(sql,value)
  con.query(sql,(err,result)=>{
    if(err) throw err;
    else if(result.affectedRows!=0){
      var sql="select * from plan;"
                con.query(sql,(err,result)=>{
                      if(err) throw err;
                      else
                     response.render('showplan',{data:result,msg:"data deleted successfully....!!",admin:request.session.usera})
                                })
                              }
                            })
                          })




  //code to open update plan form
  app.get("/upplan",(req,res)=>{
    var planid=req.query.planid

    var sql="select * from plan where planid=?;"
    var value=[planid]
    sql=mysql.format(sql,value)
              con.query(sql,(err,result)=>{
                console.log(result);
                    if(err) throw err;

            else{

    res.render("updateplan",{data:result,admin:req.session.usera}) }
  })
  })



  //code to update plan into mysql table
  app.post("/updateplan",(request,response)=>{
                     var pid=request.body.pid;
                     var pname=request.body.pname;
                      var charge=request.body.charge;

                     var sql="update plan set planid=?,planname=?,charges=? where planid=?;"
                     var values=[pid,pname,charge,pid]
                     sql=mysql.format(sql,values)
                      con.query(sql,(err)=>{
                      if(err) throw err;
                           else
                           {
                             var sql="select * from plan;";
                                       con.query(sql,(err,result)=>{
                                             if(err) throw err;
                                     else
                                  response.render('showplan',{data:result,msg:"data updated successfully....!!",admin:request.session.usera})
                                  })
                           }
                   })
                   })



//code to open a form to add account
app.get("/addac",(req,res)=>{
        var sql="select * from customer;";
        con.query(sql,(err,result)=>{
        if(err) throw err;
        else{
             var  data1 =result;
             var sql2="select * from plan;";
             con.query(sql2,(err,result)=>{
                 if(err) throw err;
                 else{
                      var data2=result;
                      res.render("addaccount",{data1:data1,data2:data2,admin:req.session.usera})
                      }
                                            })
              }

                                        })
                                  })


//code to insert new account into mysql table
app.post("/addaccount",(request,response)=>{
                   var customer=request.body.customer;
                   var customerid=customer.split(",")[0]
                   var customername=customer.split(",")[1]
                   var domain=request.body.domain;
                  var domaintaken=request.body.domaintaken;
                  var register=request.body.register;
                  var registerdate=new Date(register)
                  var y1=registerdate.getFullYear()
                  var m1=registerdate.getMonth()+1
                  var d1=registerdate.getDate()
                  registerdate=y1+"-"+m1+"-"+d1
                  var time=request.body.time;
                  var expiry=request.body.expiry;
                  var expirydate=new Date(expiry)
                  var y2=expirydate.getFullYear()
                  var m2=expirydate.getMonth()+1
                  var d2=expirydate.getDate()
                  expirydate=y2+"-"+m2+"-"+d2
                  var dcharge=request.body.dcharge;
                  var hcharge=request.body.hcharge;
                  var tcharge=request.body.tcharge;
                  var plan=request.body.plan;

                   var sql="insert into account (customer_id,name,domain_name,plan,domain_taken,registration,time_period,expiry,domain_charge,hosting,total) values(?,?,?,?,?,?,?,?,?,?,?);"
                   var values=[customerid,customername,domain,plan,domaintaken,registerdate,time,expirydate,dcharge,hcharge,tcharge]
                   sql=mysql.format(sql,values)
                    con.query(sql,(err)=>{
                    if(err) throw err;
                         else {response.render("addaccount",{msg:"Data Inserted",admin:request.session.usera})}
                   })
                 })


 //code to see all account
 app.get("/showaccount",(request,response)=>{
   response.render("showaccount",{admin:request.session.usera})

   // auto mail shoot on expiry date///

     // var sql = "select * from account where  datediff(expiry,curdate()) >=0 and datediff(expiry,curdate()) <=16;";
     // con.query(sql, (err, result) => {
     //     console.log(result[0].customer_id);
     //     if (err)
     //         throw err
     //      else if (result.length != 0) {
     //        var customerid=result[0].customer_id
     //        let sql = 'select * from customer where customerId= ? ';
     //
     //       let values = [customerid]
     //       sql = mysql.format(sql, values)
     //       con.query(sql, (err, result) => {
     //           if (err) throw err
     //           else if (result.length != 0) {
     //         console.log(result[0].email)
     //        let email=result[0].email
     //
     //         var mailOptions = {
     //             from: 'randyortonoo171@gmail.com',
     //             to: email,
     //             subject: "expiry is near hurry up !!!",
     //             text: `Hi there, \n dear {result[0].firstName} , \n your plan is near expiry,\n so please revert back as soon as possible \n  THANK YOU`
     //         }
     //         transporter.sendMail(mailOptions, (err, info) => {
     //             if (err) throw err;
     //             else
     //               {  response.render('showaccount',{login:request.session.usera})
     //             console.log("    ----"); }
     //
     //         })
     //     }
     //            })
     //   }
     // })




  })




  //code to see the accounts by various filters
  app.get('/filterdata', (req, res) => {

  let text = req.query.text + "%"
  console.log(text);
  let filter = req.query.filter
  console.log(filter);
  let sql = "select * from account";
  if (text) {

  sql = "select * from account where name like?";
  console.log('*******'+sql);
  }
  console.log((typeof filter == "undefined"));
  if (filter) {
  if (filter == 'upcoming expiry') {
  sql = 'select * from account where expiry between curdate() and expiry';
  }
  else if (filter == 'current month expiry') {
  sql = 'SELECT *FROM account WHERE MONTH(expiry) = MONTH(CURRENT_DATE()) AND YEAR(expiry) = YEAR(CURRENT_DATE())';
  }
  else
  sql = "select * from account";
  }


  let values = [text]
  sql = mysql.format(sql, values)
  con.query(sql, (err, result) => {
  console.log(sql);
  if (err)
  throw err;
  else if (result.length != 0) {
  res.json({ data: result, msg: "data Found" });
  }
  else {
  console.log(" data not exist");
  res.json({ login:req.session.usera, msg: 'not found' });
  }
  })

  })





  //code to see all transection history
  app.get("/showtransactionhistory",(request,response)=>{

  response.render('transactionhistory',{admin:request.session.usera})
  })



  //code to see transection history between two dates
  app.get('/transactionajax', (req, res) => {

  let date1 = req.query.date1
  console.log(date1);
  let date2 = req.query.date2
  console.log(date2);

  var fdate=new Date(date1)
  var y1=fdate.getFullYear()
  var m1=fdate.getMonth()+1
  var d1=fdate.getDate()
  fdate=y1+"-"+m1+"-"+d1
  var sdate=new Date(date2)
  var y2=sdate.getFullYear()
  var m2=sdate.getMonth()+1
  var d2=sdate.getDate()
  sdate=y2+"-"+m2+"-"+d2


  let sql = 'select * from account where registration between ? and ?';

  let values = [fdate,sdate]
  sql = mysql.format(sql, values)
  con.query(sql, (err, result) => {
  console.log(sql);
  if (err)
  throw err;
  else if (result.length != 0) {
  res.json({ data: result, msg: "data Found" });
  }
  else {
  console.log(" data not exist");
  res.json({ login:req.session.usera, msg: 'not found' });
  }
  })

  })







  //code to logout admin session
  app.get('/alogout',(req,res)=>{
  req.session.destroy();
  res.render('alog',{msg2:'Logout successfully'})

  })
