
(function() {
    'use strict';
  

    var app = {
      hasRequestPending: false,
      isLoading: true,
      visibleCards: {},
      selectedCities: {},
      weatherData:{},
      spinner: document.querySelector('.loader'),
      cardTemplate: document.querySelector('.cardTemplate'),
      container: document.querySelector('.main'),
      addDialog: document.querySelector('.dialog-container'),
      daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    };

    

     /*****************************************************************************
     *
     * API to get weather data
     *
     ****************************************************************************/

     function getWeatherCurrent(city, cityid, lat, lon)
     {
         var url = '';
         if (city == '' && cityid == 0) // query via lat/lon
         {
            url = '/weather/current/geo/' + lat + '/' + lon;
         }
         else if (city == '') // query via cityid
         {
            url = '/weather/current/cityid/' + cityid;
         }
         else 
         {
          url = '/weather/current/cityname/' + city;
         }
         return axios.get(url);
     }

     function getWeatherForecast(city, cityid,  lat, lon)
     {
        var url = '';
        if (city == '' && cityid == 0) // query via lat/lon
        {
            url = '/weather/forecast/geo/' + lat + '/' + lon;
        }
        else if (city == '') // query via cityid
        {
            url = '/weather/forecast/cityid/' + cityid;
        }
        else 
        {
            url = '/weather/forecast/cityname/' + city;
        }
        return axios.get(url);
     }

     function getWeather(city, cityid, lat, lon , resolve, reject)
     {
        axios.all([getWeatherCurrent(city, cityid,lat, lon),getWeatherForecast(city,cityid, lat, lon)])
        .then(axios.spread(function (cur, forecast) {
          var rd = {current: cur.data,
                forecast: forecast.data };
          resolve(rd);
        }))
        .catch(function(error) 
        {
          reject(error.message);
        }
        );
     }

     


  
    /*****************************************************************************
     *
     * Event  for UI elements
     *
     ****************************************************************************/
  
    $("#butRefresh").click(function(){
      // Refresh all of the forecasts
      app.updateForecasts();
    });
  
    $("#butAdd").click(function(){
        $('#txtCity').removeClass('hidden');
        $('#txtCity').val('');
        $('#butAddConfirm').removeClass('hidden');
        $('#butAddCancel').removeClass('hidden');
        $('#butAdd').addClass('hidden');
    });

    $("#butAddCancel").click(function(){
        $('#txtCity').addClass('hidden');
        $('#butAddConfirm').addClass('hidden');
        $('#butAddCancel').addClass('hidden');
        $('#butAdd').removeClass('hidden');
    });
  
    $("#butAddConfirm").click(function(){
        
        var cityname = $.trim ($("#txtCity").val()) ;
        if( cityname =="") // nothing input 
        {
            $( "#butAddCancel" ).trigger( "click" );
            return;
        }

        app.getForecast(cityname,0,0,0);
        
        $( "#butAddCancel" ).trigger( "click" );

    });
  
  
  
    /*****************************************************************************
     *
     * Methods to update/refresh the UI
     *
     ****************************************************************************/
    function addDays(date, days) {
      var result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    }
  
    // Updates a weather card with the latest weather forecast. If the card
    // doesn't already exist, it's cloned from the template.
    app.updateForecastCard = function(cityId) {
      var data = app.weatherData[cityId];
      if (!data)
      {
        console.log('Cannot find data for city '+  cityId + '. Must something wrong in code.');
        return;
      }
      var card = app.visibleCards[cityId];
      if (!card) {
        card = app.cardTemplate.cloneNode(true);
        card.classList.remove('cardTemplate');
        card.querySelector('.location').textContent = data.forecast.city.name + ',' +  data.forecast.city.country;
        card.removeAttribute('hidden');
        app.container.appendChild(card);
        app.visibleCards[cityId] = card;
      }
      card.querySelector('.description').textContent = data.current.weather[0].description;
      card.querySelector('.date').textContent = data.current.dt_Date;
      card.querySelector('.current .icon').classList.add('w' + data.current.weather[0].icon);
      card.querySelector('.current .temperature .value').textContent =  Math.round(data.current.main.temp*10)/10;
      card.querySelector('.current .tempmax .value').textContent =  Math.round(data.current.main.temp_max*10)/10;
      card.querySelector('.current .tempmin .value').textContent = Math.round(data.current.main.temp_min*10)/10;
      card.querySelector('.current .humidity').textContent =  Math.round(data.current.main.humidity) + '%';
      card.querySelector('.current .wind .value').textContent =   data.current.wind.speed;
      card.querySelector('.current .wind .direction').textContent =         data.current.wind.deg;
      var nextDays = card.querySelectorAll('.future .oneday');
      var today = new Date();
      today = today.getDay();
      var curDay = new Date();
      curDay.setHours(12,0,0);
      var forecastData = data.forecast.list;
      for (var i = 0; i < 4; i++) {
        var nextDay = nextDays[i];
        var daily = forecastData.filter(function(d) {return d.dt_Date>= addDays(curDay,i+1) && d.dt_Date< addDays(curDay,i+2)  })[0];
        if (daily && nextDay) {
          nextDay.querySelector('.date').textContent =   app.daysOfWeek[(i + today) % 7];
          nextDay.querySelector('.icon').classList.add('w'+daily.weather[0].icon);
          nextDay.querySelector('.temp-high .value').textContent =    Math.round(daily.main.temp_max*10)/10;
          nextDay.querySelector('.temp-low .value').textContent =     Math.round(daily.main.temp_min*10)/10;
        }
      }


      var trenddata = [];       
      forecastData.forEach(function(d){
        trenddata.push([d.dt_Date.toLocaleString(), Math.round(d.main.temp_min*10)/10, Math.round(d.main.temp_max*10)/10])
      });

      card.querySelector('.hourlytrend').innerHTML = '';
      var chart = anychart.column( );
      var series = chart.rangeColumn(trenddata);
      chart.xAxis().title("Date/Time");
      chart.yAxis().title("Temperature, \xb0C");
      chart.xAxis().labels(false);
      chart.container(card.querySelector('.hourlytrend'));
      chart.draw();


      if (app.isLoading) {
        app.spinner.setAttribute('hidden', true);
        app.container.removeAttribute('hidden');
        app.isLoading = false;
      }
    };
  
  
    /*****************************************************************************
     *
     * Methods for dealing with the model
     *
     ****************************************************************************/

    app.getForecast = function(city,pcityid, lat, lon) {
        getWeather(city,pcityid,lat,lon,
            function(data){
                var cityId = data.forecast.city.id;
                var timezone = data.forecast.city.timezone;
                data.forecast.list.forEach(function(d)
                    {
                        d.main.temp = d.main.temp -  273.15;
                        d.main.temp_max = d.main.temp_max -  273.15;
                        d.main.temp_min = d.main.temp_min -  273.15;
                        d.dt_Date= new Date(d.dt*1000);
                    }
                );
                data.current.main.temp = data.current.main.temp - 273.15;
                data.current.main.temp_max = data.current.main.temp_max - 273.15;
                data.current.main.temp_min = data.current.main.temp_min - 273.15;
                data.current.dt_Date= new Date(data.current.dt*1000);
                app.weatherData[cityId] = data;// Cache data in momery
                app.updateForecastCard(cityId);
                if ( !(cityId in app.selectedCities))
                {
                  app.selectedCities[cityId] = {'favor' : 0, 'showTrend': 0};
                  app.saveSelectedCities();
                }
                
            },
            function(message)           
            {
                console.error(message);
            });
    };
  
    // Iterate all of the cards and attempt to get the latest forecast data
    app.updateForecasts = function() {
      var keys = Object.keys(app.visibleCards);
      keys.forEach(function(key) {
        app.getForecast('',key,0,0);
      });
    };
  
    // Save list of cities to localStorage, see note below about localStorage.
    app.saveSelectedCities = function() {
      var selectedCities = JSON.stringify(app.selectedCities);
      // IMPORTANT: See notes about use of localStorage.
      localStorage.selectedCities = selectedCities;
    };


     /************************************************************************
     *
     * Service worker
     *
     ************************************************************************/
  
    
  
    var registration;
  
    if('serviceWorker' in navigator) {

      console.log('Service Worker is supported'); 
      navigator.serviceWorker.register('./sw.js')
               .then(function() { console.log('Service Worker Registered'); })
               .catch( function(err) { console.error(err.message) });
              }      

    /*****************************************************************************
     *
     * Set current location if not any cache city
     *   
     ****************************************************************************/

    app.selectedCities = localStorage.selectedCities;
    if (app.selectedCities) {
      app.selectedCities = JSON.parse(app.selectedCities);
      Object.keys(app.selectedCities).forEach(function(city) {
        app.getForecast('',city,0,0);
      });
    } 
    else
    {
 
      app.selectedCities = {};
     if (navigator.geolocation){

        navigator.geolocation.getCurrentPosition(
            function(position)
            {
                var latitude  = position.coords.latitude;
                var longitude = position.coords.longitude;
                app.getForecast('',0,latitude,longitude);
            },
            function() // Cannot get current location
            {
                console.log("Cannot get geo location from API");
            }
        );

      }
    }
  
   

  
  })();