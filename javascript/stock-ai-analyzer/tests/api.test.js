import request from 'supertest';
import app from '../server/src/index.js';

describe('API Endpoints', () => {
  it('should resolve ticker for a valid company name', async () => {
    const response = await request(app)
      .get('/api/resolve?name=Apple')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('ticker');
    expect(response.body.ticker).toBe('AAPL');
  });

  it('should fetch stock data for a valid ticker', async () => {
    const response = await request(app)
      .get('/api/stock?ticker=AAPL')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toBeInstanceOf(Array);
  });

  it('should generate a financial report for valid stock data', async () => {
    const response = await request(app)
      .post('/api/report')
      .send({ stockData: [{ ticker: 'AAPL', price: 150 }] })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('report');
    expect(response.body.report).toBeTruthy();
  });

  it('should return 404 for invalid endpoints', async () => {
    await request(app)
      .get('/api/invalid-endpoint')
      .expect(404);
  });
});