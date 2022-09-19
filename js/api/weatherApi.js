import fetchRequest from './fetchApi'

const apiKey = '17983ea9a642af138408913232db50f0'

const forecast_Api = `https://api.openweathermap.org/data/2.5/forecast?appid=${apiKey}&units=metri&lang=vi&`
const weather_Api = `https://api.openweathermap.org/data/2.5/weather?appid=${apiKey}&units=metri&lang=vi&`

export const weatherApi = {
  getWeather: (lat, lon) => fetchRequest(weatherEndPoint.weather(lat, lon)),
  getForecast: (lat, lon) => fetchRequest(weatherEndPoint.forecast(lat, lon)),
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
}

const getApiPath = (urlApi, endPoints) => {
  return urlApi + endPoints
}
