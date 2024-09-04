import { commentRepository } from "../database/index.js"
import { Mail, formateData, generatePassword, generateSalt, generateToken, validatePassword } from '../utils/index.js';


// All Business logic will be here
class commentService {

    constructor(){
        this.repository = new commentRepository();
    }

    async createComment(userInputs){

        const { userId, postId, message } = userInputs;
        
        try {
            
            const comment = await this.repository.createComment({ userId, postId, message });
        
            return formateData(comment);

        } catch (err) {
            return err
        }  
    }

    async getUserComments(userInputs) {
        const { userId } = userInputs

        try {
            const comments = await this.repository.findCommentsByUserId({ userId })

            return formateData(comments);
        }   catch(err) {
            return err
        }
        
    }

    async getPostComments(userInputs){
        
        const { postId } = userInputs;
        
        try{
            const comments = await this.repository.findCommentsByPostId({ postId });

            return formateData(comments)

        }catch(err){
            return err
        }

    }

}

export default commentService;