const Axios = require('axios')

class Client {
  constructor(config) {
    
    if (!config.apiKey) {
      config.apiKey = process.env.VINDI_API_KEY
    }
    
    if (!config.apiKey) {
      throw new Error('The apiKey is required.')
    }
    
    this.config = config ? config : {}
  
    this.axios = Axios.create({
      headers: {
        Authorization: this.createBasicAuth(),
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    });
    // Manage vindi rate-limit. Retry after rate limit reset timestamp
    this.axios.interceptors.response.use(
      response => response,
      (error) => {
        if (
          error &&
          error.response &&
          error.response.status === 429 &&
          error.response.headers['rate-limit-reset']
        ) {
          const resetTimestampInMs =
            error.response.headers['rate-limit-reset'] * 1000;
          return new Promise(resolve => {
            setTimeout(() => {
              client.request(error.response.config).then(resolve);
            }, resetTimestampInMs - Date.now());
          });
        }
        return Promise.reject(error);
      },
    );
  }
  
  encodeApiKey() {
    return Buffer.from(this.config.apiKey).toString('base64')
  }
  
  createBasicAuth() {
    return `Basic ${this.encodeApiKey()}`
  }
  
  get(uri, params) {
    return this.axios.get(uri, { params })
  }
  
  post(uri, params) {
    return this.axios.post(uri, params)
  }
  
  put(uri, params) {
    return this.axios.put(uri, params)
  }
  
  delete(uri, params) {
    return this.axios.delete(uri, { params })
  }
}

module.exports = Client
