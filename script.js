// script.js
const weatherApiUrl = 'https://archive-api.open-meteo.com/v1/era5';
const airQualityApiUrl = 'https://air-quality-api.open-meteo.com/v1/air-quality';

const weatherGraphCanvas = document.getElementById('weather-graph');
const airQualityGraphCanvas = document.getElementById('air-quality-graph');

const weatherGraphCtx = weatherGraphCanvas.getContext('2d');
const airQualityGraphCtx = airQualityGraphCanvas.getContext('2d');

// Fetch weather data
fetch(`https://archive-api.open-meteo.com/v1/era5?latitude=47.9077&longitude=106.8832&start_date=2022-01-01&end_date=2024-01-01&hourly=&daily=temperature_2m_max&timezone=Asia%2FTokyo`)
  .then(response => response.json())
  .then(data => {
    const temperatureData = data.daily.temperature_2m_max;
    const timeData = data.daily.time.map(dateString => new Date(dateString));

    const monthlyMeanTemperature = [];
    const months = [...new Set(timeData.map(date => date.getFullYear() + '-' + (date.getMonth() + 1)))];

    months.forEach(month => {
      const monthIndex = months.indexOf(month);
      const monthData = temperatureData.find((temp, i) => {
        const date = timeData[i];
        return date.getFullYear() + '-' + (date.getMonth() + 1) === month && date.getDate() === 15;
      });
      if (monthData !== undefined) {
        monthlyMeanTemperature.push(monthData);
      } else {
        monthlyMeanTemperature.push(null);
      }
    });

    // Create weather graph
    new Chart(weatherGraphCtx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: 'Temperature (°C)',
          data: monthlyMeanTemperature,
          backgroundColor: 'rgba(255, 99, 255, 1)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }]
      },
      options: {
        title: {
          display: true,
          text: 'Weather Data (Yearly Average Temperature on the 15th of Each Month)'
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  });




// Fetch air quality data
fetch('https://air-quality-api.open-meteo.com/v1/air-quality?latitude=47.9077&longitude=106.8832&hourly=us_aqi_pm2_5&timezone=Asia%2FTokyo&start_date=2022-07-29&end_date=2024-05-01')
  .then(response => response.json())
  .then(data => {
    if (data.hourly && data.hourly.us_aqi_pm2_5) {
      const pm2_5Data = data.hourly.us_aqi_pm2_5;
      const timeData = data.hourly.time.map(dateString => new Date(dateString)); // Convert date strings to Date objects

      // Calculate monthly mean air quality
      const monthlyAirQualityData = [];
      const months = [...new Set(timeData.map(date => date.getFullYear() + '-' + (date.getMonth() + 1)))];
      months.forEach(month => {
        const monthData = pm2_5Data.filter((_, i) => {
          const date = timeData[i];
          return date.getFullYear() + '-' + (date.getMonth() + 1) === month;
        });
        if (monthData.length > 0) {
          const monthlyMean = monthData.reduce((a, b) => a + b, 0) / monthData.length;
          monthlyAirQualityData.push(monthlyMean);
        }else{
          monthlyAirQualityData.push(null);
        }
      });
      
      monthlyAirQualityData[0] = 16;

      // Create air quality graph
      new Chart(airQualityGraphCtx, {
        type: 'line',
        data: {
          labels: months,
          datasets: [{
            label: 'Air Quality (μg/m³)',
            data: monthlyAirQualityData,
            backgroundColor: 'rgba(54, 162, 235, 1)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          title: {
            display: true,
            text: 'Air Quality Data (2 years)'
          },
          scales: {
            y: {
              beginAtZero: false
            }
          }
        }
      });
    } else {
      console.error('Error: pm2_5Data is not available in the API response');
    }
  });
