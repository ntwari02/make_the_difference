const express = require('express');
const carsController = require('../ecommerce/controllers/cars.controller');

const app = express();
app.use(express.json());

app.get('/test', carsController.listCars);

const server = app.listen(3002, () => {
  console.log('Test server started on port 3002');
  
  // Test the endpoint
  const http = require('http');
  const req = http.get('http://localhost:3002/test?limit=1', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('API Response:');
      try {
        const parsed = JSON.parse(data);
        console.log('Success:', parsed.success);
        console.log('Data length:', parsed.data?.length);
        if (parsed.data && parsed.data[0]) {
          console.log('First car images:', parsed.data[0].images);
          console.log('Images type:', typeof parsed.data[0].images);
          console.log('Images length:', parsed.data[0].images?.length);
        }
      } catch (error) {
        console.error('Parse error:', error);
        console.log('Raw data:', data);
      }
      server.close();
      process.exit(0);
    });
  });
  
  req.on('error', (error) => {
    console.error('Request error:', error);
    server.close();
    process.exit(1);
  });
});
