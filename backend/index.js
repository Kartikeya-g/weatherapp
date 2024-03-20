const express = require("express");
const axios = require("axios");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server);

// Geocoding API endpoint
const geocodingApi = "https://api.opencagedata.com/geocode/v1/json";
const geocodingApiKey = "8b686be6d818498daaf2fce3ea2d436a";

// Weather API endpoint
const weatherApi = "https://api.openweathermap.org/data/2.5/weather";
const weatherApiKey = "b8a55b282ccf5f1f8f0338af9d6c8185";

// Convert coordinates to location name
const getLocationName = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      `${geocodingApi}?q=${latitude}+${longitude}&key=${geocodingApiKey}`
    );
    return response.data.results[0].formatted;
  } catch (error) {
    console.error("Error fetching location name:", error);
    return "Unknown Location";
  }
};

// API endpoint to get weather data
app.post("/api/weather", async (req, res) => {
  const { longitude, latitude } = req.body;
  const locationName = await getLocationName(latitude, longitude);
  try {
    const weatherResponse = await axios.get(
      `${weatherApi}?lat=${latitude}&lon=${longitude}&appid=${weatherApiKey}&units=metric`
    );
    const weatherData = {
      location: locationName,
      temperature: weatherResponse.data.main.temp,
      conditions: weatherResponse.data.weather[0].description,
      wind: weatherResponse.data.wind.speed,
      deg: weatherResponse.data.wind.deg,
      feelLike: weatherResponse.data.main.feels_like,
      icon: weatherResponse.data.weather[0].icon,
      // Additional weather data...
    };
    //console.log(weatherResponse.data);
    res.json(weatherData);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

// WebSocket for real-time updates
io.on("connection", (socket) => {
  console.log("Client connected");

  const interval = setInterval(async () => {
    const weatherData = await getWeatherData(); // Implement this function based on your requirements
    socket.emit("weatherUpdate", weatherData);
  }, 30000); // 30 seconds interval

  socket.on("disconnect", () => {
    clearInterval(interval);
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
