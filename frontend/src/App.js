import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import "./App.css";
import { MapPin, Wind } from "react-feather";

function App() {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    // Connect to the WebSocket server
    const socket = io("http://localhost:3000");

    // Listen for weather updates
    socket.on("weatherUpdate", (data) => {
      setWeather(data);
    });

    // Clean up the effect
    return () => socket.disconnect();
  }, []);

  // Function to fetch weather data based on user's location
  const fetchWeatherData = async () => {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      const response = await axios.post("http://localhost:3000/api/weather", {
        longitude,
        latitude,
      });
      setWeather(response.data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);

  return (
    <div>
      {weather && (
        <div className="app">
          <h1>Weather App</h1>
          <div className="location d-flex">
            <MapPin></MapPin>
          </div>
          <div className="input-wrapper">
            {weather && <div>{weather.location}</div>}
          </div>

          {weather && (
            <div className="content">
              <div className="weatherdesc d-flex flex-c">
                <img
                  src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                  alt=""
                />
                <h3>{weather.conditions}</h3>
              </div>

              <div className="tempstats d-flex flex-c">
                <h1>
                  {weather.temperature} <span>&deg;C</span>
                </h1>
                <h3>
                  Feels Like {weather.feelLike} <span>&deg;C</span>
                </h3>
              </div>

              <div className="windstats d-flex">
                <Wind></Wind>
                <h3>
                  Wind is {weather.wind} Knots in {weather.deg}&deg;
                </h3>
              </div>
            </div>
          )}
        </div>
      )}
      {!weather && <p>Loading weather data...</p>}
    </div>
  );
}

export default App;
