require('dotenv').config({ path: '.env.local' })

async function testGeolocationAPI() {
  const apiKey = process.env.IP_GEOLOCATION_API_KEY

  console.log('Testing IP Geolocation API...')
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET')

  if (!apiKey) {
    console.error('ERROR: IP_GEOLOCATION_API_KEY is not set')
    return
  }

  // Test with a public IP (Google DNS)
  const testIP = '8.8.8.8'
  const apiUrl = `https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}&ip=${testIP}`

  console.log(`\nTesting with IP: ${testIP}`)
  console.log('API URL:', apiUrl.replace(apiKey, 'HIDDEN_KEY'))

  try {
    const response = await fetch(apiUrl)

    console.log('\nResponse Status:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error Response:', errorText)
      return
    }

    const data = await response.json()
    console.log('\nGeolocation Data:')
    console.log('- Country:', data.country_name)
    console.log('- State:', data.state_prov)
    console.log('- City:', data.city)
    console.log('- Zipcode:', data.zipcode)
    console.log('- Latitude:', data.latitude)
    console.log('- Longitude:', data.longitude)
    console.log('- Timezone:', data.time_zone?.name)
    console.log('\nFull Response:', JSON.stringify(data, null, 2))

    console.log('\n✅ API is working correctly!')
  } catch (error) {
    console.error('\n❌ Error fetching geolocation:', error.message)
    console.error('Full error:', error)
  }
}

testGeolocationAPI()
