# 🌦️ Weather Dashboard

A responsive weather web app built using HTML, Tailwind CSS, and JavaScript.

## Project Structure
- assets/
- src/ (tailwindcss)
- index.html
- main.js
- utils.js
- config.js
- .gitignore (to get rid of junk files)

## Tech Stack
- HTML
- Tailwind CSS
- JavaScript

## Features

**Left Card**
Created main layout in grid format divided into 2 parts (left and right) right now left card created.
- Search bar.
- Weather card,
- Toggle button
- Weather card contains temp, condition and description.
- 4 condition card contains feelslike, humidity, visibility, precipitation.

**Right Card**

Added the right-side container with key weather data components including:

- **Hourly Forecast** and **5-Day Forecast**
  - Includes skeleton loaders for loading states.
  - Uses `<template>` elements for dynamic card rendering via JavaScript.

- **Template Inner Content**
  - Hourly template card contains the time, temperature and weather status displayed by icon of next 24hrs.
  - Upcoming template card contains the date, temperature, weather icon, humidity, wind speed of next 5 days.

- **Air Quality Index (AQI)**
  - Displays air quality levels based on pollutant data.
  - Will be dynamically updated using API data.

- **Wind Card**
  - Shows wind speed and gust values.
  - Includes a visual compass for wind direction.

- **UV Index**
  - Displays UV intensity level.
  - Provides safety suggestions based on UV exposure.

## Modular style 
- Used config.js file which contains
  - API_KEY,
  - BASE_URL,
  - AQI_API_KEY,
  - AQI_BASE_URL
- Included format in config.example.js just insert your key's for usage.

## Cacheing 
A centralised DOM object is used to store all selectors.
- Reduces repeated calls of query/id selectors.
- For performance and maintainability.

## Functionalities
Functions created by javascript to make webpage interactive.

- **Search Bar**
  - Search bar for user's to type and check the weather of there desired city.
  - Contains input and button.

- **Dropdown History**
  - To save the user's searched city in there localStorage by saveHistory function.
  - Display the last searched cities in the form of display box.

- **HideDropdown**
  - To hide dropdown box by clicking on cross icon or in document other then search bar.

- **Custom Loader**
  - For making app alive and user's don't think that they are stucked.

- **GetWeather**
  - Async function to make call on api to get the response by the city as input.

- **FormatWeather**
  Instead of feeding full api response i cleaned the data to use for my own needs.
  - Destructuring the neccesary objects like currentConditions, days, description, etc..

- **UnitConverter**
  Created a function to convert celcius value to farenheit value.
  - Trigger on toggle.
  - Used the pure formula for calculation.

- **UpdateUi**
Created a Master function which takes the clean data and pass them to other particluar functions.
  - UpdateLeftCard: to update the left part of app.

**Auto Location**
A feature to detect the location of user's according to there browser with the help of built-in functions and latitide,longitude.
 - Provided fallback for those whose browser doesn't support this feature.

**Hourly Forecast**
This feature provides hourly data of next 24hours in 12hrs format with (Am:Pm).
  - Used fragment approach to reduce the hourly update to one update.
  - Created clone nodes in memory then inside the container.

**Dynamic Background Updater**
Updates Background according to the weather conditions.
  -Used ThemeMap to map the weather conditions data.
  -Function that takes the returned value and provide the path of png for required bg.

# Utils 
This javascript file contains the helper function which returns texts,units, or other neccessary data.
- Used to consist the cleaniness of code.
- Added new functions.
  -Background changer: provide background according to weather condition.
  -HoursFormater: format hours in 12hrs format.
  -IconMaper: Provide necessary icon acc to the weather.
  