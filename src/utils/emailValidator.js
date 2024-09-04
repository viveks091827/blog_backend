import emailValidator from 'deep-email-validator'


export default class EmailValidator {
  constructor(){
    
  }

   isEmailValid(email) {
    return emailValidator.validate(email)
   }

}









