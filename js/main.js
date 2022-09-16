import debounce from 'lodash.debounce'
import { locationApi } from './api/locationApi'

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

const renderListAddress = (value, list) => {
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
    searchInput.value = getLocation(list[index]).formatted
    console.log(getLocation(list[index]))
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
