import express, { Request, Response } from 'express';

const app = express();
const port = process.env.PORT || 3001;

app.get('/api/v1/status', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
