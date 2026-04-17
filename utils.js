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