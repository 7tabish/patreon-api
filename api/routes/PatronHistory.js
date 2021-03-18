const express=require('express');
const app=express();
const Patron=require('../models/patronHistory');
const jwt=require('jsonwebtoken');
const CheckAuth=require('../middlewares/check-auth');
const cookieParser=require('cookie-parser');
const CheckFetchAuth=require('../middlewares/check_fetch_auth');
const CheckLogoutAuth=require('../middlewares/check-logout-auth');



//patron endpoints//

app.post('/',(req,res)=>{
    const attributes=req.body.data.attributes;
    const included=req.body.included;
    const user=included.filter(m=>m.type==="user");
    console.log(user[0].id);

    const _full_name = attributes.full_name;
    const _last_charge_date = attributes.last_charge_date;
    const _last_charge_status = attributes.last_charge_status;
    const _lifetime_support_cents = attributes.lifetime_support_cents;
    const _patron_status = attributes.patron_status;
    const _pledge_amount_cents = attributes.pledge_amount_cents;
    const _pledge_relationship_start = attributes.pledge_relationship_start;
    const _user_id=user[0].id;
    const _secret_token=Math.floor(1000000000 + Math.random() * 9000000000);

    Patron.find({user_id:_user_id}).exec().then(result=>{
        if(result.length>0){
            return res.status(202).json({message:"This id is already registered"});
        }
        else{
            //creating new user
                const patron= new Patron({
                user_id: _user_id,
                secret_token:_secret_token,
                full_name: _full_name,
                last_charge_date:_last_charge_date,
                last_charge_status:_last_charge_status,
                lifetime_support_cents:_lifetime_support_cents,
                patron_status:_patron_status,
                pledge_amount_cents:_pledge_amount_cents,
                pledge_relationship_start:_pledge_relationship_start,
            });
            patron.save()
            .then(result=>{
                if(result){
                    console.log('new account created');
                    console.log(result);
                    return res.status(200).json({id:result.user_id,secret_token:result.secret_token});
                }
            })
            .catch(error=>res.status(500).json({Error:error.message}));
      
        }//close else
    }).catch(error=>res.status(500).json({Error:error.message}));
})



app.post('/delete',(req,res)=>{
    const included=req.body.included;
    const user=included.filter(m=>m.type==="user");
    console.log('delete call');
    console.log(user[0].id);
    const updateData={
        pledge_amount_cents:0,
        patron_status :'deactive'
    }
    Patron.findOneAndUpdate({user_id:user[0].id},updateData,{new:true,useFindAndModify: false})
    .exec().then(result=>{
        if(result){
            res.status(200).json({updated_data:result,length:result.length});
        }
        
    }
       
        )
    .catch(error=>res.status(500).json({Error:error.message}));
});

app.post('/edit',(req,res)=>{
    const attributes=req.body.data.attributes;
    const included=req.body.included;
    const _last_charge_date = attributes.last_charge_date;
    const _pledge_amount_cents = attributes.pledge_amount_cents;
    const user=included.filter(m=>m.type==="user");
    const updateData={
        pledge_amount_cents:_pledge_amount_cents,
        last_charge_date:_last_charge_date
   
    }
    Patron.findOneAndUpdate({user_id:user[0].id},updateData,{new:true,useFindAndModify: false})
    .exec().then(result=>{
        if(result){
            res.status(200).json({updated_data:result,length:result.length});
        }
        
    }
       
        )
    .catch(error=>res.status(500).json({Error:error.message})); 
})

app.get('/fetch',CheckFetchAuth,(req,res)=>{

Patron.find({user_id:req.userId}).select('full_name').select('pledge_amount_cents').select('user_id')
.exec().
then(result=>{
    if(result){
        const amount_cents=result[0].pledge_amount_cents;
        const codeSnipet=[];
        if(amount_cents>=100 && amount_cents<200){
            codeSnipet.push({level:100,code:'js and html for level 100'});
        }
        if(amount_cents>=200 && amount_cents<500){
            codeSnipet.push({level:100,code:'js and html for level 100'});
            codeSnipet.push({level:101,code:'js and html for level 101'});
        }
        if(amount_cents>=500){
            codeSnipet.push({level:100,code:'js and html for level 100'});
            codeSnipet.push({level:101,code:'js and html for level 101'});
            codeSnipet.push({level:102,code:'js and html for level 102'});
        }
        return res.status(200).json({User_info:result[0],codeSnipet:codeSnipet});
    }
}).catch(error=>res.status(500).json({Error:error.message}));
});

app.post('/login',CheckAuth,(req,res)=>{
    if(!req.body.id || !req.body.secret_token){
        return res.status(201).json({message:'Must provide id and secret token.'});
    }
    Patron.find({user_id:req.body.id})
    .exec().then(result=>{
        if(result.length>0){
            //check is the secret matches

        if(result[0].patron_status === 'active_patron'){
            console.log('active');
            if(result[0].secret_token === req.body.secret_token){
              
                //generate json web token
                const _token=jwt.sign({
                    userId:result[0].user_id,
                },
                "mysecret1",
                {
                    expiresIn:'1h'
                });

                res.cookie("token",_token);
                return res.status(200).json({token:_token,loggedIn:true});
            }
            else{
                return res.status(202).json({message:"Secret token not matches.",loggedIn:false});
            }
        }//close if patron_status
       else{
           var charge_date=result[0].last_charge_date;
         charge_date=new Date(charge_date);
        const current_date= new Date();
        const time_difference=current_date.getTime()-charge_date.getTime();
        const day_difference= Math.ceil(time_difference /(1000 * 3600 * 24)); 
            if(day_difference>32){
                return res.status(202).json({message:'You have no access to this account more.',loggedIn:false});
            }
          
            if(result[0].secret_token === req.body.secret_token){
              
                //generate json web token
                const _token=jwt.sign({
                    userId:result[0].user_id,
                },
                "mysecret1",
                {
                    expiresIn:'1h'
                });

                res.cookie("token",_token);
                return res.status(200).json({token:_token,loggedIn:true});
            }
            else{
                return res.status(202).json({message:"Secret token not matches.",loggedIn:false});
            }
        
       }    
      

        }//close if result.length>0
        else{
            return res.status(404).json({Error:"No record found with this id."});
        }
      
    })
    .catch(error=>res.status(500).json({message:error.message}));

})





app.get('/logout',CheckLogoutAuth,(req,res)=>{
    res.clearCookie('token');
    res.status(200).json({message:"logged out successfully"});
})






app.post('/test',(req,res)=>{
    const attributes=req.body.data.attributes;
    const included=req.body.included;
    const user=included.filter(m=>m.type==="user");
    console.log(user[0].id);

    const _full_name = attributes.full_name;
    const _last_charge_date = attributes.last_charge_date;
    const _last_charge_status = attributes.last_charge_status;
    const _lifetime_support_cents = attributes.lifetime_support_cents;
    const _patron_status = attributes.patron_status;
    const _pledge_amount_cents = attributes.pledge_amount_cents;
    const _pledge_relationship_start = attributes.pledge_relationship_start;
    const _user_id=user[0].id;

    console.log(_full_name,_last_charge_date,_last_charge_status,
        _lifetime_support_cents,_patron_status,_pledge_amount_cents,
        _pledge_relationship_start,_user_id
        );
        res.send('done');
})
app.get('/',(req,res)=>{
    res.send('Message from patron api');
})
module.exports=app;