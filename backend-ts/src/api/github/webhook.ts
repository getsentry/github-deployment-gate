import express from 'express';

const router = express.Router();

router.post('/deploymentRule', async function (req, res) {
  console.dir(req.body, {depth: null});
  res.json({
    status: 'success',
  });
});

export default router;
