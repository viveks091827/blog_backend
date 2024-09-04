import { parse } from "dotenv";
import { postService } from "../services/index.js";
// const UserAuth = require("./middlewares/auth");

export default function (app) {
  const service = new postService();

  app.post("/posts", async (req, res, next) => {
    try {
      const { userId, title, body } = req.body

      const data = await service.createPost({ userId, title, body });

      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.get("/posts", async (req, res, next) => {
    try {

      let { pageNumber, pageSize, filters, orderBy } = req.query
      console.log('values: ', pageNumber, pageSize, filters, orderBy)
      pageNumber = (pageNumber !== 'undefined') ? parseInt(pageNumber) : parseInt(1);
      pageSize = (pageSize !== 'undefined') ? parseInt(pageSize) : parseInt(10)
      filters = (filters !== 'undefined') ? JSON.parse(filters) : {}
      orderBy = (orderBy !== 'undefined') ? JSON.parse(orderBy) : {createdAt: 'desc'}

      const data = await service.getAllPosts({ pageNumber, pageSize, filters, orderBy });
      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.get("/posts/id/:id", async (req, res, next) => {
    try {

      const { id } = req.params;
      console.log('id: ', id)

      const data = await service.getPosts({ id });

      return res.json(data);
    } catch (err) {
      next(err);
    }
  });


  app.get("/posts/userId/:userId", async (req, res, next) => {
    try {

      const { userId } = req.params;

      const data = await service.getUserPosts({ userId });

      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.get("/post-details/postId/:id", async (req, res, next) => {
    try {

      const { id } = req.params;
      console.log('userId: ', id)

      const data = await service.getPostsWithCommentsAndUsers({ id });


      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

};