const fs = require('fs');
const path = require('path');
const express = require('express');
const axios = require('axios');

const app = express();

const apiKey = '745a37a126ac353117c6137c60bd42f5';
const openWeahercurrent = 'http://api.openweathermap.org/data/2.5/weather';
const openWeaherForecast = 'http://api.openweathermap.org/data/2.5/forecast';

app.use(express.static(path.resolve(__dirname, './')));

app.get('/weather/current/cityid/:cityid', function(req, res) {
  axios.get(openWeahercurrent+'?appid=' +  apiKey + '&id=' + req.params.cityid)
  .then(function(response){res.send(response.data)})
  .catch(function(error){res.status(400).end();});
});
app.get('/weather/forecast/cityid/:cityid', function(req, res) {
  axios.get(openWeaherForecast+'?appid=' +  apiKey + '&id=' + req.params.cityid)
  .then(function(response){res.send(response.data)})
  .catch(function(error){res.status(400).end();});
});
app.get('/weather/current/cityname/:cityname', function(req, res) {
  axios.get(openWeahercurrent+'?appid=' +  apiKey + '&q=' + req.params.cityname)
  .then(function(response){res.send(response.data)})
  .catch(function(error){res.status(400).end();});
});
app.get('/weather/forecast/cityname/:cityname', function(req, res) {
  axios.get(openWeaherForecast+'?appid=' +  apiKey + '&q=' + req.params.cityname)
  .then(function(response){res.send(response.data)})
  .catch(function(error){res.status(400).end();});
});
app.get('/weather/current/geo/:lat/:lon', function(req, res) {
  axios.get(openWeahercurrent+'?appid=' +  apiKey + '&lat=' + req.params.lat + '&lon=' + req.params.lon)
  .then(function(response){res.send(response.data)})
  .catch(function(error){res.status(400).end();});
});
app.get('/weather/forecast/geo/:lat/:lon', function(req, res) {
  axios.get(openWeaherForecast+'?appid=' +  apiKey + '&lat=' + req.params.lat + '&lon=' + req.params.lon)
  .then(function(response){res.send(response.data)})
  .catch(function(error){res.status(400).end();});
});

app.get('*', function(req, res) {
  const html = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf-8')
  res.send(html)
});



app.listen(8088, function() {
  console.log('server listening on port 8088!')
});
