import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import {errorHandler} from '../utils/error.js';
import jwt from 'jsonwebtoken';

export const signup = async(req, res,next) => {
    const {username, email, password} = req.body;
    const hashPassword = bcryptjs.hashSync(password, 10);
    const newUser= new User({username, email, password: hashPassword});
    try{
      await newUser.save();
    res.status(201).json({message: 'User created successfully!'});   
    }
    catch(error){
        next(error);
    }
}
// export const signin = async(req, res,next) => {
//     const {email, password} = req.body;
//     try{
//       const validUser=await User.findOne({
//         email
//       })
//       if(!validUser){
//         return next(errorHandler(404,'User not found!'));
//       }
//       const validPassword=bcryptjs.compareSync(password, validUser.password);
//       if(!validPassword){
//         return next(errorHandler(400,'Invalid password!'));
//       }
//       // after signing up successfully we have to save the token as cookies in the browser in hash format
//       const token=jwt.sign({id: validUser._id}, process.env.JWT_SECRET);
//       // for not returning password in response
//       const { password:pass,...rest }=validUser._doc;

//       res.cookie ('access_token',token,{httpOnly:true})
//       .status(200)
//       .json(rest);

//     }
//     catch(error){
//       next(error);
//     }
// }
export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
      const validUser = await User.findOne({ email });
      if (!validUser) {
          return next(errorHandler(404, 'User not found!'));
      }

      const validPassword = bcryptjs.compareSync(password, validUser.password);
      if (!validPassword) {
          return next(errorHandler(400, 'Invalid password!'));
      }

      // Generate JWT token
      const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      // Exclude password from response
      const { password: pass, ...userWithoutPassword } = validUser._doc;

      // Set token in cookies and add it to the response JSON
      res.cookie('access_token', token, { httpOnly: true })
          .status(200)
          .json({
              ...userWithoutPassword,
              token // Add token directly in the JSON response body
          });
  } catch (error) {
      next(error);
  }
};

export const google = async(req, res,next) => {
  try{
    const user = await User.findOne({ email:req.body.email });
    if(user){
      const token=jwt.sign({id: user._id}, process.env.JWT_SECRET);
      const { password:pass,...rest }=user._doc;
      res.cookie ('access_token',token,{httpOnly:true})
      .status(200)
      .json(rest);
    }
    else{
      // for creating new password for google user
      const generatedPassword = Math.random().toString(36).slice(-8)+ Math.random().toString(36).slice(-8);
      const hashPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser= new User({username:req.body.name.split(" ").join("").toLowercase()+Math.random().toString(36).slice(-4), email:req.body.email, password: hashPassword,avatar:req.body.photo});
      
      await newUser.save();
      const token=jwt.sign({id: newUser._id}, process.env.JWT_SECRET);
      const { password:pass,...rest }=newUser._doc;
      res.cookie ('access_token',token,{httpOnly:true})
      .status(200)
      .json(rest);
      
    }
  }catch(error){
    next(error);
  }
}

export const signout = (req, res, next) => {
  console.log("Signout endpoint hit");  // Add this line
  try {
    res.clearCookie('access_token');
    res.status(200).json('Signout successfully!');
  } catch (error) {
    next(error);
  }
};
