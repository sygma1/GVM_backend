const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:8000', // FastAPI backend
  timeout: 10000,
});

module.exports = api;