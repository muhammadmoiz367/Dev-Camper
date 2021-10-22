const cookie=require('cookie-parser')

const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

//@desc         register a new user
//@route        POST /api/v1/auth/register
//@access       Public
exports.registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  const user = await User.create({
    name,
    email,
    password,
    role,
  });
  sendTokenResponse(user, 200, res)
});

//@desc         login user
//@route        POST /api/v1/auth/login
//@access       Public
exports.loginUser = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    
    //validate fields
    if(!email || !password){
        return next(new ErrorResponse(400, `Please enter email and password to login`))
    }
    //check user
    const user=await User.findOne({ email }).select("+password")
    if(!user){
        return next(new ErrorResponse(401, `Invalid credentials. Please try again`))
    }
    //match passwords
    const isMatch=await user.comparePassword(password);
    if(!isMatch){
        return next(new ErrorResponse(401, `Invalid credentials. Please try again`))
    }
    
    sendTokenResponse(user, 200, res)
  });

const sendTokenResponse=(model, statausCode, res)=>{
    //create token
    const token=model.getSignedInToken()

    const options={
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRES_IN*24*60*60*1000),
        httpOnly: true
    }
    if(process.env.NODE_ENV==='production'){
        options.secure= true
    }
    //send response
    res.status(statausCode)
    .cookie('token', token)
    .json({ success: true, token });
}