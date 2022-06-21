const nock = require('nock');
const client = require('../src/http/client');

describe('Rate limit', () => {
  beforeAll(async () => {
    nock('http://test.local')
    .get('/user')
    .reply(429, null, { 'rate-limit-reset': 1 })
    .get('/user')
    .reply(200, { ok: true });
  });

  describe('GET /user', () => {
    it('responds with json', async () => {
      const request = new client({ apiKey: '123' });
      const { data } = await request.get('http://test.local/user');
      expect(data).toStrictEqual({ ok: true });
    });
  });
});
