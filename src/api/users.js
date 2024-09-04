import { userService } from "../services/index.js";
// const UserAuth = require("./middlewares/auth");
import multer from 'multer'
import { RecaptchaV2 } from 'express-recaptcha'

import path from 'path';
import fetch from 'node-fetch'
import fs from 'fs';
import dotenv from 'dotenv'
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, '../../.env') });



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); // specify the destination folder
  },
  filename: (req, file, cb) => {
    const userId = req.query.userId;
    const extension = file.originalname.substring(file.originalname.lastIndexOf('.'));
    console.log('file original name: ', file.originalname)
    console.log('extenstion: ', extension)
    req.body.fileName = 'profilePic_' + userId + extension
    cb(null, 'profilePic_' + userId + extension); // generate a unique filename
  }
});

const upload = multer({ storage: storage });


export default function (app) {
  const service = new userService();

  app.post("/user/signup", async (req, res, next) => {
    try {
      // Get the email and password from the request body
      const { email, password, firstName, lastName } = req.body
      console.log('router: ', firstName, lastName)

      // Call signUp on user service class
      const data = await service.signUp({ email, password, firstName, lastName });

      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.post("/user/signin", async (req, res, next) => {
    try {
      // Get the email and password from the request body
      const { email, password } = req.body;
      console.log('email and password: ', email, password)


      // Call signIn on user service class
      const data = await service.signIn({ email, password });
      console.log(data)
      return res.json(data);
    } catch (err) {
      return res.json('error');
    }
  });

  // Send verification email again
  app.get("/user/verificationEmail", async (req, res, next) => {
    console.log('inside verification email')
    try {
      // Get the email from the request body
      const { email } = req.query;

      // verify email
      const data = await service.sendVerificationMail({ email });

      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  // Define the verification route
  app.get('/emailVerify', async (req, res) => {
    try {
      // Get the email and verification code from the query parameters
      const { email, code } = req.query;

      const data = await service.emailVerify({ email, code });

      res.status(200).send('Verification successful');
    } catch (error) {
      next(error)
    }
  });

  app.get('/profile/:id', async (req, res, next) => {
    try {
      const { id } = req.params

      const data = await service.getProfile({ id });

      res.status(200).json(data);

      console.log('profile id: ', id)
    } catch (error) {
      next(error)
    }
  })

  app.post('/profile/image', upload.single('image'), async (req, res, next) => {

    const { userId, blob, fileName } = req.body


    console.log('cropData: ', req.body)
    console.log('filename: ', fileName)

    try {

      const data = await service.updateProfilePic({ fileName, userId });


      res.status(200).send(data)
    } catch (error) {
      next(error)
    }
  })

  app.get('/user/profilePicture/:id', async (req, res, next) => {
    const id = req.params.id;


    try {
      const user = await service.getProfile({ id });
      const profilePicPath = user.data.profilePicture;
      const dirname = path.join(__dirname, '../uploads');
    
      fs.stat(path.join(dirname, profilePicPath), (err, stats) => {
        if (err) {
          if (err.code === 'ENOENT') {
            console.error('File not found:', profilePicPath);
            // Handle the case when the file is not found, e.g., return a default image
            res.sendFile(path.join(dirname, 'default-profile-pic.png'));
          } else {
            console.error('Error occurred while checking file existence:', err);
            next(err); // Pass the error to the error handling middleware
          }
        } else {
          // File exists
          console.log('File exists:', profilePicPath);
          console.log('File size:', stats.size);
    
          // Send the file as a response
          res.sendFile(profilePicPath, {
            root: dirname,
            headers: { 'Content-Disposition': `attachment; filename="${profilePicPath}"` },
          });
        }
      });
    } catch (error) {
      next(error)
      
    }

  });

  app.get('/user/emailValidator', async (req, res, next) => {
    const { email } = req.query

    console.log('email in route: ', email)
    try {
      const result = await service.getEmailValidatorResult({ email })

      console.log('result: ', result.data)

      const { status } = result.data

      return res.status(200).json({ status: status })

    } catch (error) {
      next(error)
    }
  })

  app.get('/user/userExists', async (req, res, next) => {
    const { email } = req.query

    try {
      const result = await service.getUserExistsResult({ email })

      const { status } = result.data
      console.log('result of user exists: ', result)

      return res.status(200).json({ status: status })
    } catch (error) {
      next(error)
    }

  })

  app.post('/user/resetPasswordEmail', async (req, res, next) => {
    const { email } = req.body

    try {
      const result = await service.sendPasswordResetEmail({ email })

      const { status } = result.data
      console.log('result of user exists: ', result)

      return res.status(200).json({ status: status })
    } catch (error) {
      next(error)
    }

  })

  app.post('/user/resetPassword', async (req, res, next) => {
    const { email, password } = req.body
    console.log('email and password: ', email, password)

    try {
      const result = await service.updatePassword({ email, password })


      return res.status(200).json({ data: result })
    } catch (error) {
      next(error)
    }

  })

  app.put('/user/:id', async (req, res, next) => {
    const data = req.body
    const { id } = req.params

    try {
      const result = await service.updateUserDetails({ id, data })


      return res.status(200).json({ data: result })
    } catch (error) {
      next(error)
    }

  })


  app.post('/user/message', async (req, res, next) => {
    console.log('hiii')
    const { name, email, message } = req.body;
    console.log('api name email message: ', name, email, message)
    const SECRET_KEY = process.env.SECRET_KEY

    try {

      fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${SECRET_KEY}&response=${req.body.gReCaptchaToken}`,
      })
        .then((reCaptchaRes) => reCaptchaRes.json())
        .then(async (reCaptchaRes) => {
          console.log(
            reCaptchaRes,
            "Response from Google reCaptcha verification API"
            , reCaptchaRes.score
          );
          if (reCaptchaRes?.score > 0.5) {
            
            
            console.log('api name email message: ', name, email, message)

            const result = await service.saveUserQuery({ name, email, message })
      
            res.status(200).json({
              status: "success",
              message: "Enquiry submitted successfully",
              data: result
            });
          } else {
            res.status(200).json({
              status: "failure",
              message: "Google ReCaptcha Failure",
            });
          }
        })

    } catch (error) {
      console.log(error)
      next(error)
    }

  })


  app.get("/queries", async (req, res, next) => {
    try {

      let { pageNumber, pageSize, filters, orderBy } = req.query
      console.log('values: ', pageNumber, pageSize, filters, orderBy)
      pageNumber = (pageNumber !== 'undefined') ? parseInt(pageNumber) : parseInt(1);
      pageSize = (pageSize !== 'undefined') ? parseInt(pageSize) : parseInt(10)
      filters = (filters !== 'undefined') ? JSON.parse(filters) : {}
      orderBy = (orderBy !== 'undefined') ? JSON.parse(orderBy) : {createdAt: 'desc'}

      const data = await service.getAllQueries({ pageNumber, pageSize, filters, orderBy });
      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

};

