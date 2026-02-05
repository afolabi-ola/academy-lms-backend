import express from 'express';

const app = express();

app.use('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Welcome to app',
  });
});

export default app;
