import axios from 'axios';
const api = axios.create({ headers: { 'Content-Type': 'application/json' } });
const form = new FormData();
api.interceptors.request.use(config => {
  console.log('Headers:', config.headers);
  return config;
});
api.post('/test', form).catch(() => {});
