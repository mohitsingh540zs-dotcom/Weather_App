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
// Standard Linear Interpolation Formula

const interpolate = (C, BLo, BHi, ILo, IHi) => {
    return Math.round(((IHi - ILo) / (BHi - BLo)) * (C - BLo) + ILo);
};
// Indian CPCB Calculation (Dynamic PM2.5 & PM10)
const calcIndia = (pm25, pm10) => {
    // PM2.5 Sub-index
    let s25 = 0;
    if (pm25 <= 30) s25 = interpolate(pm25, 0, 30, 0, 50);
    else if (pm25 <= 60) s25 = interpolate(pm25, 31, 60, 51, 100);
    else if (pm25 <= 90) s25 = interpolate(pm25, 61, 90, 101, 200);
    else if (pm25 <= 120) s25 = interpolate(pm25, 91, 120, 201, 300);
    else if (pm25 <= 250) s25 = interpolate(pm25, 121, 250, 301, 400);
    else s25 = interpolate(pm25, 251, 500, 401, 500);

    // PM10 Sub-index
    let s10 = 0;
    if (pm10 <= 50) s10 = interpolate(pm10, 0, 50, 0, 50);
    else if (pm10 <= 100) s10 = interpolate(pm10, 51, 100, 51, 100);
    else if (pm10 <= 250) s10 = interpolate(pm10, 101, 250, 101, 200);
    else if (pm10 <= 350) s10 = interpolate(pm10, 251, 350, 201, 300);
    else if (pm10 <= 430) s10 = interpolate(pm10, 351, 430, 301, 400);
    else s10 = interpolate(pm10, 431, 500, 401, 500);

    return Math.max(s25, s10);
};
// US EPA Calculation (Global Default)
const calcUS = (pm25, pm10) => {
    // US EPA focus primarily on PM2.5 for health
    let s25 = 0;
    if (pm25 <= 12.0) s25 = interpolate(pm25, 0, 12.0, 0, 50);
    else if (pm25 <= 35.4) s25 = interpolate(pm25, 12.1, 35.4, 51, 100);
    else if (pm25 <= 55.4) s25 = interpolate(pm25, 35.5, 55.4, 101, 150);
    else if (pm25 <= 150.4) s25 = interpolate(pm25, 55.5, 150.4, 151, 200);
    else if (pm25 <= 250.4) s25 = interpolate(pm25, 150.5, 250.4, 201, 300);
    else s25 = interpolate(pm25, 250.5, 500, 301, 500);

    return s25; // US EPA standard usually uses PM2.5 as the lead indicator
};
// Function to calculate the aqi with the help of calcin and calcUs
export function getRealAQI(components, countryCode) {
    const { pm2_5, pm10 } = components;

    if (countryCode === 'IN') {
        return calcIndia(pm2_5, pm10);
    } else {
        return calcUS(pm2_5, pm10);
    }
}
// Gives the % value for indicator movement
export function getVisualPercentage(aqi) {
    const segmentWidth = 100 / 6; // 16.66% per block

    if (aqi <= 50) {
        // part 1 (0-50)
        return (aqi / 50) * segmentWidth;
    } else if (aqi <= 100) {
        // part 2 (51-100)
        return segmentWidth + ((aqi - 50) / 50) * segmentWidth;
    } else if (aqi <= 200) {
        // part 3 (101-200)
        return (segmentWidth * 2) + ((aqi - 100) / 100) * segmentWidth;
    } else if (aqi <= 300) {
        // part 4 (201-300)
        return (segmentWidth * 3) + ((aqi - 200) / 100) * segmentWidth;
    } else if (aqi <= 400) {
        // part 5 (301-400)
        return (segmentWidth * 4) + ((aqi - 300) / 100) * segmentWidth;
    } else {
        // part 6 (401+)
        let p = (segmentWidth * 5) + ((aqi - 400) / 100) * segmentWidth;
        return Math.min(p, 100); // 100%
    }
}
// provides the aqi status
export function AqiStatus(aqi) {
    if (aqi <= 50) return "Good";
    else if (aqi <= 100) return "Moderate";
    else if (aqi <= 200) return "Unhealthy for Sensitive Groups";
    else if (aqi <= 300) return "Unhealthy";
    else if (aqi <= 400) return "Very Unhealthy";
    else return "Hazardous";
}

export function AqiSuggestion(status) {

    switch (status) {
        case "Good":
            return "Healthy air for outdoor activities ";
        case "Moderate":
            return "Air quality is acceptable ";
        case "Unhealthy for Sensitive Groups":
            return "Sensitive groups should consider limiting prolonged outdoor exertion ";
        case "Unhealthy":
            return "Everyone should limit prolonged outdoor exertion ";
        case "Very Unhealthy":
            return "Everyone should avoid all physical activity outdoors ";
        case "Hazardous":
            return "Health alert: everyone should avoid all physical activity outdoors ";
        default:
            return "Unknown air quality status ";
    }
}