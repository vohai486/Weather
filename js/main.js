import debounce from 'lodash.debounce'
import { locationApi } from './api/locationApi'
import { weatherApi } from './api/weatherApi'

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
    }
    // getForecast(formatted, lat, lon)
  })
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
  let list = ''
  const response = await locationApi.getAddress(value)
  list = response.features
  if (list) {
    renderListAddress(value, list)
  }
  return
}
;(async () => {
  setInterval(getCounter, 1000)
  innitSearch({
    elementID: 'inputSearch',
    onChange: (value) => handleFiterChange(value),
  })
})()
