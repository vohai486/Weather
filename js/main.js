import debounce from 'lodash.debounce'
import { locationApi } from './api/locationApi'
import { weatherApi } from './api/weatherApi'

document.getElementById('buttonSearch').addEventListener('click', () => {
  document.querySelector('.content-input input').classList.toggle('is-show')
})

const innitSearch = ({ elementID, onChange }) => {
  const searchInput = document.getElementById(elementID)

  if (!searchInput) return

  const debounceSearch = debounce((event) => {
    onChange?.(event.target.value)
  }, 700)
  searchInput.addEventListener('input', debounceSearch)
}

const createLiAddress = (item, index) => {
  const addressTemplate = document.getElementById('addressSearch')
  if (!addressTemplate) return
  const liElement = addressTemplate.content.firstElementChild.cloneNode(true)
  if (!liElement) return
  liElement.dataset.index = index
  liElement.querySelector('.addressName').textContent = item.properties.address_line1
  liElement.querySelector('.cityName').textContent = item.properties.address_line2
  return liElement
}

const renderListAddress = async (value, list) => {
  const ulEle = document.querySelector('.listAdd')
  if (ulEle) ulEle.parentNode.removeChild(ulEle)
  const searchInput = document.querySelector('#inputSearch')
  const ulElement = document.createElement('ul')
  document.querySelector('.content-search').appendChild(ulElement)
  ulElement.classList.add('listAdd')
  if (!Array.isArray(list)) return

  list.forEach((item, index) => {
    const li = createLiAddress(item, index)
    ulElement.appendChild(li)
  })

  ulElement.addEventListener('click', (event) => {
    const url = new URL(window.location)
    let index = event.target.parentElement.dataset.index
    if (!list[index]) return
    url.searchParams.set('address', list[index].properties.formatted)
    url.searchParams.set('lat', list[index].properties.lat)
    url.searchParams.set('lon', list[index].properties.lon)
    history.pushState({}, '', url)
    ulElement.classList.toggle('hidden')
    const { formatted, lat, lon } = list[index].properties
    getForecast(formatted, lat, lon)
  })
  document.body.addEventListener('click', (e) => {
    if (e.target.parentElement.matches('.content-input') || e.target.matches('.content-input')) {
      ulElement.classList.toggle('hidden')
      searchInput.value = value
    } else {
      ulElement.classList.add('hidden')
    }
  })
}
const getForecast = async (formatted, lat, lon) => {
  await weatherApi
    .getWeather(lat, lon)
    .then((res) => renderWeather(formatted, res))
    .catch((err) => console.log(err))
  await weatherApi
    .getForecast(lat, lon)
    .then((res) => renderForecast(formatted, res))
    .catch((err) => console.log(err))
}

const renderWeather = (formatted, res) => {
  console.log(res)
  document.querySelector('.weather__title-heading').firstElementChild.textContent = formatted
  setInnerHTML(
    '.weather__temperature-max',
    `${Math.floor(res.main.temp_max - 273.15)}<sup>o</sup>C`
  )
  setInnerHTML(
    '.weather__temperature-min',
    `${Math.floor(res.main.temp_min - 273.15)}<sup>o</sup>C`
  )
  setInnerHTML('.weather__speed', `${Math.floor(res.main.temp_max - 273.15)}<sup>o</sup>C`)
  setContent('.weather__temperature-des', res.weather[0].description)
  setContent('.status-Pressure', `${res.main.pressure} hPa`)
  setContent('.status-Visibility', `${Math.round(res.visibility / 1000)} km`)
  setContent('.status-Humadidy', `${res.main.humidity} %`)
  setContent('.city-status', `${res.weather[0].main}`)
  setContent('.weather__speed', `${Math.round(res.wind.speed * 3.6)} km/h`)
  setContent('.weather__temperature-des-more', `${res.weather[0].description}`)
  // if(res.weather)
  setContent('.weather-display span', `${res.clouds.all}%`)
  document.querySelector('.weather__process span').style.left = `${res.clouds.all - 6}%`
  document.querySelector('.process-range').style.width = `${res.clouds.all - 2}%`
  setContent('.forecast__header-city span:first-child', `${res.weather[0].main}`)
  setContent('.forecast__header-city span:last-child', formatted)
  setInnerHTML('.forecast__header-temp span', `${Math.floor(res.main.temp - 273.15)}<sup>o</sup>C`)
  setContent('.sunrise', timeFormat(res.sys.sunrise))
  setContent('.sunset', timeFormat(res.sys.sunset))
  document.querySelector('.forecast__time-display').style.width = `${findTimeRange(
    res.sys.sunrise * 1000,
    res.sys.sunset * 1000
  )}%`
}

const findTimeRange = (sunrise, sunset) => {
  const timestamp = new Date().getTime()
  const sunrisestamp = new Date(sunrise).getTime()
  const sunsetstamp = new Date(sunset).getTime()
  if (timestamp > sunsetstamp) {
    return 100
  }
  if (timestamp < sunrisestamp) {
    return 0
  }
  return ((timestamp - sunrisestamp) / (sunsetstamp - sunrise)) * 100
}
const timeFormat = (value) => {
  const timestamp = new Date(value * 1000)
  const hour = timestamp.getHours()
  const minutes = timestamp.getMinutes()
  return `${hour}:${minutes}`
}

const renderForecast = (formatted, res) => {
  // console.log(res)
  // setContent('weather__temperature-max',res.)
}
const setInnerHTML = (selector, value) => {
  const ele = document.querySelector(selector)
  if (ele) ele.innerHTML = value
}
const setContent = (selector, value) => {
  const ele = document.querySelector(selector)
  if (ele) ele.textContent = value
}
const handleFiterChange = async (value) => {
  let list = ''
  const response = await locationApi.getAddress(value)
  list = response.features
  if (list) {
    renderListAddress(value, list)
  }
  return
}
;(async () => {
  innitSearch({
    elementID: 'inputSearch',
    onChange: (value) => handleFiterChange(value),
  })
})()
