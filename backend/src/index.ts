import express, { Request, Response } from 'express';
import { RAGService } from './rag.service';
import * as dotenv from 'dotenv';

dotenv.config();

export const app = express();
const port = process.env.PORT || 3001;

const ragService = RAGService.getInstance();
ragService.init();

app.use(express.json());

app.get('/api/v1/status', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.post('/api/v1/ask', async (req: Request, res: Response) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'Question is required.' });
  }

  try {
    const answer = await ragService.ask(question);
    res.json({ answer });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Backend server is running on http://localhost:${port}`);
  });
}
