// This script helps debug geolocation tracking issues
// Run this in production to check if the API key is set

console.log('=== Environment Check ===')
console.log('IP_GEOLOCATION_API_KEY:', process.env.IP_GEOLOCATION_API_KEY ? 'SET ✅' : 'NOT SET ❌')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET ✅' : 'NOT SET ❌')
console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL || 'NOT SET ❌')

if (!process.env.IP_GEOLOCATION_API_KEY) {
  console.log('\n❌ IP_GEOLOCATION_API_KEY is not set!')
  console.log('This is why location data is not being captured.')
  console.log('\nTo fix this:')
  console.log('1. Go to your Vercel project settings')
  console.log('2. Navigate to Environment Variables')
  console.log('3. Add: IP_GEOLOCATION_API_KEY = 1205b2d5d21f46998615ea2330c60713')
  console.log('4. Select all environments (Production, Preview, Development)')
  console.log('5. Redeploy your application')
}

// Test the geolocation API if key is set
if (process.env.IP_GEOLOCATION_API_KEY) {
  const testIP = '8.8.8.8'
  const apiUrl = `https://api.ipgeolocation.io/ipgeo?apiKey=${process.env.IP_GEOLOCATION_API_KEY}&ip=${testIP}`

  console.log('\n=== Testing Geolocation API ===')
  fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
      if (data.message) {
        console.log('❌ API Error:', data.message)
      } else {
        console.log('✅ API Working!')
        console.log('Test result for', testIP)
        console.log('- City:', data.city)
        console.log('- State:', data.state_prov)
        console.log('- Zipcode:', data.zipcode)
      }
    })
    .catch(err => {
      console.log('❌ API Request Failed:', err.message)
    })
}
