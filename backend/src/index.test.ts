import request from 'supertest';
import { app } from './index';

describe('GET /api/v1/status', () => {
  it('responds with json', async () => {
    const response = await request(app)
      .get('/api/v1/status')
      .set('Accept', 'application/json');

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});
