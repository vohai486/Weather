// document.getElementById('inputSearch').addEventListener('click', () => {
//   document.querySelector('.content-input input').classList.toggle('is-show')

import debounce from 'lodash.debounce'
import locationApi from './api/locationApi'
document.getElementById('buttonSearch').addEventListener('click', () => {
  document.querySelector('.content-input input').classList.toggle('is-show')
})

function createLiAddress(item) {
  const addressTemplate = document.getElementById('addressSearch')
  const liElement = addressTemplate.content.firstElementChild.cloneNode(true)
  liElement.querySelector('.addressName').textContent = item.properties.address_line1
  liElement.querySelector('.cityName').textContent = item.properties.address_line2
  return liElement
}

const debounceSearch = debounce(
  async (event) => {
    try {
      const response = await locationApi.getAddress(event.target.value)
      console.log(response.features)
      response.features.forEach((item) => {
        const li = createLiAddress(item)
        document.getElementById('listAdd').appendChild(li)
      })
    } catch (error) {
      console.log(error)
    }
  },

  500
)
document.getElementById('inputSearch').addEventListener('input', debounceSearch)

//

//   console.log(event.target.value)

// ;(async () => {
//   try {
//     const response = await locationApi.getAddress('Hoài Ân')
//     console.log(response.features[0].properties.formatted)
//   } catch (error) {
//     console.log(error)
//   }
// })()
