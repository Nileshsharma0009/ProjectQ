import express from 'express';
import { register, login, seedUsers } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/seed', seedUsers);

export default router;
