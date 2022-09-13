import fetchRequest from './fetchApi'

const apiKey = '38784a80952a47f3a36c1beccf741e22'
const location_api_key = `https://api.geoapify.com/v1/geocode/autocomplete?apiKey=${apiKey}&`

const locationApi = {
  getAddress: async (address) => {
    return await fetchRequest(locationEndPoins.address(address))
  },
}

const locationEndPoins = {
  address: (address) => {
    const endPoins = `text=${encodeURIComponent(address)}`
    return getApiPath(endPoins)
  },
}

const getApiPath = (endPoints) => {
  return location_api_key + endPoints
}

export default locationApi
