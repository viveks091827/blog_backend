import { postRepository } from "../database/index.js"
import { Mail, formateData, generatePassword, generateSalt, generateToken, validatePassword } from '../utils/index.js';


// All Business logic will be here
class postService {

    constructor() {
        this.repository = new postRepository();
    }

    async createPost(userInputs) {

        const { userId, title, body } = userInputs;

        try {

            const post = await this.repository.createPost({ userId, title, body });

            return formateData(post);

        } catch (err) {
            return err
        }
    }

    async getAllPosts(userInputs) {

        const { pageNumber, pageSize, filters, orderBy } = userInputs
    
        try {
            const posts = await this.repository.findAllPosts({ pageNumber, pageSize, filters, orderBy })

            return formateData(posts);
        } catch (err) {
            return err
        }

    }

    async getPosts(userInputs) {
        const { id } = userInputs

        try {
            const post = await this.repository.findPostsByPostId({ id })

            return formateData(post);
        } catch (err) {
            return err
        }

    }

    async getUserPosts(userInputs) {

        const { userId } = userInputs;

        try {
            const post = await this.repository.findPostsByUserId({ userId });

            return formateData(post)

        } catch (err) {
            return err
        }

    }

    async getPostsWithCommentsAndUsers(userInputs) {

        const { id } = userInputs;


        try {
            const post = await this.repository.findPostsWithCommentsAndUsers({ id });

            return formateData(post)

        } catch (err) {
            return err
        }

    }


}

export default postService;