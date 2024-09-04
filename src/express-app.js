import express from 'express'
import cors from 'cors'

import { users, posts, comments } from './api/index.js'
import bodyParser from 'body-parser';




export default function async (app) {

    app.use(express.json());
    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: true }));


    users(app);
    posts(app);
    comments(app);
    
}