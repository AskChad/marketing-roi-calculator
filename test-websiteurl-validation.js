const { z } = require('zod')

// Test the exact schema from the API
const leadCaptureSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  companyName: z.string().min(1).max(255),
  websiteUrl: z.string().url().optional().or(z.literal('')),
})

// Test cases that might come from react-hook-form
const testCases = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '',  // Empty phone
    companyName: 'Acme Inc',
    websiteUrl: '',  // Empty website
  },
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    companyName: 'Acme Inc',
    websiteUrl: '',  // No phone field at all
  },
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    companyName: 'Acme Inc',
    websiteUrl: 'https://example.com',
  },
]

console.log('Testing Lead Capture Schema:\n')
testCases.forEach((test, i) => {
  try {
    const result = leadCaptureSchema.parse(test)
    console.log(`✅ Test ${i+1} PASS:`, JSON.stringify(test, null, 2))
  } catch (e) {
    console.log(`❌ Test ${i+1} FAIL:`)
    console.log('   Input:', JSON.stringify(test, null, 2))
    if (e.errors && e.errors[0]) {
      console.log('   Error:', e.errors[0].message, 'at path:', e.errors[0].path.join('.'))
    } else {
      console.log('   Error:', e.message)
    }
  }
  console.log()
})
