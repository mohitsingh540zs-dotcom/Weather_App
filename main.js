// importing the Config object from config.js file

import { CONFIG } from "./config.js";

// Cacheing to reduce the expense of dom calls after load creates a object of these instances for better performance and maintainabilty.
const DOM = {
    body: document.body,

    leftPanel: {
        leftCard: document.getElementById("left-card"),
        searchForm: document.getElementById("search-form"),
        dropdown: document.getElementById("dropdown"),
        city_input: document.getElementById("city-name"),
        dropdownContent: document.getElementById("dropdown-content"),
        closeDropDownBtn: document.getElementById("close-dropdown")
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
                ShowToast("API limit reached", "error");
                return;
            }

            if (res.status === 404) {
                ShowToast("City not found", "error");
                return;
            }

            throw new Error("Unknown error");
        }

        const RawData = await res.json();

        console.log(RawData);

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