import express from 'express';

const router = express.Router();

router.get('/sent', (req, res) => {
  res.send('Sent message endpoint');
});

export default router;
