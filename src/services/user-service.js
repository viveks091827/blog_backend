import { userRepository } from "../database/index.js"
import { Mail, formateData, generatePassword, generateSalt, generateToken, validatePassword, EmailValidator } from '../utils/index.js';
import crypto from 'crypto';


// All Business logic will be here
class userService {

    constructor() {
        this.repository = new userRepository();
    }

    async signIn(userInputs) {

        const { email, password } = userInputs;

        try {
            console.log('email: ', email)
            const existingUser = await this.repository.findUserByEmail({ email });

            if (!existingUser) {
                return formateData('email does not exist please signup first')
            }

            const isEmailVerified = existingUser.isEmailVerified

            if (!isEmailVerified) {
                return formateData('please verify your email first')
            }

            const validPassword = await validatePassword(password, existingUser.password, existingUser.salt);

            if (!validPassword) {
                return formateData({ data: "Email or Password is wrong" });
            }


            const token = await generateToken({ email: existingUser.email, _id: existingUser._id });

            delete existingUser.password
            delete existingUser.salt
            delete existingUser.lastVerificationCode

            return formateData({ user: existingUser, token: token });

        } catch (err) {
            console.log(err)
        }
    }

    async sendVerificationMail(userInput) {
        const { email } = userInput

        try {
            const verificationCode = crypto.randomBytes(20).toString('hex');

            const user = await this.repository.updateVerificationCode({ email, code: verificationCode })


            if (user) {

                const htmlTemplate = `<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        
            <div style="background-color: #f9f9f9; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
              <p style="margin-bottom: 20px; font-size: 16px; line-height: 24px;">Thank you for signing up! Please confirm your email address to activate your account.</p>
              <a href=http://localhost:7003/emailVerify?email=${email}&code=${verificationCode} style="display: inline-block; background-color: #1a82e2; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; font-weight: bold;">Confirm Email</a>
              <p style="display: block; margin-top: 20px; font-size: 14px; color: #666666; text-decoration: none;">If the button doesn't work, copy and paste this url to your browser http://localhost:7003/emailVerify?email=${email}&code=${verificationCode}</p>
            </div>
            <div style="text-align: center; font-size: 14px; color: #666666;">
              &copy; cryptogull. All rights reserved.
            </div>
          </div>`

                const mail = new Mail()
                mail.sendMsg(email, 'Verify your email', htmlTemplate)

                return formateData(`we have sent a mail to ${email} open the mail and verify`);
            }
        } catch (err) {

        }

    }

    async signUp(userInputs) {

        const { email, password, firstName, lastName } = userInputs;
        console.log('first name and last name: ', firstName, lastName)

        try {
            const existingUser = await this.repository.findUserByEmail({ email });

            if (existingUser && !existingUser.isEmailVerified) {
                    return formateData('user exist please verify your email and login')
            }

            let salt = await generateSalt();

            let passwordHash = await generatePassword(password, salt);

            const newUser = await this.repository.createUser({ email, password: passwordHash, salt, firstName, lastName });

            if (newUser) {
                return this.sendVerificationMail({ email })
            }

            return formateData({ data: 'userCreation error' })

        } catch (err) {
            return formateData({ data: 'error while signup' })
        }

    }

    async emailVerify(userInputs) {
        const { email, code } = userInputs;

        try {
            const existingUser = await this.repository.findUserByEmail({ email });

            if (existingUser) {
                if (existingUser.lastVerificationCode == code) {
                    const user = await this.repository.updateEmailVerificationStatus({ email })

                    if (user) {
                        return formateData('email verified');
                    }

                }
                else return formateData('wrong code')
            }
        } catch (err) {
            return { err }
        }
    }

    async getProfile(userInputs) {
        const { id } = userInputs;

        try {
            console.log('inside business logic of getProfile: ', id)
            const userProfile = await this.repository.findUserById({ id });

            console.log('user pfrole: ', userProfile)

            return formateData(userProfile)

        } catch (err) {
            return err
        }
    }

    async updateProfilePic(userInputs) {
        const { fileName, userId } = userInputs;
        console.log('userId: ', userId)

        try {
            console.log('inside business logic')
            const profilePic = await this.repository.updateProfilePicture({ fileName, userId });

            return formateData(profilePic)

        } catch (err) {
            return err
        }
    }

    async getEmailValidatorResult( { email } ) {

        try {
            const emailValidator = new EmailValidator()
            console.log('email: ', email)

            const { valid, reason, validators } = await emailValidator.isEmailValid(email);

            console.log('valid, reson, validators', valid, reason, validators)

            if (valid) {
                return formateData({ status: true, data: 'verified' })
            }
            else {
                return formateData({
                    status: false,
                    message: "Please provide a valid email address.",
                    reason: validators[reason].reason
                })
            }
        }   catch (error) {
            return error
        }

    }

    async getUserExistsResult(userInput) {
        const {email} = userInput
        try {
            const existingUser = await this.repository.findUserByEmail({ email });

            if (existingUser && existingUser.isEmailVerified) {
                return formateData({status: true})
            }
            else {
                return formateData({status: false})
            }

        } catch(error) {
            return error
        }
    }


    async sendPasswordResetEmail(userInput) {
        const { email } = userInput

        console.log('reset password email: ', email)

        try {
           
                const htmlTemplate = `<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        
            <div style="background-color: #f9f9f9; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
              <p style="margin-bottom: 20px; font-size: 16px; line-height: 24px;">Click on button to reset password.</p>
              <a href=http://localhost:3000/resetPassword?email=${email} style="display: inline-block; background-color: #1a82e2; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; font-weight: bold;">Reset</a>
              <p style="display: block; margin-top: 20px; font-size: 14px; color: #666666; text-decoration: none;">If the button doesn't work, copy and paste this url to your browser http://localhost:3000/resetPassword?email=${email}</p>
            </div>
          </div>`

                const mail = new Mail()
                mail.sendMsg(email, 'Reset password', htmlTemplate)

                return formateData(`we have sent a mail to ${email} open the mail and verify`);
            
        } catch (err) {
            return err
        }

    }

    async updatePassword(userInput) {
        const {email, password} = userInput
        try {

            let salt = await generateSalt();

            let passwordHash = await generatePassword(password, salt);

            const updated = await this.repository.updatePassword({ email, passwordHash, salt });
            return formateData(updated)

        } catch(error) {
            return error
        }
    }

    async updateUserDetails(userInput) {
        const { id, data} = userInput

        try {

            const updated = await this.repository.updateUserDetails({ id, data });
            return formateData(updated)

        } catch(error) {
            return error
        }
    }

    async saveUserQuery(userInput) {
        const { name, email, message} = userInput
        console.log('service name email message: ', name, email, message)

        try {

            const updated = await this.repository.addUserQuery({ name, email, message });
            return formateData(updated)

        } catch(error) {
            return error
        }
    }

    async getAllQueries(userInputs) {

        const { pageNumber, pageSize, filters, orderBy } = userInputs
    
        try {
            const posts = await this.repository.findAllQueries({ pageNumber, pageSize, filters, orderBy })

            return formateData(posts);
        } catch (err) {
            return err
        }

    }

}

export default userService;
