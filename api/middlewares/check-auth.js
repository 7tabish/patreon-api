const jwt=require('jsonwebtoken');

module.exports=(req,res,next)=>{


   try{   
    if(req.cookies.token){
    jwt.verify(req.cookies.token,'mysecret1',(err,decodedToken)=>{
       if(err instanceof jwt.TokenExpiredError){
           console.log('token expired');
        next();
       }
    else{
        return res.status(200).json({message:"Already logged in",loggedIn:true});
    }


    });
       
    }//close if
    else{
        next();
    }
   
}
catch(error){
    if(error instanceof jwt.TokenExpiredError){
   
        next();
    }
}

}