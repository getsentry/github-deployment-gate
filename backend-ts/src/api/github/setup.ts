import express from 'express';

const router = express.Router();

router.post('/', async function (req, res) {
  console.log('setup');
  console.dir(req.body, {depth: null});
  res.json({
    status: 'success',
  });
});

router.post('/callback', async function (req, res) {
  console.log('callback');
  console.dir(req.body, {depth: null});
  res.json({
    status: 'success',
  });
});

export default router;
