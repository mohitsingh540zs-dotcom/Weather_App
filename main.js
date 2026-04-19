// importing the Config object from config.js file

import { CONFIG } from "./config.js";
import { AqiStatus, AqiSuggestion, dateFormater, feelsLikeText, formatTo12hr, getRealAQI, getVisualPercentage, HumidityText, iconSeter, normalizeCondition, precipitationText, unitsAssigner, uvStatus, uvSuggestion, visibilityText, WEATHER_THEME } from "./utils.js";

// Cacheing to reduce the expense of dom calls after load creates a object of these instances for better performance and maintainabilty.
const DOM = {
    body: document.body,

    leftPanel: {
        leftCard: document.getElementById("left-card"),
        searchForm: document.getElementById("search-form"),
        dropdown: document.getElementById("dropdown"),
        city_input: document.getElementById("city-name"),
        dropdownContent: document.getElementById("dropdown-content"),
        closeDropDownBtn: document.getElementById("close-dropdown"),
        toggle: document.getElementById("toggle"),
        toggleIndicator: document.getElementById("toggle-circle")
    },

    rightPanel: {
        upComingContainer: document.getElementById("upcoming-container"),
        hourlyContainer: document.getElementById("hourly-container")
    },

    Loader: document.getElementById("loader"),

    uv: {
        uvCard: document.getElementById("uv_card"),
        uvIndicator: document.querySelector("#uv_card .uv-indicator"),
        elements: null
    },
    wind: {
        windCard: document.getElementById("wind-card"),
        compassNeedle: document.getElementById("compass-needle"),
        elements: null
    },
    aqi: {
        aqiCard: document.getElementById("Aqi_card"),
        aqiIndicator: document.querySelector("#Aqi_card .aqi-indicator"),
        elements: null
    },
    Toaster: {
        toast: document.getElementById("toast"),
        msg: document.getElementById("toast-message"),
        icon: document.getElementById("toast-icon")
    }

};
// We assign uv.elements separately because we cannot reference DOM inside its own object definition.
// JavaScript builds the object top-down, so DOM.uv is not accessible during initialization.
DOM.uv.elements = {
    value: DOM.uv.uvCard.querySelector('[data-key="uv-value"]'),
    status: DOM.uv.uvCard.querySelector('[data-key="uv-status"]'),
    suggestion: DOM.uv.uvCard.querySelector('[data-key="uv-suggestion"]')
};
// DOM.wind
DOM.wind.elements = {
    speed: DOM.wind.windCard.querySelector('[data-key="wind-speed"]'),
    gust: DOM.wind.windCard.querySelector('[data-key="wind-gust"]')
};
// DOM.aqi
DOM.aqi.elements = {
    value: DOM.aqi.aqiCard.querySelector('[data-key="aqi-value"]'),
    status: DOM.aqi.aqiCard.querySelector('[data-key="aqi-status"]'),
    suggestion: DOM.aqi.aqiCard.querySelector('[data-key="aqi-suggestion"]')
};

// Destructuring of objects
const { leftPanel, body, Loader, rightPanel } = DOM;

// ShowDropdown function to make dropdown visible
const showDropdown = () => {
    leftPanel.dropdown.classList.remove("hidden");
}
// Function to show loader
const showLoader = () => {
    Loader.classList.remove("opacity-0", "pointer-events-none");
};
// Function to hide loader
const hideLoader = () => {
    Loader.classList.add("opacity-0", "pointer-events-none");
};

// Global variable last City for storing the last city and skipping api call of same city again and again
let lastCity = "";
// Current temp global variable for storing the temp of current searched city to toggle the temp
let currentTemp = null;
// API Caller
const getWeather = async (city_name) => {

    if (!city_name) return;

    //normalize once
    const normalizedCity = city_name.trim().toLowerCase();
    const key = `weather_${normalizedCity}`;

    //avoid duplicate calls
    if (normalizedCity === lastCity) {
        ShowToast("Already showing this city", "info");
        return;
    }

    // cache check 
    const cached = localStorage.getItem(key);

    if (cached) {
        const parsed = JSON.parse(cached);

        const now = Date.now();
        const cacheAge = now - parsed.timestamp;

        const TWENTY_MIN = 20 * 60 * 1000;

        if (cacheAge < TWENTY_MIN) {
            console.log("Using cached data");

            updateUI(parsed.data.forecastData, parsed.data.AQIData);
            ShowToast("Loaded from cache", "info");

            lastCity = normalizedCity;
            return;
        }
    }

    showLoader();

    // To save api call cost
    try {
        //Forecast (5 days, NO hours)
        const forecastURL = `${CONFIG.BASE_URL}${city_name}?unitGroup=metric&include=days,current&days=5&key=${CONFIG.API_KEY}&contentType=json`;

        //Hourly (2 days ONLY)
        const hourlyURL = `${CONFIG.BASE_URL}${city_name}?unitGroup=metric&include=hours&days=2&key=${CONFIG.API_KEY}&contentType=json`;

        const [forecastRes, hourlyRes] = await Promise.all([
            fetch(forecastURL),
            fetch(hourlyURL)
        ]);

        // checks forecast's status
        if (!forecastRes.ok) {
            if (forecastRes.status === 429) {
                ShowToast("Forecast API limit reached", "error");
                return;
            }
            if (forecastRes.status === 404) {
                ShowToast("City not found", "error");
                return;
            }
            throw new Error("Forecast API error");
        }

        // checks hourly status
        if (!hourlyRes.ok) {
            if (hourlyRes.status === 429) {
                ShowToast("Hourly API limit reached", "error");
                return;
            }
            throw new Error("Hourly API error");
        }

        const forecastData = await forecastRes.json();
        const hourlyData = await hourlyRes.json();

        lastCity = normalizedCity;

        //Merge hourly into forecast
        forecastData.days[0].hours = hourlyData.days[0].hours;
        forecastData.days[1].hours = hourlyData.days[1].hours;

        // AQI
        const { longitude, latitude } = forecastData;

        const RawAQIData = await fetch(
            `${CONFIG.AQI_BASE_URL}air_pollution?lat=${latitude}&lon=${longitude}&appid=${CONFIG.AQI_API_KEY}`
        );

        const AQIData = await RawAQIData.json();

        // saving the response in localstorage for cache data
        localStorage.setItem(
            key,
            JSON.stringify({
                data: { forecastData, AQIData },
                timestamp: Date.now()
            })
        );
        updateUI(forecastData, AQIData);

        ShowToast("Successfully fetched", "success");

    } catch (error) {
        console.error("Unable to fetch weather data", error);
        ShowToast("City not found or API error", "error");
    }
    finally {
        setTimeout(() => {
            hideLoader();
        }, 500);
    }
};
// To save the searched history in localStorage.
const saveSearch = (text) => {
    const storageKey = 'city_history';

    const existigHistory = localStorage.getItem(storageKey);
    let historyArray = existigHistory ? JSON.parse(existigHistory) : [];

    if (text && !historyArray.includes(text)) {
        historyArray.push(text);
    }
    localStorage.setItem(storageKey, JSON.stringify(historyArray));
}
// To get the history of searched cities from local storage and display in dropDown.
const getHistory = () => {
    const data = localStorage.getItem('city_history');

    const history = data ? JSON.parse(data) : [];

    leftPanel.dropdownContent.innerHTML = "";

    history.forEach((text) => {
        const btn = document.createElement("button");
        btn.classList.add("p-2", "hover:bg-gray-300", "rounded-xl", "text-left", "hover:text-black", "text-semibold");
        btn.textContent = text;

        btn.addEventListener("click", () => {
            leftPanel.city_input.value = text;
            leftPanel.dropdown.classList.add("hidden");
        })
        leftPanel.dropdownContent.prepend(btn);

    });

}
// TO Provide cities in input 
leftPanel.searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    leftPanel.dropdown.classList.add("hidden");

    const city_name = leftPanel.city_input.value.trim();

    if (!city_name) {
        console.log("Please provide a city name");
        return;
    }

    saveSearch(city_name);
    getHistory();

    getWeather(city_name);

    leftPanel.city_input.value = "";

});
// A eventListener on city_input to show the dropdown when ever its on focus mode.
leftPanel.city_input.addEventListener("focus", () => {
    getHistory();

    const data = JSON.parse(localStorage.getItem("city_history") || "[]");
    if (data.length > 0) {
        showDropdown();
    }
});
// To hide the dropdown 
leftPanel.closeDropDownBtn.addEventListener("click", () => {
    leftPanel.dropdown.classList.add("hidden");
});
// event listener for closing dropdown on click rather then searchform.
document.addEventListener("click", (e) => {
    if (!e.target.closest("#search-form")) {
        leftPanel.dropdown.classList.add("hidden");
    }
});
// toggle eventListener
let isCelsius = true;

leftPanel.toggle.addEventListener("click", () => {
    isCelsius = !isCelsius;

    leftPanel.toggleIndicator.classList.toggle("left-1");
    leftPanel.toggleIndicator.classList.toggle("right-1");

    updateLeftTemp();
});
// RawData formater's
const formatWeatherData = (data) => {
    const { address, currentConditions, description } = data;

    const {
        temp,
        conditions,
        feelslike,
        humidity,
        visibility,
        precip,
        uvindex,
        windspeed,
        winddir,
        windgust
    } = currentConditions;

    return {
        temp,
        conditions,
        desc: description || data.days?.[0]?.description || "No description available",
        feelslike,
        humidity,
        visibility,
        precip,
        uv_index: uvindex,
        wind_speed: windspeed,
        winddir,
        windgust,
        address
    };
};
// Celcius to fahrenheit Converter 
const updateLeftTemp = () => {
    if (currentTemp === null) return;

    const temp = isCelsius
        ? currentTemp
        : (currentTemp * 9 / 5) + 32;

    const unit = isCelsius ? "°C" : "°F";

    const el = leftPanel.leftCard.querySelector('[data-weather="left-temp"]');
    el.textContent = temp.toFixed(1) + unit;
};
// Master Function to update all data
const updateUI = (data, aqiData) => {
    // first we will clean the raw data and then we will send the cleaned data to other updating functions.

    // taking the destructured values in the weather variable->object instance
    const weather = formatWeatherData(data);
    // contains the formated and necessary value of aqi
    const aqi = formatAQIData(aqiData);

    // Necessary wind data
    const wind = {
        winddir: weather.winddir,
        windgust: weather.windgust,
        windspeed: weather.wind_speed
    }

    // Formaters:-
    // Hours Formater function call + taking value(Array) in the hours variable
    const hours = formatHours([...data.days[0].hours, ...data.days[1].hours]);
    // Days Formater function call + taking value(Array) in the days variable
    const days = formatDays(data.days);

    // For toggle the temp we store the val in this global variable
    currentTemp = weather.temp;
    // LeftCard
    updateLeftCard(weather);
    // Dynamic Background
    updateBackground(weather.conditions);
    // HourlyUpdater
    updateHourlyContainer(hours);
    // Upcomingdays Updater
    updateUpcomingForecast(days);
    // Updation of data cards
    updateExtraCards(weather.uv_index, wind, aqi);
}
// left fixed card updation
const updateLeftCard = (data) => {

    const LeftCardMap = {
        "left-address": data.address,
        "left-temp": data.temp,
        "left-condition": data.conditions,
        "left-desc": data.desc,
    }

    Object.keys(LeftCardMap).forEach(key => {
        const element = leftPanel.leftCard.querySelector(`[data-weather="${key}"]`);
        if (!element) return;

        if (key === 'left-temp') {
            updateLeftTemp();
        } else {
            element.textContent = LeftCardMap[key];
        }
    });

    const cardMap = {
        "feelsLike": data.feelslike,
        "humidity": data.humidity,
        "visibility": data.visibility,
        "precip": data.precip
    }

    const adviceMap = {
        feelsLike: () => feelsLikeText(data.temp, data.feelslike),
        humidity: () => HumidityText(data.humidity),
        visibility: () => visibilityText(data.visibility),
        precip: () => precipitationText(data.precip)
    };

    Object.keys(cardMap).forEach(key => {
        const element = leftPanel.leftCard.querySelector(`[data-key="${key}"]`);
        if (!element) return;

        const value = element.querySelector('.data-value');
        const advice = element.querySelector('.data-advice');

        const result = unitsAssigner(cardMap[key], key);

        value.textContent = result ?? 0;

        advice.textContent = adviceMap[key](data);
    });

}
// function to applybackground to main container and left card
const applyBackground = (el, bgPath) => {
    el.style.backgroundImage = `url('${bgPath}')`;
    el.style.backgroundSize = "cover";
    el.style.backgroundPosition = "center";
}
// background updation
const updateBackground = (condition) => {
    const type = normalizeCondition(condition);
    const theme = WEATHER_THEME[type];
    const bgPath = `/assets/weathers/${theme.bg}`


    applyBackground(body, bgPath);
    body.classList.remove("bg-blue-300");

    applyBackground(leftPanel.leftCard, bgPath);
    leftPanel.leftCard.classList.remove("bg-blue-600");
};
// Auto location with fallback to default city
const getUserLocation = () => {
    if (!navigator.geolocation) {
        console.warn("Geolocation not supported → fallback Delhi");
        getWeather("Delhi");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            getWeatherByCoords(lat, lon);
        },
        (error) => {
            console.warn("Location failed → fallback Delhi", error);
            getWeather("Delhi");
        },
        {
            timeout: 5000
        }
    );
};
// takes lat and long acc to user's location 
const getWeatherByCoords = async (lat, lon) => {
    showLoader();
    try {
        const baseURL = `${CONFIG.BASE_URL}${lat},${lon}?unitGroup=metric&key=${CONFIG.API_KEY}&contentType=json`;

        const res = await fetch(baseURL);
        const RawData = await res.json();

        const RawAQIData = await fetch(
            `${CONFIG.AQI_BASE_URL}air_pollution?lat=${lat}&lon=${lon}&appid=${CONFIG.AQI_API_KEY}`
        );

        const AQIData = await RawAQIData.json();

        updateUI(RawData, AQIData);

    } catch (error) {
        console.error("Error fetching location weather", error);
    } finally {
        hideLoader();
    }
};
// a listener which runs on every load
window.addEventListener("load", () => {
    getUserLocation();
});
//for next 24 hours.
const formatHours = (data) => {

    const currentHour = new Date().getHours();

    const startingIndex = data.findIndex(h => parseInt(h.datetime.split(':')[0]) === currentHour);
    const safeIndex = startingIndex === -1 ? 0 : startingIndex;

    const next24 = data.slice(safeIndex, safeIndex + 24);

    return next24.map((hour, index) => ({
        time: index === 0 ? "Now" : formatTo12hr(hour.datetime),
        temp: hour.temp,
        icon: hour.icon,
        condition: hour.conditions
    }));
}
// hourly updation 12 hrs format upto 24hrs
const updateHourlyContainer = (data) => {
    rightPanel.hourlyContainer.innerHTML = "";

    const template = document.getElementById("hourly-template");
    const fragment = document.createDocumentFragment();

    data.forEach(hour => {

        const clone = template.content.cloneNode(true);

        const map = {
            "time": hour.time,
            "temp": hour.temp,
            "icon": hour.icon
        }
        Object.keys(map).forEach(key => {
            const el = clone.querySelector(`[data-hourly="${key}"]`);
            if (el && key === "icon") {
                el.src = iconSeter(map[key]);
                el.alt = iconSeter(map[key]).split('.')[0];
            }
            else {
                el.textContent = key === "temp" ? unitsAssigner(map[key], key) : map[key];
            }
        });
        fragment.appendChild(clone);
    });
    rightPanel.hourlyContainer.appendChild(fragment);
}
//format necessary data for next 5 days.
const formatDays = (data) => {

    return data.slice(1, 6).map(day => ({
        datetime: day.datetime,
        temp: day.temp,
        windspeed: day.windspeed,
        humidity: day.humidity,
        icon: day.icon
    }));
}
// to update the data for next 5days.
const updateUpcomingForecast = (data) => {
    const template = document.getElementById('upcoming-template');

    rightPanel.upComingContainer.innerHTML = "";

    const fragment = document.createDocumentFragment();

    data.forEach(day => {
        const clone = template.content.cloneNode(true);

        const map = {
            date: day.datetime,
            temp: day.temp,
            windspeed: day.windspeed,
            humidity: day.humidity,
            icon: day.icon
        };

        Object.keys(map).forEach(key => {
            const el = clone.querySelector(`[data-upcoming="${key}"]`);
            if (!el) return;

            if (el && key === 'icon') {
                el.src = iconSeter(map[key]);
                el.alt = map[key];
            } else {
                el.textContent =
                    key === "date"
                        ? dateFormater(map[key])
                        : unitsAssigner(map[key], key);
            }
        });

        fragment.appendChild(clone);
    });

    rightPanel.upComingContainer.appendChild(fragment);
};
// UV Index Card provides the data of harmful uv rays with some safety recommendation
const updateUV = (uvValue) => {
    const Status = uvStatus(uvValue);
    const Suggestion = uvSuggestion(Status);

    const uvDOM = DOM.uv;

    //Used cached elements
    uvDOM.elements.value.textContent = uvValue;
    uvDOM.elements.status.textContent = Status;
    uvDOM.elements.suggestion.textContent = Suggestion;

    // indicator logic
    const maxUV = 11;
    let ratio = uvValue / maxUV;
    ratio = Math.max(0, Math.min(1, ratio));

    const min = 4;
    const max = 96;

    const position = min + (max - min) * ratio;

    uvDOM.uvIndicator.style.left = `${position}%`;
};
// Wind Card provides the data of wind in winddrirection, wind gusts
const WindCardUpdate = ({ winddir, windgust, windspeed }) => {

    const windDOM = DOM.wind;

    windDOM.elements.speed.textContent = Math.round(windspeed);
    windDOM.elements.gust.textContent = windgust ? Math.round(windgust) : Math.round(windspeed)


    windDOM.compassNeedle.style.transform = `rotate(${winddir}deg)`;
}
// AQI Rawdata formater
const formatAQIData = (aqiData) => {
    const { components, country } = aqiData.list[0];

    const aqi = getRealAQI(components, country);
    const status = AqiStatus(aqi);

    return {
        aqi,
        pm2_5: components.pm2_5,
        pm10: components.pm10,
        o3: components.o3,
        status,
        suggestion: AqiSuggestion(status),
        color: status === "Good" ? "green-400" :
            status === "Moderate" ? "yellow-400" :
                status === "Unhealthy for Sensitive Groups" ? "orange-400" :
                    status === "Unhealthy" ? "red-400" :
                        status === "Very Unhealthy" ? "purple-400" :
                            "maroon-400"
    };
};
// AQI Card provides the calculated air quality with the help of harmfull pollutants 
const AqiUpdate = (aqi) => {
    const aqiDOM = DOM.aqi;

    // update values (using cached elements)
    aqiDOM.elements.value.textContent = aqi.aqi;
    aqiDOM.elements.status.textContent = aqi.status;
    aqiDOM.elements.suggestion.textContent = aqi.suggestion;

    // Color mapping
    const colorMap = {
        "green-400": "text-green-400",
        "yellow-400": "text-yellow-400",
        "orange-400": "text-orange-400",
        "red-400": "text-red-400",
        "purple-400": "text-purple-400",
        "maroon-400": "text-maroon-400"
    };
    // Border mapping
    const borderMap = {
        "green-400": "border-green-400",
        "yellow-400": "border-yellow-400",
        "orange-400": "border-orange-400",
        "red-400": "border-red-400",
        "purple-400": "border-purple-400",
        "maroon-400": "border-maroon-400"
    };

    // remove old classes
    Object.values(colorMap).forEach(cls =>
        aqiDOM.elements.status.classList.remove(cls)
    );

    const borders = Object.values(borderMap);
    aqiDOM.aqiIndicator.classList.remove(...borders);

    // add new classes
    aqiDOM.elements.status.classList.add(colorMap[aqi.color]);
    aqiDOM.aqiIndicator.classList.add(borderMap[aqi.color]);

    // indicator position
    const percentage = getVisualPercentage(aqi.aqi);
    aqiDOM.aqiIndicator.style.left = `calc(${percentage}% - 10px)`;
};
// Handler of other data cards 
const updateExtraCards = (uv, wind, aqi) => {
    updateUV(uv);
    WindCardUpdate(wind);
    AqiUpdate(aqi);
}

// Custom popups and alert system
let toastTimer;

const ShowToast = (alert, type = "info") => {

    const { Toaster } = DOM
    const toastMap = {
        success: {
            icon: '✅',
            message: "Fetched Successfully",
            bg: "bg-green-400/80"
        },
        error: {
            icon: '❌',
            message: "Something went wrong",
            bg: "bg-red-400/80"
        },
        warning: {
            icon: '⚠️',
            message: "Alert",
            bg: "bg-yellow-500/80"
        },
        info: {
            icon: 'ℹ️',
            message: "Info",
            bg: "bg-blue-400/80"
        }
    };

    const config = toastMap[type] || toastMap.info;

    // message priority: alert param > default message
    Toaster.msg.textContent = alert || config.message;
    Toaster.icon.textContent = config.icon;

    // reset bg cleanly
    Toaster.toast.classList.remove(
        "bg-green-400/80",
        "bg-red-400/80",
        "bg-yellow-500/80",
        "bg-blue-400/80"
    );
    Toaster.toast.classList.add(config.bg);

    // cleared previous timeout
    if (toastTimer) clearTimeout(toastTimer);

    // show
    Toaster.toast.classList.remove("translate-x-full", "opacity-0");

    // hide
    toastTimer = setTimeout(() => {
        Toaster.toast.classList.add("translate-x-full", "opacity-0");
    }, 3000);
};