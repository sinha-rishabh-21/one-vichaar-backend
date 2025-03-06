import jwt from 'jsonwebtoken';

function generateToken(email){
    return jwt.sign({email}, process.env.JWT_SECRET, {expiresIn: '1h'});
}

function verifyToken(token){
    return jwt.verify(token,process.env.JWT_SECRET);
}

function authenticate(req,res,next){
    const token = req.header('Authorization');
    if(!token) return res.status(401).json({error: 'Access denied'});

    try{
        //console.log(token.split(" ")[1]);
        const verified = verifyToken(token.split(' ')[1]);
        req.user = verified;
        next();
    }catch(error){
        res.status(400).json({error: 'Invalid token'});
    }
}

export {generateToken, authenticate};