const express = require('express');
const app = express();
const port = 5000;

// Prometheus setup for metrics
const client = require('prom-client');
const register = new client.Registry();
const testPassCounter = new client.Counter({
  name: 'test_pass_total',
  help: 'Total number of passed tests'
});
register.registerMetric(testPassCounter);

// Health endpoint for testing application functionality
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Metrics endpoint to expose Prometheus metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Basic home route
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Export app for testing (e.g., with supertest)
module.exports = app;
