import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bitgoRoutes from './routes/bitgo';
import botsRoutes from './routes/bots';
import usersRoutes from './routes/users';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/bitgo', bitgoRoutes);
app.use('/api/bots', botsRoutes);
app.use('/api/users', usersRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});

export default app;
