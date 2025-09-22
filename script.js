// script.js
// Use the API string you provided. We put the key into API_KEY and construct the URL dynamically.
const API_KEY = "4126a34e83794032b7a164912251509"; // your provided key
const BASE_URL = "http://api.weatherapi.com/v1/current.json";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const exampleBtn = document.getElementById("exampleBtn");
const statusEl = document.getElementById("status");
const weatherCard = document.getElementById("weatherCard");
const errorBox = document.getElementById("errorBox");

const setStatus = (html, isError = false) => {
  statusEl.innerHTML = html || "";
  if (isError) {
    errorBox.classList.remove("d-none");
    errorBox.innerText = html;
  } else {
    errorBox.classList.add("d-none");
    errorBox.innerText = "";
  }
};

async function fetchWeather(q) {
  // show loading
  setStatus('Loading... <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>');
  weatherCard.classList.add("d-none");
  try {
    const url = `${BASE_URL}?key=${API_KEY}&q=${encodeURIComponent(q)}&aqi=yes`;
    const res = await fetch(url);
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Network response not ok: ${res.status} ${txt}`);
    }
    const data = await res.json();

    if (data && data.current && data.location) {
      renderWeather(data);
      setStatus(""); // clear status
    } else {
      throw new Error("Unexpected API response structure.");
    }
  } catch (err) {
    console.error(err);
    setStatus("Could not fetch weather. " + (err.message || ""), true);
  }
}

function renderWeather(data) {
  weatherCard.classList.remove("d-none");
  // basic fields
  document.getElementById("locationName").innerText = `${data.location.name}, ${data.location.region || data.location.country}`;
  document.getElementById("localTime").innerText = `Local time: ${data.location.localtime}`;
  document.getElementById("temp").innerText = `${data.current.temp_c} °C (${data.current.temp_f} °F)`;
  document.getElementById("conditionText").innerText = data.current.condition.text;
  document.getElementById("conditionIcon").src = "https:" + data.current.condition.icon; // weatherapi icon is //cdn...
  document.getElementById("feelslike").innerText = `${data.current.feelslike_c} °C`;
  document.getElementById("humidity").innerText = `${data.current.humidity}%`;
  document.getElementById("wind").innerText = `${data.current.wind_kph} kph ${data.current.wind_dir}`;
  document.getElementById("pressure").innerText = data.current.pressure_mb;
  document.getElementById("uv").innerText = data.current.uv;
  document.getElementById("vis_km").innerText = data.current.vis_km;

  // air quality (may be missing)
  if (data.current.air_quality) {
    document.getElementById("aqiBlock").classList.remove("d-none");
    document.getElementById("pm2_5").innerText = (data.current.air_quality.pm2_5 ?? "N/A");
    document.getElementById("pm10").innerText = (data.current.air_quality.pm10 ?? "N/A");
    document.getElementById("us-epa-index").innerText = (data.current.air_quality["us-epa-index"] ?? "N/A");
  } else {
    document.getElementById("aqiBlock").classList.add("d-none");
  }
}

// wire up events
searchBtn.addEventListener("click", () => {
  const q = cityInput.value.trim();
  if (!q) {
    setStatus("Please enter a city or postcode.", true);
    return;
  }
  fetchWeather(q);
});

exampleBtn.addEventListener("click", () => {
  cityInput.value = "London";
  fetchWeather("London");
});

// support Enter key in input
cityInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});

// optional: fetch default on load (commented out)
// fetchWeather("London");
