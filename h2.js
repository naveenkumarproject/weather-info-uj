const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");
const API_KEY = "adf215e6c5b0a52d9609c39382cff01e"; // API key for OpenWeatherMap API
const weatherColors = {
    '01d': '#FFD700', // Clear sky (day)
    '01n': '#1E90FF', // Clear sky (night)
    '02d': '#FF6347', // Few clouds (day)
    '02n': '#4682B4', // Few clouds (night)
    '03d': '#B0C4DE', // Scattered clouds (day)
    '03n': '#4682B4', // Scattered clouds (night)
    '04d': '#D3D3D3', // Broken clouds (day)
    '04n': '#696969', // Broken clouds (night)
    '09d': '#00CED1', // Shower rain (day)
    '09n': '#20B2AA', // Shower rain (night)
    '10d': '#87CEEB', // Rain (day)
    '10n': '#4169E1', // Rain (night)
    '11d': '#B22222', // Thunderstorm (day)
    '11n': '#8B0000', // Thunderstorm (night)
    '13d': '#FFFFFF', // Snow (day)
    '13n': '#F0F8FF', // Snow (night)
    '50d': '#D3D3D3', // Mist (day)
    '50n': '#BEBEBE'  // Mist (night)
};
const createWeatherCard = (cityName, weatherItem, index) => {
    const date = new Date(weatherItem.dt_txt);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
	const weatherIconCode = weatherItem.weather[0].icon;
	   const backgroundColor = weatherColors[weatherIconCode] || '#FFFFFF'; // Default to white if no color is defined
   if(index === 0) { // HTML for the main weather card
        return `<div class="details" style="background-color: ${backgroundColor}; background-image: url('https://openweathermap.org/img/wn/${weatherIconCode}@4x.png'); background-size:200px; background-position: center; background-repeat: no-repeat;">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]}, ${dayName})</h2>
                    <h6>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                    <h6>pressure: ${weatherItem.main.pressure}</h6>
                </div>`;
     } else { // HTML for the other five day forecast card
        return `<li class="card">
                    <h3>(${dayName})</h3>
                    <h6>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                    <h6>pressure : ${weatherItem.main.pressure}</h6>

                </li>`;
    }
}
const weatherImages = {
    Clear: 'Sky Wallpapers HD Free Download.jpg',
    Rain: 'light-rain.jpg',
    Clouds: 'broken-cloud.jpg',
    Snow: 'snow.jpg',
    Mist: 'mist.jpg',
	thunderstorm: 'thunderstorm-1768742_640.jpg'
    // Add more conditions and image paths as needed
};
function setBackgroundImage(weather) {
    const weatherCondition = weather.weather[0].main;
    const imageUrl = weatherImages[weatherCondition] || 'Sky Wallpapers HD Free Download.jpg'; // Fallback image
    document.body.style.backgroundImage = `url('${imageUrl}')`;
}
const weatherData = {
    weather: [{ main: 'Clear' }] // This value should come from the API
};
const getWeatherDetails = (cityName, latitude, longitude) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;
    fetch(WEATHER_API_URL).then(response => response.json()).then(data => { 
		setBackgroundImage(data.list[0]);
      // Filter the forecasts to get only one forecast per day
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (uniqueForecastDays.length<5&&!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
                
            }
        });
        // Clearing previous weather data
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = ""; 
        // Creating weather cards and adding them to the DOM
        fiveDaysForecast.forEach((weatherItem, index) => {
            const html = createWeatherCard(cityName, weatherItem, index);
            if (index === 0) {
               currentWeatherDiv.insertAdjacentHTML("beforeend", html);
            } else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", html);
            }
        });      
    }).catch(() => {
        alert("An error occurred while fetching the weather forecast!");
    });
}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (cityName === "") return ;
    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    // Get entered city coordinates (latitude, longitude, and name) from the API response
    fetch(API_URL).then(response => response.json()).then(data => {
       if (!data.length) return alert(`invalid ${cityName} please enter valid city name`);
        const { lat, lon, name } = data[0];
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("An error occurred while fetching the coordinates!");
    });
}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            // Get coordinates of user location
            // Get city name from coordinates using reverse geocoding API
            const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(API_URL).then(response => response.json()).then(data => {
                 const { name } = data[0];
                getWeatherDetails(name, latitude, longitude);
            }).catch(() => {
                alert("please switch on the network and then use current location");
            });
        },
        error => { // Show alert if user denied the location permission
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            } else {
                alert("please switch on the network");
            }
        });
}
locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());
