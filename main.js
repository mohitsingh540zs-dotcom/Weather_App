// importing the Config object from config.js file

import { CONFIG } from "./config.js";
import { feelsLikeText, HumidityText, precipitationText, unitsAssigner, visibilityText } from "./utils.js";

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

    Loader: document.getElementById("loader")
};
// Destructuring of objects
const { leftPanel, body, Loader } = DOM;

// ShowDropdown function to make dropdown visible
const showDropdown = () => {
    leftPanel.dropdown.classList.remove("hidden");
}

const showLoader = () => {
    Loader.classList.remove("opacity-0", "pointer-events-none");
};

const hideLoader = () => {
    Loader.classList.add("opacity-0", "pointer-events-none");
};
let lastCity = "";
let currentTemp = null;
// API Caller
const getWeather = async (city_name) => {

    if (!city_name) return;

    if (city_name === lastCity) {
        console.log("Already showing this city");
        return;
    }

    lastCity = city_name;
    showLoader();

    try {
        const baseURL = `${CONFIG.BASE_URL}${city_name}?unitGroup=metric&key=${CONFIG.API_KEY}&contentType=json`;

        const res = await fetch(baseURL);

        if (!res.ok) {
            if (res.status === 429) {
                console.log("API limit reached");
                return;
            }

            if (res.status === 404) {
                console.log("City not found");
                return;
            }

            throw new Error("Unknown error");
        }


        const RawData = await res.json();

        updateUI(RawData);

    } catch (error) {
        console.error("Unable to fetch weather data", error);
    }
    finally {
        setTimeout(() => {
            hideLoader();
        }, 500);
    }
}
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
        desc: description,
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
const updateUI = (data) => {
    // first we will clean the raw data and then we will send the cleaned data to other updating functions.

    const weather = formatWeatherData(data);

    currentTemp = weather.temp;
    updateLeftCard(weather);
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