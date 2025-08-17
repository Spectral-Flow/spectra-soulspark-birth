#!/usr/bin/env node
import http from 'http';

const payload = JSON.stringify({ source: 'test', title: 'unit test', body: 'This is a voice test log.' });

const opts = {
  hostname: 'localhost',
  port: 49231,
  path: '/voice/log',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = http.request(opts, (res) => {
  let data = '';
  res.on('data', (c) => (data += c));
  res.on('end', () => {
    console.log('status', res.statusCode);
    console.log(data);
  });
});

req.on('error', (err) => console.error('failed', err));
req.write(payload);
req.end();

