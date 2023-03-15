import express from 'express';

import loginRoutes from './login';

const router = express.Router();

router.use('/login', loginRoutes);

export default router;
