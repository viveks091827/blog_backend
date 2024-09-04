import { commentService } from "../services/index.js";
// const UserAuth = require("./middlewares/auth");

export default function(app) {
  const service = new commentService();

  app.post("/comment", async (req, res, next) => {
    try {
        const { userId, postId, message } = req.body
        console.log('userid, postid and message: ', userId, postId, message)
        
        const  data  = await service.createComment({ userId, postId, message });
      
        return res.json(data);
    } catch (err) {
        next(err);
    }
  });

  app.get("/comments/post/:postId", async (req, res, next) => {
    try {
      
        const { postId } = req.params;

        const data = await service.getPostComments({ postId });

        return res.json(data);
    } catch (err) {
        next(err);
    }
  });


  app.get("/comments/user/:userId", async (req, res, next) => {
    try {
       
        const { userId } = req.params;

        const data = await service.getUserComments({ userId });

        return res.json(data);
    } catch (err) {
        next(err);
    }
  });

};