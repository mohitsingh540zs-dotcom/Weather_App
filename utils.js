// A exportable function for assigning the units behind the provided value and name.
export function unitsAssigner(value, name) {
    if (!value || !name) return;

    const units = {
        temp: "°C",
        feelsLike: "°C",
        humidity: "%",
        windspeed: " Km/h",
        visibility: " Km",
        precip: "mm"
    }

    return `${value}${units[name]}`;
}
// Left Panel's helper functions to provide the textual information of the data along with it's values.
// This function takes humidity value and acc to that returns advice in textual format. 
export function HumidityText(humidity) {
    if (humidity <= 30) return "Low Humidity, keep hydrated!";
    else if (humidity <= 50) return "Perfect Humidity, enjoy your day!";
    else if (humidity <= 70) return "High Humidity, stay cool!";
    else return "High moisture in the air, stay indoors";
}
// This function takes visibility value and acc to that returns advice in textual format. 
export function visibilityText(visibility) {
    if (visibility >= 10) return "Excellent visibilty, enjoy your view!";
    else if (visibility >= 5) return "Good visibility, but be careful while driving!";
    else if (visibility >= 1.6) return "Moderate visibility, use headlights while driving!";
    else return "Dangerously low visibility, avoid unnecessary travel!";
}
// This function takes precip value and acc to that returns advice in textual format. 
export function precipitationText(precip) {
    if (precip === null || precip === 0) return "No precipitation, enjoy your day!";
    else if (precip <= 2) return "Light drizzle, carry an umbrella just in case!";
    else if (precip <= 10) return "Moderate rain, carry an umbrella!";
    else if (precip <= 50) return "Heavy rainfall expected, wear waterproof clothing!"
    else return "Extreme reainfall! Please stay indoors";
}
// This function takes temp and feelsLike value and acc to that returns advice in textual format. 
export function feelsLikeText(temp, feelsLike) {
    const diff = feelsLike - temp;

    let advice = "";
    // base recommendation on feels like
    if (feelsLike > 35) advice = "Extremely hot! Stay hydrated";
    else if (feelsLike > 25) advice = "It's a warm day, dress lightly";
    else if (feelsLike > 15) advice = "Mild weather, enjoy your day!";
    else advice = "It's chilly, grab warm clothes!";

    // add advice based on difference
    if (diff >= 3) {
        return `${advice} (feels hotter due to high humidity)`;
    } else if (diff <= -3) {
        return `${advice} ( The wind makes it feel colder than it is.)`;
    }

    return advice;
}
// Bg logic
// Normalise the long string into small string
export const normalizeCondition = (condition) => {
    const c = condition.toLowerCase();

    if (c.includes("thunder")) return "storm";
    if (c.includes("rain")) return "rain";
    if (c.includes("snow")) return "snow";
    if (c.includes("cloud") || c.includes("overcast")) return "cloudy";
    if (c.includes("clear")) return "clear";
    if (c.includes("fog") || c.includes("mist") || c.includes("haze")) return "mist";
    if (c.includes("wind") || c.includes("dust")) return "windy";

    return "default";
};
//Weather Theme helper funciton
export const WEATHER_THEME = {
    clear: {
        bg: "clear.webp",
        overlay: "rgba(255, 200, 0, 0.2)"
    },
    cloudy: {
        bg: "cloudy.webp",
        overlay: "rgba(100, 100, 100, 0.3)"
    },
    rain: {
        bg: "rain.webp",
        overlay: "rgba(0, 0, 50, 0.4)"
    },
    storm: {
        bg: "storm.webp",
        overlay: "rgba(0, 0, 0, 0.6)"
    },
    snow: {
        bg: "snow.webp",
        overlay: "rgba(255, 255, 255, 0.3)"
    },
    mist: {
        bg: "mist.webp",
        overlay: "rgba(200, 200, 200, 0.3)"
    },
    windy: {
        bg: "windy.webp",
        overlay: "rgba(150, 150, 150, 0.3)"
    },
    default: {
        bg: "default.webp",
        overlay: "rgba(0,0,0,0.3)"
    }
};
// Format the hours array into 12 hrs format
export function formatTo12hr(timeString) {

    const hour = parseInt(timeString.split(':')[0]);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour} ${ampm}`;
}
// weather icon map
const ICON_MAP = {
    "clear-day": "sun.png",
    "cloudy": "cloudy.png",
    "partly-cloudy-day": "cloudy.png",
    "rain": "rainy.png",
    "snow": "snow.png",
    "thunderstorm": "thunderstorm.png",
    "partly-cloudy-night": "partly-cloudy-night.png",
    "clear-night": "night-moon.png",
    "fog": "fog.png"

};
// returns map acc to conditions of icon from the icon map
export function iconSeter(icon) {
    return `assets/weather_icons/${ICON_MAP[icon]}`;
}
// takes date string and return the short date 
export function dateFormater(dateString) {
    if (!dateString) return

    const date = new Date(dateString);

    const options = {
        month: "short",
        day: "numeric",
        year: "2-digit"
    }

    return new Intl.DateTimeFormat('en-US', options).format(date)
}
// Provides status of harmfull UV rays 
export function uvStatus(uv) {
    if (uv <= 2) return "Low";
    else if (uv <= 5) return "Moderate";
    else if (uv <= 7) return "High";
    else if (uv <= 10) return "Very High";
    else return "Extreme";
}
// Provides Suggestion according to UVindex value, precautions and all
export function uvSuggestion(status) {
    switch (status) {
        case "Low":
            return "Minimal risk of harm";
        case "Moderate":
            return "Apply sunscreen";
        case "High":
            return "Apply sunscreen and wear protective clothing";
        case "Very High":
            return "Extra precautions needed."
        case "Extreme":
            return "Take all precautions. Avoid sun exposure.";

        default:
            return "Unknown UV index status";
    }
}