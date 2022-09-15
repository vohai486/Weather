import debounce from 'lodash.debounce'
import { locationApi } from './api/locationApi'

document.getElementById('buttonSearch').addEventListener('click', () => {
  document.querySelector('.content-input input').classList.toggle('is-show')
})

export const innitSearch = ({ elementID, onChange }) => {
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

const renderListAddress = (list) => {
  const ulElement = document.createElement('ul')
  document.querySelector('.content-search').appendChild(ulElement)
  ulElement.classList.add('listAdd')

  const ulEle = document.getElementsByClassName('listAdd')
  if (ulEle.length > 1) {
    ulEle[0].remove()
  }

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
    console.log(getLocation(list[index]))
  })
}

const getLocation = (address) => {
  if (!address) return
  const { formatted, lat, lon } = address.properties
  return {
    formatted,
    lat,
    lon,
  }
}

const handleFiterChange = async (value) => {
  let list = ''
  const response = await locationApi.getAddress(value)
  list = response.features

  if (list) {
    renderListAddress(list)
  }
}
;(async () => {
  innitSearch({
    elementID: 'inputSearch',
    onChange: (value) => handleFiterChange(value),
  })
})()
