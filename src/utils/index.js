import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv'
import Mail from './mail.js'
import EmailValidator from "./emailValidator.js"

dotenv.config()

//Utility functions
const generateSalt = async () => {
  return await bcrypt.genSalt();
};

const generatePassword = async (password, salt) => {
  console.log('inside generate password')
  return await bcrypt.hash(password, salt);
};

const validatePassword = async (
  enteredPassword,
  savedPassword,
  salt
) => {
  console.log('inside validatePassword')
  return (await generatePassword(enteredPassword, salt)) === savedPassword;
};

const generateToken = async (payload) => {
  try {
    return await jwt.sign(payload, process.env.APP_SECRET, { expiresIn: "30d" });
  } catch (error) {
    console.log(error);
    return error;
  }
};


const validateToken = async (req) => {
  try {
    const signature = req.get("Authorization");
    console.log(signature);
    const payload = await jwt.verify(signature.split(" ")[1], process.env.APP_SECRET);
    req.user = payload;
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const formateData = (data) => {
  if (data) {
    console.log('inside format data')
    return { data };
  } else {
    throw new Error("Data Not found!");
  }
};

export { Mail, EmailValidator, generateSalt, generatePassword, validatePassword, generateToken, validateToken, formateData }

