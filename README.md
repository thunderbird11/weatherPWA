# Progressive Web App  - Weather APP

This is a POC for weather forecast with PWA.

## Assumption 

 * Local deployment
 * No QPS requirement
 * Tested on Window 10 / Node 10+ / Chrome V76+ Only
 * As POC more focus on functionality
 * UI layout refer https://weather-7f26a.firebaseapp.com/

## Design

![image](https://github.com/thunderbird11/weatherPWA/blob/master/flowchart.jpg)

## Technology 

* **Nodejs** to host local server
* **NPM** to manage package
* **Axios** to get datasource from https://openweathermap.org
* **Anychart** to draw hourly chart
* **PWA** to cache and offline view
* **JQuery** to DOM operation
* **CSS** to render UI


## Features

**Functionality:**
* Add the currecnt geo location for first launch
* Add city from user input without limit number
* Set city as favority or not
* Remove city
* Show current weather details
* Forecast the next 4 days weather
* Show/hide 3 hourly temperture chart, default is not show
* Refresh all list cities weather
* Install/uninstall as an app
* Support offline view with cached data

**non-Functionality:**
* Reponsive
* Render in local with cached data to improve ux


## How to setup in local
* Open terminal and go the code directory to run `npm install`

## How to run in local

* Open terminal and go the code directory to run `npm start`  or `node app.js`
* open chrome to access `http://localhost:8088`

## Known issue

* Need to refresh once after first time launch otherwise service-work don't cache weather data

## Next step

* Top the favority city
* Save and upload user setting to server, so can sync between devices
* Add notification
* Alert when the temperture change significantly 
* Improve UI/UX
* Apply Vue, Vuetify
