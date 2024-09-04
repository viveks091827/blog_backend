import express from 'express';
import expressApp from './express-app.js';



const PORT = 7003

const StartServer = async() => {

    const app = express();
    
    await expressApp(app);

    app.listen(PORT, () => {
        console.log(`listening to port ${PORT}`);
    })
    .on('error', (err) => {
        console.log(err);
        process.exit();
    })
}

StartServer();