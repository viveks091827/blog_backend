import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import path from 'path'
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });


const email = "singhvivek8921@gmail.com"
const verificationCode = '123456'
// Send the verification email

export default class Mail {
  constructor(){
    
  }

  sendMsg(to, subject, htmlText) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWORD,
      },
    });

   
    console.log('html text: ', htmlText)

    const mailOptions = {
      from: 'devacc8921@gmail.com',
      to: to,
      subject: subject,
      html: htmlText,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }

}
