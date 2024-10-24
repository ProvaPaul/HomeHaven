import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import userRouter from './routes/user.route.js';

mongoose.connect(process.env.MONGO).then(() => {
    console.log('Connected to MongoDB');
    }   
).catch((error) => {
    console.log('Error:', error.message);
    }
);
const port = process.env.PORT || 4000;



const app = express();

app.use('/api/users', userRouter);

app.listen(port, () => {
    console.log('Server is running on http://localhost:3000');
    }
);