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
  const ulElement = document.createElement('ul')
  document.querySelector('.content__left').appendChild(ulElement)
  ulElement.classList.add('listAddress')
  if (!Array.isArray(list)) return

  list.forEach((item, index) => {
    const li = createLiAddress(item, index)
    li.addEventListener('click', async (event) => {
      let index = event.target.parentElement.dataset.index
      if (!list[index]) return

      const { formatted, lat, lon } = list[index].properties
      renderWeather(formatted, lat, lon)
      ulElement.parentNode.removeChild(ulElement)
      document.getElementById('inputSearch').value = ''
    })
    ulElement.appendChild(li)
  })
}

const findForecast = (list) => {
  if (list.length === 0 || !Array.isArray(list)) return
  const newList = [...list].filter((item) => item.dt_txt.includes('00:00:00'))
  return newList
}
const createForecastItem = (timestamp, img, description, temp, humidity) => {
  const date = new Date(timestamp * 1000)
  const formatDate = date.toLocaleDateString('en', {
    year: 'numeric',
    month: '2-digit',
    day: 'numeric',
  })
  const node = `
  <div class="forecast">
        <span>${formatDate}</span>
        <span class='forecast-desc'>${description}</span>
        <div class="forecast-img">
          <img src="https://openweathermap.org/img/wn/${img}@2x.png" alt="" />
        </div>
        <span>Temp: ${Math.round(temp)} <sup>0</sup>C</span>
        <span>Humidity: ${humidity} %</span>
      </div>
  `
  return node
}
const renderForecast = (list) => {
  const listForecast = document.querySelector('.listForecast')
  if (listForecast) {
    listForecast.innerHTML = ''
  }
  list.forEach((item) => {
    const { dt, weather, main } = item
    const itemForecast = createForecastItem(
      dt,
      weather[0].icon,
      weather[0].description,
      main.temp,
      main.humidity
    )
    document.querySelector('.listForecast').insertAdjacentHTML('beforeend', itemForecast)
  })
}

const renderWeather = async (formatted, lat, lon) => {
  const addrestrender = document.querySelector('.content__left-add')
  if (addrestrender) {
    addrestrender.parentNode.removeChild(addrestrender)
  }
  document.querySelector('.loading').style.display = 'block'
  const responseWeather = await weatherApi.getWeather(lat, lon)
  const responseUVI = await weatherApi.getUVI(lat, lon)
  const foreCast = await weatherApi.getForecast(lat, lon)

  const { temp, humidity, feels_like } = responseWeather.main
  renderForecast(findForecast(foreCast.list))
  const node = `
  <div class="content__left-add">
  <h2 class="cityName">${formatted}</h2>
            <p class="description">${responseWeather.weather[0].description}</p>
            <div class="img-weather">
              <p class="temperature"><span>${Math.round(temp)}</span> <sup>0</sup>C</p>
              <img src="https://openweathermap.org/img/wn/${
                responseWeather.weather[0].icon
              }@2x.png" alt="" />
            </div>
            <p class="humidity">Humidity: <span>${humidity} %</span></p>
            <p class="feels">Feels like: <span>${Math.round(feels_like)}</span> <sup>0</sup>C</p>
            <p class="uv">UV Index: <span>${responseUVI.value}</span></p>
            <p class="wind">Wind Speed: <span>${parseFloat(
              responseWeather.wind.speed * 3.6
            ).toFixed(2)}</span> Km/h</p> 
            </div> `
  document.querySelector('.loading').style.display = 'none'
  document.querySelector('.counter').insertAdjacentHTML('afterend', node)
}
const getCounter = () => {
  const hours = document.querySelector('.hours')
  const minutes = document.querySelector('.minutes')
  const seconds = document.querySelector('.seconds')

  const timeNow = new Date()
  hours.textContent = `0${timeNow.getHours()}:`.slice(-3)
  minutes.textContent = `0${timeNow.getMinutes()}:`.slice(-3)
  seconds.textContent = `0${timeNow.getSeconds()}`.slice(-2)
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
  setInterval(getCounter, 800)
  innitSearch({
    elementID: 'inputSearch',
    onChange: (value) => handleFiterChange(value),
  })
})()
