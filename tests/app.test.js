const request = require('supertest');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Hello DevOps World! 🚀'));

describe('GET /', () => {
  it('responds with Hello DevOps World!', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toBe('Hello DevOps World! 🚀');
  });
});
