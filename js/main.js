import debounce from 'lodash.debounce'
import { locationApi } from './api/locationApi'
import { weatherApi } from './api/weatherApi'

const innitSearch = ({ elementID, onChange }) => {
  const searchInput = document.getElementById(elementID)

  if (!searchInput) return

  const debounceSearch = debounce((event) => {
    if (event.target.value.length === 0) return
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
  const ulEle = document.querySelector('.listAddress')
  if (ulEle) ulEle.parentNode.removeChild(ulEle)

  const searchInput = document.querySelector('#inputSearch')
  const ulElement = document.createElement('ul')
  document.querySelector('.content__left').appendChild(ulElement)
  ulElement.classList.add('listAddress')
  if (!Array.isArray(list)) return

  list.forEach((item, index) => {
    const li = createLiAddress(item, index)
    li.addEventListener('click', async (event) => {
      const url = new URL(window.location)
      let index = event.target.parentElement.dataset.index
      if (!list[index]) return
      // url.searchParams.set('address', list[index].properties.formatted)
      // url.searchParams.set('lat', list[index].properties.lat)
      // url.searchParams.set('lon', list[index].properties.lon)
      // history.pushState({}, '', url)
      const { formatted, lat, lon } = list[index].properties
      renderWeather(formatted, lat, lon)
      ulElement.parentNode.removeChild(ulElement)
      document.getElementById('inputSearch').value = ''
    })
    ulElement.appendChild(li)
  })
}
const setTextContent = (selector, value) => {
  return (document.querySelector(selector).textContent = value)
}
const findForecast = (list) => {
  if (list.length === 0 || !Array.isArray(list)) return
  const newList = [...list].filter((item) => item.dt_txt.includes('00:00:00'))
  console.log(newList)
}
const renderWeather = async (formatted, lat, lon) => {
  console.log(formatted)
  const responseWeather = await weatherApi.getWeather(lat, lon)
  const responseUVI = await weatherApi.getUVI(lat, lon)
  const foreCast = await weatherApi.getForecast(lat, lon)
  console.log(findForecast(foreCast.list))

  console.log(foreCast)
  console.log(responseWeather)
  const { temp, temp_max, temp_min, humidity, feels_like } = responseWeather.main
  setTextContent('.temperature span', `${Math.round(temp)}`)
  setTextContent('.cityName', formatted)
  setTextContent('.description', responseWeather.weather[0].description)
  document.querySelector(
    '.img-weather img'
  ).src = `https://openweathermap.org/img/wn/${responseWeather.weather[0].icon}@2x.png`
  setTextContent('.humidity span', `${humidity} %`)
  setTextContent('.feels span', `${Math.round(feels_like)}`)
  setTextContent('.uv span', responseUVI.value)
  setTextContent('.wind span', parseFloat(responseWeather.wind.speed * 3.6).toFixed(2))
}
const getCounter = () => {
  const hours = document.querySelector('.hours')
  const minutes = document.querySelector('.minutes')
  const seconds = document.querySelector('.seconds')
  setInterval(() => {
    const timeNow = new Date()
    hours.textContent = `0${timeNow.getHours()}:`.slice(-3)
    minutes.textContent = `0${timeNow.getMinutes()}:`.slice(-3)
    seconds.textContent = `0${timeNow.getSeconds()}`.slice(-2)
  }, 800)
}

const handleFiterChange = async (value) => {
  if (value.trim().length === 0) return
  let list = ''
  document.querySelector('.content-loading').style.display = 'block'
  document.querySelector('.iconSearch').style.display = 'none'

  const response = await locationApi.getAddress(value)
  list = response.features
  document.querySelector('.content-loading').style.display = 'none'
  document.querySelector('.iconSearch').style.display = 'block'
  if (list.length > 0) {
    renderListAddress(value, list)
  }
  return
}
;(async () => {
  getCounter()
  innitSearch({
    elementID: 'inputSearch',
    onChange: (value) => handleFiterChange(value),
  })
})()
