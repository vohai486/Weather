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
    ulElement.appendChild(li)
  })

  document.body.addEventListener('click', (event) => {
    if (!event.target.matches(ulElement.className)) ulElement.classList.add('hide')
    if (event.target.matches('#inputSearch')) ulElement.classList.remove('hide')
    if (event.target.matches('.iconSearch')) searchInput.value = ''
    else {
      const url = new URL(window.location)
      let index = event.target.parentElement.dataset.index
      if (!list[index]) return
      url.searchParams.set('address', list[index].properties.formatted)
      url.searchParams.set('lat', list[index].properties.lat)
      url.searchParams.set('lon', list[index].properties.lon)
      history.pushState({}, '', url)
      ulElement.classList.toggle('hidden')

      const { formatted, lat, lon } = list[index].properties
      console.log(formatted, lat, lon)
      renderWeather(formatted, lat, lon)
    }
    // getForecast(formatted, lat, lon)
  })
}
const setTextContent = (selector, value) => {
  return (document.querySelector(selector).textContent = value)
}
const renderWeather = async (formatted, lat, lon) => {
  const responseWeather = await weatherApi.getWeather(lat, lon)
  const responseUVI = await weatherApi.getUVI(lat, lon)
  const foreCast = await weatherApi.getForecast(lat, lon)
  console.log(foreCast)
  console.log(responseWeather)
  const { temp, temp_max, temp_min, humidity, feels_like } = responseWeather.main
  setTextContent('.temperature span', `${parseInt(temp - 272.5)}`)
  setTextContent('.cityName', formatted)

  document.querySelector(
    '.img-weather img'
  ).src = `https://openweathermap.org/img/wn/${responseWeather.weather[0].icon}@2x.png`
  setTextContent('.humidity span', `${humidity} %`)
  setTextContent('.feels span', `${parseInt(temp - 272.5)}`)
  setTextContent('.uv span', responseUVI.value)
  setTextContent('.wind span', parseInt(responseWeather.wind.speed * 10))
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
  let list = ''
  const response = await locationApi.getAddress(value)
  list = response.features
  if (list) {
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
