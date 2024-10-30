import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';

import cors from 'cors';
const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

mongoose.connect(process.env.MONGO).then(() => {
    console.log('Connected to MongoDB');
    }   
).catch((error) => {
    console.log('Error:', error.message);
    }
);
const port = process.env.PORT || 4000;



app.use(express.json());

app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);

app.use((err, req, res, next) => {
    const statusCode=err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message

    });
});  
app.listen(port, () => {
    console.log(`Server is running on ${port}`);
    }
);