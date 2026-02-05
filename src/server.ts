import app from './app';
import dotenv from 'dotenv';

dotenv.config({
  path: '.env',
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
