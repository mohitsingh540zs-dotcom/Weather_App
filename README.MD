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

## Left Card
Created main layout in grid format divided into 2 parts (left and right) right now left card created.
- Search bar.
- Weather card,
- Toggle button
- Weather card contains temp, condition and description.
- 4 condition card contains feelslike, humidity, visibility, precipitation.

## Right Card

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
