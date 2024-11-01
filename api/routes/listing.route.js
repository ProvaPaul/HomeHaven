import express from 'express';
import { createListing,deleteListing } from '../controllers/listing.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

// Test route to verify connection
router.get('/test', (req, res) => res.send("Test route working!"));

// Original create listing route
router.post('/create', verifyToken, createListing);
router.delete('/delete/:id', verifyToken, deleteListing);

export default router;
