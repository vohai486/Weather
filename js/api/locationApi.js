import fetchRequest from './fetchApi'

const apiKey = '38784a80952a47f3a36c1beccf741e22'
const location_api = `https://api.geoapify.com/v1/geocode/autocomplete?apiKey=${apiKey}&`

export const locationApi = {
  getAddress: (address) => {
    return fetchRequest(locationEndPoins.address(address))
  },
}

const locationEndPoins = {
  address: (address) => {
    const endPoins = `text=${encodeURIComponent(address)}`
    return getApiPath(endPoins)
  },
}

const getApiPath = (endPoints) => {
  return location_api + endPoints
}
