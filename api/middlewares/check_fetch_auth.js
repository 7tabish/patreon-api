const jwt=require('jsonwebtoken');

module.exports=(req,res,next)=>{


   try{   
    if(req.cookies.token){
    jwt.verify(req.cookies.token,'mysecret1',(err,decodedToken)=>{
       if(err instanceof jwt.TokenExpiredError){
        return res.status(201).json({message:"You need to login first to access this endpoints"});
       }
    if(decodedToken){
        req.userId=decodedToken.userId;
        next();
    }


    });
       
    }//close if
    else{
        return res.status(201).json({message:"You need to login first to access this endpoints"});
    }
   
}
catch(error){
    if(error instanceof jwt.TokenExpiredError){
   
        return res.status(201).json({message:"You need to login first to access this endpoints"});
    }
}

}