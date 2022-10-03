import fetchRequest from './fetchApi'

const apiKey = '5349c0aa794b0ac2c41a1fb46fb40502'

const forecast_Api = `https://api.openweathermap.org/data/2.5/forecast?appid=${apiKey}&`
const weather_Api = `https://api.openweathermap.org/data/2.5/weather?appid=${apiKey}&`
const uvi_Api = `https://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&`
export const weatherApi = {
  getWeather: (lat, lon) => fetchRequest(weatherEndPoint.weather(lat, lon)),
  getForecast: (lat, lon) => fetchRequest(weatherEndPoint.forecast(lat, lon)),
  getUVI: (lat, lon) => fetchRequest(weatherEndPoint.uvi(lat, lon)),
}

const weatherEndPoint = {
  weather: (lat, lon) => {
    const endPoints = `lat=${lat}&lon=${lon}`
    return getApiPath(weather_Api, endPoints)
  },
  forecast: (lat, lon) => {
    const endPoints = `lat=${lat}&lon=${lon}`
    return getApiPath(forecast_Api, endPoints)
  },
  uvi: (lat, lon) => {
    const endPoints = `lat=${lat}&lon=${lon}`
    return getApiPath(uvi_Api, endPoints)
  },
}

const getApiPath = (urlApi, endPoints) => {
  return urlApi + endPoints
}
