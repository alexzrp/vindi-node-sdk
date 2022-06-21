const nock = require('nock');
const client = require('../src/http/client');

describe('Rate limit', () => {
  beforeAll(async () => {
    nock('http://test.local')
    .get('/user?id=1')
    .reply(429, null, { 'rate-limit-reset': '1' })
    .get('/user?id=1')
    .reply(200, { id: 1 });
  });

  describe('GET /user', () => {
    it('responds with json', async () => {
      const request = new client({ apiKey: '123' });
      const retrySpy = jest.spyOn(request.axios, 'request');
      const { data } = await request.axios.request('http://test.local/user', { params: { id: 1 } });
      expect(data).toStrictEqual({ id: 1 });
      expect(retrySpy).toBeCalledTimes(2);
      expect(retrySpy).toBeCalledWith('http://test.local/user', { params: { id: 1 }, url: 'http://test.local/user' });
      expect(retrySpy).toBeCalledWith('http://test.local/user', { params: { id: 1 }, url: 'http://test.local/user' });

    });
  });
});
