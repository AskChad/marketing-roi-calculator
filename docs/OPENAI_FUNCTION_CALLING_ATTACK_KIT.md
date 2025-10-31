# OpenAI Function Calling Attack Kit

**Project-Agnostic Guide for Building AI Chat with Database & External Data Integration**

This guide will help you implement OpenAI's function calling (Tools API) in any project to enable AI chat with intelligent database queries, web scraping, and document access.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Pattern](#architecture-pattern)
3. [Step-by-Step Implementation](#step-by-step-implementation)
4. [Function Examples](#function-examples)
5. [Web Scraping Functions](#web-scraping-functions)
6. [Google Docs Integration](#google-docs-integration)
7. [Security Best Practices](#security-best-practices)
8. [Testing & Debugging](#testing--debugging)

---

## Overview

### What is Function Calling?

OpenAI's function calling allows GPT models to intelligently call predefined functions to retrieve data, perform actions, or interact with external systems. The AI decides **when** and **which** functions to call based on user queries.

### When to Use This Pattern

- ✅ AI needs to query your database
- ✅ AI needs to fetch external data (APIs, websites, documents)
- ✅ You want role-based data access (user vs admin)
- ✅ You need multi-step reasoning with live data
- ✅ You want to avoid hallucinations by grounding AI in real data

### Key Benefits

- **No Assistants API needed** - Uses standard chat completions endpoint
- **Stateless** - No thread management required
- **Flexible** - Easy to add/remove functions
- **Secure** - Full control over permissions and data access
- **Cost-effective** - Only pay for tokens used

---

## Architecture Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│  PROJECT STRUCTURE                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  lib/ai/                                                         │
│  ├── function-definitions.ts   ← Define function schemas        │
│  ├── function-handlers.ts      ← Implement function logic       │
│  └── scraper-functions.ts      ← Web scraping functions         │
│                                                                  │
│  app/api/                                                        │
│  └── ai/chat/route.ts          ← Main chat endpoint             │
│                                                                  │
│  (Optional) Database tables for configuration:                  │
│  ├── admin_settings             ← Platform API key & settings   │
│  └── user_openai_settings       ← User personal API keys        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Query
    ↓
API Route (/api/ai/chat)
    ↓
Authenticate & Check Permissions
    ↓
Select Available Functions (based on role)
    ↓
Call OpenAI with Functions
    ↓
GPT Decides to Call Function(s)
    ↓
Execute Function Handlers
    ↓
Return Results to GPT
    ↓
GPT Formulates Natural Language Response
    ↓
Stream Response to User
```

---

## Step-by-Step Implementation

### Step 1: Define Function Schemas

Create `lib/ai/function-definitions.ts`:

```typescript
// Example: Database query functions
export const databaseFunctions = [
  {
    name: 'getUserData',
    description: 'Get user data by user ID. Only returns data for the authenticated user.',
    parameters: {
      type: 'object',
      properties: {
        fields: {
          type: 'array',
          items: { type: 'string' },
          description: 'Fields to retrieve (e.g., ["email", "name", "company"])'
        }
      },
      required: ['fields']
    }
  },
  {
    name: 'searchRecords',
    description: 'Search records in the database. Users can only search their own records.',
    parameters: {
      type: 'object',
      properties: {
        table: {
          type: 'string',
          enum: ['orders', 'products', 'customers'],
          description: 'Which table to search'
        },
        query: {
          type: 'string',
          description: 'Search query string'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results',
          default: 10
        }
      },
      required: ['table', 'query']
    }
  }
]

// Example: Admin-only functions
export const adminFunctions = [
  ...databaseFunctions,
  {
    name: 'getAllUsers',
    description: 'Get all users in the system (admin only)',
    parameters: {
      type: 'object',
      properties: {
        limit: { type: 'number', default: 50 },
        sortBy: {
          type: 'string',
          enum: ['created_at', 'email', 'last_login'],
          default: 'created_at'
        }
      }
    }
  },
  {
    name: 'searchUsersByCompany',
    description: 'Find users by company name (admin only)',
    parameters: {
      type: 'object',
      properties: {
        companyName: {
          type: 'string',
          description: 'Company name to search for (partial match)'
        }
      },
      required: ['companyName']
    }
  }
]

// Export the right functions based on role
export function getFunctionsForRole(isAdmin: boolean) {
  return isAdmin ? adminFunctions : databaseFunctions
}
```

### Step 2: Implement Function Handlers

Create `lib/ai/function-handlers.ts`:

```typescript
import { SupabaseClient } from '@supabase/supabase-js'

// Type for function handler
type FunctionHandler = (
  supabase: SupabaseClient,
  userId: string,
  args: any
) => Promise<any>

// Implement each function
export async function getUserData(
  supabase: SupabaseClient,
  userId: string,
  args: { fields: string[] }
) {
  const { data, error } = await supabase
    .from('users')
    .select(args.fields.join(', '))
    .eq('id', userId)
    .single()

  if (error) throw new Error(`Failed to fetch user data: ${error.message}`)

  return { user: data }
}

export async function searchRecords(
  supabase: SupabaseClient,
  userId: string,
  args: { table: string; query: string; limit?: number }
) {
  const { data, error } = await supabase
    .from(args.table)
    .select('*')
    .eq('user_id', userId) // Enforce user can only see their data
    .ilike('name', `%${args.query}%`)
    .limit(args.limit || 10)

  if (error) throw new Error(`Search failed: ${error.message}`)

  return { results: data, count: data.length }
}

export async function getAllUsers(
  supabase: SupabaseClient,
  userId: string,
  args: { limit?: number; sortBy?: string }
) {
  // This function should only be called for admins
  // The main executor will verify admin status

  const { data, error } = await supabase
    .from('users')
    .select('id, email, company_name, created_at, last_login')
    .order(args.sortBy || 'created_at', { ascending: false })
    .limit(args.limit || 50)

  if (error) throw new Error(`Failed to fetch users: ${error.message}`)

  return { users: data, count: data.length }
}

export async function searchUsersByCompany(
  supabase: SupabaseClient,
  userId: string,
  args: { companyName: string }
) {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, company_name')
    .ilike('company_name', `%${args.companyName}%`)

  if (error) throw new Error(`Search failed: ${error.message}`)

  return { users: data, count: data.length }
}

// Map function names to handlers
const functionHandlers: Record<string, FunctionHandler> = {
  getUserData,
  searchRecords,
  getAllUsers,
  searchUsersByCompany,
}

// Define which functions require admin access
const adminOnlyFunctions = [
  'getAllUsers',
  'searchUsersByCompany',
]

// Main executor function
export async function executeFunctionCall(
  functionName: string,
  args: any,
  supabase: SupabaseClient,
  userId: string,
  isAdmin: boolean
): Promise<any> {
  // Check if function requires admin access
  if (adminOnlyFunctions.includes(functionName) && !isAdmin) {
    throw new Error(`Admin access required to call function: ${functionName}`)
  }

  // Get the handler
  const handler = functionHandlers[functionName]
  if (!handler) {
    throw new Error(`Function not found: ${functionName}`)
  }

  // Execute the function
  try {
    const result = await handler(supabase, userId, args)
    return result
  } catch (error: any) {
    console.error(`Error executing ${functionName}:`, error)
    throw new Error(`Function execution failed: ${error.message}`)
  }
}
```

### Step 3: Create Chat API Endpoint

Create `app/api/ai/chat/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getFunctionsForRole } from '@/lib/ai/function-definitions'
import { executeFunctionCall } from '@/lib/ai/function-handlers'
import { z } from 'zod'

const chatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string()
  })),
  userId: z.string().uuid(),
  isAdmin: z.boolean().optional().default(false)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = chatSchema.parse(body)

    // Authenticate user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the userId matches authenticated user
    if (user.id !== validatedData.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if user is actually admin (don't trust client)
    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    const isAdmin = !!(userData as any)?.is_admin

    // Get API key (from env, database, or user settings)
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    // Select functions based on role
    const availableFunctions = getFunctionsForRole(isAdmin)

    // Prepare messages for OpenAI
    let messages = validatedData.messages

    // Iterative function calling (max 5 rounds)
    const maxIterations = 5
    let iterations = 0

    while (iterations < maxIterations) {
      iterations++

      // Call OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: messages,
          tools: availableFunctions.map(fn => ({
            type: 'function',
            function: fn
          })),
          tool_choice: 'auto',
          temperature: 0.7,
          max_tokens: 2000
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`)
      }

      const data = await response.json()
      const aiMessage = data.choices[0].message

      // If no function calls, we're done
      if (!aiMessage.tool_calls || aiMessage.tool_calls.length === 0) {
        return NextResponse.json({
          success: true,
          message: aiMessage.content,
          iterations
        })
      }

      // Execute all function calls
      const functionResults = await Promise.all(
        aiMessage.tool_calls.map(async (toolCall: any) => {
          try {
            const result = await executeFunctionCall(
              toolCall.function.name,
              JSON.parse(toolCall.function.arguments),
              supabase,
              user.id,
              isAdmin
            )

            return {
              tool_call_id: toolCall.id,
              role: 'tool',
              name: toolCall.function.name,
              content: JSON.stringify(result)
            }
          } catch (error: any) {
            return {
              tool_call_id: toolCall.id,
              role: 'tool',
              name: toolCall.function.name,
              content: JSON.stringify({ error: error.message })
            }
          }
        })
      )

      // Add AI message and function results to conversation
      messages.push(aiMessage, ...functionResults)
    }

    // If we hit max iterations
    return NextResponse.json({
      success: true,
      message: 'I apologize, but I need to process your request in steps. Could you please rephrase your question?',
      iterations
    })

  } catch (error: any) {
    console.error('Chat API error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
```

---

## Function Examples

### Example 1: Simple Data Retrieval

```typescript
// Function Definition
{
  name: 'getMyScenarios',
  description: 'Get all ROI scenarios for the current user',
  parameters: {
    type: 'object',
    properties: {
      limit: {
        type: 'number',
        description: 'Maximum number of scenarios to return',
        default: 50
      },
      sortBy: {
        type: 'string',
        enum: ['created_at', 'sales_increase', 'revenue_increase'],
        description: 'Field to sort by'
      },
      sortOrder: {
        type: 'string',
        enum: ['asc', 'desc'],
        default: 'desc'
      }
    }
  }
}

// Function Handler
export async function getMyScenarios(
  supabase: SupabaseClient,
  userId: string,
  args: { limit?: number; sortBy?: string; sortOrder?: string }
) {
  const { data, error } = await supabase
    .from('roi_scenarios')
    .select(`
      *,
      calculator_sessions(
        session_token,
        created_at
      )
    `)
    .eq('user_id', userId)
    .order(args.sortBy || 'created_at', {
      ascending: args.sortOrder === 'asc'
    })
    .limit(args.limit || 50)

  if (error) throw new Error(error.message)

  return { scenarios: data, count: data.length }
}
```

### Example 2: Search with Filters

```typescript
// Function Definition
{
  name: 'searchMyScenarios',
  description: 'Search through user\'s ROI scenarios by name or description',
  parameters: {
    type: 'object',
    properties: {
      searchTerm: {
        type: 'string',
        description: 'Term to search for in scenario names'
      },
      minRevenue: {
        type: 'number',
        description: 'Minimum revenue increase to filter by'
      },
      dateFrom: {
        type: 'string',
        description: 'Start date for filtering (ISO format)'
      }
    },
    required: ['searchTerm']
  }
}

// Function Handler
export async function searchMyScenarios(
  supabase: SupabaseClient,
  userId: string,
  args: { searchTerm: string; minRevenue?: number; dateFrom?: string }
) {
  let query = supabase
    .from('roi_scenarios')
    .select('*')
    .eq('user_id', userId)
    .ilike('scenario_name', `%${args.searchTerm}%`)

  if (args.minRevenue) {
    query = query.gte('revenue_increase', args.minRevenue)
  }

  if (args.dateFrom) {
    query = query.gte('created_at', args.dateFrom)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)

  return { scenarios: data, count: data.length }
}
```

### Example 3: Admin Analytics

```typescript
// Function Definition
{
  name: 'getPlatformAnalytics',
  description: 'Get platform-wide analytics (admin only)',
  parameters: {
    type: 'object',
    properties: {
      dateRange: {
        type: 'string',
        enum: ['7d', '30d', '90d', 'all'],
        description: 'Time range for analytics'
      }
    }
  }
}

// Function Handler
export async function getPlatformAnalytics(
  supabase: SupabaseClient,
  userId: string,
  args: { dateRange?: string }
) {
  // Calculate date threshold
  const dateMap = { '7d': 7, '30d': 30, '90d': 90 }
  const daysAgo = dateMap[args.dateRange as keyof typeof dateMap] || null

  let dateThreshold = null
  if (daysAgo) {
    dateThreshold = new Date()
    dateThreshold.setDate(dateThreshold.getDate() - daysAgo)
  }

  // Get user count
  let userQuery = supabase.from('users').select('id', { count: 'exact', head: true })
  if (dateThreshold) {
    userQuery = userQuery.gte('created_at', dateThreshold.toISOString())
  }
  const { count: userCount } = await userQuery

  // Get scenario count
  let scenarioQuery = supabase.from('roi_scenarios').select('id', { count: 'exact', head: true })
  if (dateThreshold) {
    scenarioQuery = scenarioQuery.gte('created_at', dateThreshold.toISOString())
  }
  const { count: scenarioCount } = await scenarioQuery

  // Get average ROI
  const { data: avgData } = await supabase
    .from('roi_scenarios')
    .select('revenue_increase, marketing_spend')

  const totalROI = avgData?.reduce((sum, s) => {
    const roi = ((s.revenue_increase - s.marketing_spend) / s.marketing_spend) * 100
    return sum + roi
  }, 0) || 0

  const avgROI = avgData?.length ? totalROI / avgData.length : 0

  return {
    period: args.dateRange || 'all',
    userCount,
    scenarioCount,
    avgROI: Math.round(avgROI * 100) / 100
  }
}
```

---

## Web Scraping Functions

Create `lib/ai/scraper-functions.ts`:

```typescript
import * as cheerio from 'cheerio'
import TurndownService from 'turndown'

// Function Definitions
export const scraperFunctions = [
  {
    name: 'scrapeWebpage',
    description: 'Scrape and extract content from a public webpage URL',
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'Full URL of the webpage to scrape'
        },
        selector: {
          type: 'string',
          description: 'CSS selector to extract specific content (optional)'
        },
        format: {
          type: 'string',
          enum: ['text', 'markdown', 'html'],
          default: 'markdown',
          description: 'Output format for the content'
        }
      },
      required: ['url']
    }
  },
  {
    name: 'extractTableFromWebpage',
    description: 'Extract table data from a webpage',
    parameters: {
      type: 'object',
      properties: {
        url: { type: 'string' },
        tableIndex: {
          type: 'number',
          default: 0,
          description: 'Which table to extract (0 = first table)'
        }
      },
      required: ['url']
    }
  }
]

// Function Handlers

export async function scrapeWebpage(
  supabase: any,
  userId: string,
  args: { url: string; selector?: string; format?: string }
) {
  try {
    // Validate URL
    const urlObj = new URL(args.url)
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Only HTTP/HTTPS URLs are allowed')
    }

    // Fetch the webpage
    const response = await fetch(args.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AIBot/1.0)'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Extract content
    let content = ''
    if (args.selector) {
      content = $(args.selector).html() || ''
    } else {
      // Remove script and style tags
      $('script, style, nav, footer, header').remove()
      content = $('body').html() || ''
    }

    // Format output
    if (args.format === 'markdown') {
      const turndownService = new TurndownService()
      content = turndownService.turndown(content)
    } else if (args.format === 'text') {
      content = $(content).text().trim()
    }

    return {
      url: args.url,
      content: content.substring(0, 10000), // Limit content size
      contentLength: content.length,
      format: args.format || 'markdown'
    }
  } catch (error: any) {
    throw new Error(`Failed to scrape webpage: ${error.message}`)
  }
}

export async function extractTableFromWebpage(
  supabase: any,
  userId: string,
  args: { url: string; tableIndex?: number }
) {
  try {
    const response = await fetch(args.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AIBot/1.0)'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    const tables = $('table')
    const tableIndex = args.tableIndex || 0

    if (tableIndex >= tables.length) {
      throw new Error(`Table index ${tableIndex} not found. Page has ${tables.length} tables.`)
    }

    const table = tables.eq(tableIndex)
    const headers: string[] = []
    const rows: any[] = []

    // Extract headers
    table.find('thead tr th, thead tr td').each((i, el) => {
      headers.push($(el).text().trim())
    })

    // If no thead, use first row
    if (headers.length === 0) {
      table.find('tr').first().find('th, td').each((i, el) => {
        headers.push($(el).text().trim())
      })
    }

    // Extract rows
    table.find('tbody tr, tr').slice(headers.length > 0 ? 0 : 1).each((i, row) => {
      const rowData: any = {}
      $(row).find('td').each((j, cell) => {
        const header = headers[j] || `column_${j}`
        rowData[header] = $(cell).text().trim()
      })
      if (Object.keys(rowData).length > 0) {
        rows.push(rowData)
      }
    })

    return {
      url: args.url,
      tableIndex,
      headers,
      rows,
      rowCount: rows.length
    }
  } catch (error: any) {
    throw new Error(`Failed to extract table: ${error.message}`)
  }
}
```

### Install Required Packages

```bash
npm install cheerio turndown
npm install -D @types/turndown
```

---

## Google Docs Integration

Create `lib/ai/google-docs-functions.ts`:

```typescript
import { google } from 'googleapis'

// Function Definitions
export const googleDocsFunctions = [
  {
    name: 'readGoogleDoc',
    description: 'Read and extract content from a Google Doc (requires sharing link)',
    parameters: {
      type: 'object',
      properties: {
        documentId: {
          type: 'string',
          description: 'Google Doc ID from the URL (e.g., in docs.google.com/document/d/DOCUMENT_ID/edit)'
        }
      },
      required: ['documentId']
    }
  },
  {
    name: 'searchGoogleDocs',
    description: 'Search for text within a Google Doc',
    parameters: {
      type: 'object',
      properties: {
        documentId: { type: 'string' },
        searchTerm: {
          type: 'string',
          description: 'Text to search for in the document'
        }
      },
      required: ['documentId', 'searchTerm']
    }
  }
]

// Setup Google Auth (using service account)
function getGoogleAuth() {
  // Store these in environment variables
  const credentials = {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/documents.readonly'],
  })

  return auth
}

// Function Handlers

export async function readGoogleDoc(
  supabase: any,
  userId: string,
  args: { documentId: string }
) {
  try {
    const auth = getGoogleAuth()
    const docs = google.docs({ version: 'v1', auth })

    // Get document content
    const response = await docs.documents.get({
      documentId: args.documentId,
    })

    const doc = response.data
    const content = extractTextFromDoc(doc)

    return {
      documentId: args.documentId,
      title: doc.title,
      content: content.substring(0, 20000), // Limit size
      contentLength: content.length
    }
  } catch (error: any) {
    if (error.code === 404) {
      throw new Error('Document not found. Make sure it\'s shared with the service account.')
    }
    throw new Error(`Failed to read Google Doc: ${error.message}`)
  }
}

export async function searchGoogleDocs(
  supabase: any,
  userId: string,
  args: { documentId: string; searchTerm: string }
) {
  try {
    const auth = getGoogleAuth()
    const docs = google.docs({ version: 'v1', auth })

    const response = await docs.documents.get({
      documentId: args.documentId,
    })

    const doc = response.data
    const content = extractTextFromDoc(doc)

    // Search for term
    const searchRegex = new RegExp(args.searchTerm, 'gi')
    const matches = content.match(searchRegex) || []

    // Get context around matches
    const contexts: string[] = []
    let index = 0
    while (index < content.length) {
      index = content.toLowerCase().indexOf(args.searchTerm.toLowerCase(), index)
      if (index === -1) break

      const start = Math.max(0, index - 100)
      const end = Math.min(content.length, index + 100)
      contexts.push('...' + content.substring(start, end) + '...')

      index += args.searchTerm.length
    }

    return {
      documentId: args.documentId,
      title: doc.title,
      searchTerm: args.searchTerm,
      matchCount: matches.length,
      contexts: contexts.slice(0, 5) // Limit to 5 contexts
    }
  } catch (error: any) {
    throw new Error(`Failed to search Google Doc: ${error.message}`)
  }
}

// Helper function to extract text from Google Doc structure
function extractTextFromDoc(doc: any): string {
  const content = doc.body?.content || []
  let text = ''

  for (const element of content) {
    if (element.paragraph) {
      const paragraph = element.paragraph
      for (const elem of paragraph.elements || []) {
        if (elem.textRun) {
          text += elem.textRun.content
        }
      }
    } else if (element.table) {
      // Extract table content
      const table = element.table
      for (const row of table.tableRows || []) {
        for (const cell of row.tableCells || []) {
          for (const cellContent of cell.content || []) {
            if (cellContent.paragraph) {
              for (const elem of cellContent.paragraph.elements || []) {
                if (elem.textRun) {
                  text += elem.textRun.content + '\t'
                }
              }
            }
          }
          text += '\n'
        }
      }
    }
  }

  return text
}
```

### Setup Google Service Account

1. **Create Service Account**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable Google Docs API
   - Create Service Account
   - Download JSON key

2. **Add to Environment Variables**:
```bash
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

3. **Share Documents**:
   - Share each Google Doc with the service account email
   - Give "Viewer" access

### Install Required Package

```bash
npm install googleapis
```

---

## Security Best Practices

### 1. Authentication & Authorization

```typescript
// ALWAYS verify user identity
const { data: { user }, error } = await supabase.auth.getUser()
if (error || !user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// ALWAYS verify admin status from database (don't trust client)
const { data: userData } = await supabase
  .from('users')
  .select('is_admin')
  .eq('id', user.id)
  .single()

const isAdmin = !!(userData as any)?.is_admin
```

### 2. Row Level Security (RLS)

Always use RLS policies on your database tables:

```sql
-- Users can only see their own data
CREATE POLICY "Users see own records" ON your_table
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can see all data
CREATE POLICY "Admins see all records" ON your_table
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );
```

### 3. Input Validation

```typescript
// ALWAYS validate and sanitize inputs
const chatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().max(4000) // Limit message length
  })).max(20), // Limit message history
  userId: z.string().uuid()
})

const validatedData = chatSchema.parse(body)
```

### 4. Rate Limiting

```typescript
// Implement rate limiting per user
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
})

// In your API route
const { success } = await ratelimit.limit(user.id)
if (!success) {
  return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
}
```

### 5. Function Execution Timeouts

```typescript
// Set timeout for function execution
const FUNCTION_TIMEOUT = 10000 // 10 seconds

async function executeFunctionWithTimeout(
  functionName: string,
  args: any,
  supabase: any,
  userId: string,
  isAdmin: boolean
) {
  return Promise.race([
    executeFunctionCall(functionName, args, supabase, userId, isAdmin),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Function execution timeout')), FUNCTION_TIMEOUT)
    )
  ])
}
```

### 6. API Key Security

```typescript
// NEVER expose API keys to client
// Store in environment variables or encrypted database

// Priority order for API keys:
// 1. User's personal key (if they opted in)
// 2. Platform admin key (from database, encrypted)
// 3. Environment variable (fallback)

// Encrypt API keys in database
import crypto from 'crypto'

function encryptApiKey(key: string): string {
  const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY!)
  return cipher.update(key, 'utf8', 'hex') + cipher.final('hex')
}

function decryptApiKey(encrypted: string): string {
  const decipher = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPTION_KEY!)
  return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8')
}
```

### 7. Content Filtering for Web Scraping

```typescript
// Whitelist allowed domains for scraping
const ALLOWED_DOMAINS = [
  'wikipedia.org',
  'github.com',
  'yourcompany.com'
]

function isUrlAllowed(url: string): boolean {
  const urlObj = new URL(url)
  return ALLOWED_DOMAINS.some(domain => urlObj.hostname.endsWith(domain))
}

// In scraper function
if (!isUrlAllowed(args.url)) {
  throw new Error('Scraping not allowed for this domain')
}
```

---

## Testing & Debugging

### Test Individual Functions

```typescript
// Create test file: tests/function-handlers.test.ts
import { createClient } from '@supabase/supabase-js'
import { getUserData, searchRecords } from '@/lib/ai/function-handlers'

describe('Function Handlers', () => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  it('should get user data', async () => {
    const result = await getUserData(supabase, 'test-user-id', {
      fields: ['email', 'name']
    })

    expect(result.user).toBeDefined()
    expect(result.user.email).toBeDefined()
  })

  it('should search records', async () => {
    const result = await searchRecords(supabase, 'test-user-id', {
      table: 'orders',
      query: 'test',
      limit: 10
    })

    expect(result.results).toBeInstanceOf(Array)
    expect(result.count).toBeLessThanOrEqual(10)
  })
})
```

### Debug Function Calls

```typescript
// Add detailed logging
export async function executeFunctionCall(
  functionName: string,
  args: any,
  supabase: SupabaseClient,
  userId: string,
  isAdmin: boolean
): Promise<any> {
  console.log('🔧 Function Call:', {
    functionName,
    args,
    userId,
    isAdmin,
    timestamp: new Date().toISOString()
  })

  try {
    const result = await handler(supabase, userId, args)

    console.log('✅ Function Success:', {
      functionName,
      resultSize: JSON.stringify(result).length,
      timestamp: new Date().toISOString()
    })

    return result
  } catch (error: any) {
    console.error('❌ Function Error:', {
      functionName,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    })
    throw error
  }
}
```

### Test OpenAI Integration

```bash
# Create test script: scripts/test-openai-functions.js
const https = require('https')

const API_KEY = process.env.OPENAI_API_KEY

const functions = [
  {
    name: 'getUserData',
    description: 'Get user data',
    parameters: {
      type: 'object',
      properties: {
        fields: { type: 'array', items: { type: 'string' } }
      }
    }
  }
]

const data = JSON.stringify({
  model: 'gpt-4-turbo-preview',
  messages: [
    { role: 'user', content: 'Show me my email and name' }
  ],
  tools: functions.map(fn => ({ type: 'function', function: fn })),
  tool_choice: 'auto'
})

const options = {
  hostname: 'api.openai.com',
  path: '/v1/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  }
}

const req = https.request(options, (res) => {
  let body = ''
  res.on('data', chunk => body += chunk)
  res.on('end', () => {
    const response = JSON.parse(body)
    console.log('OpenAI Response:', JSON.stringify(response, null, 2))
  })
})

req.on('error', error => console.error('Error:', error))
req.write(data)
req.end()
```

### Monitor Function Usage

```typescript
// Track function call metrics
interface FunctionMetric {
  functionName: string
  userId: string
  isAdmin: boolean
  success: boolean
  executionTime: number
  timestamp: Date
}

async function logFunctionMetric(metric: FunctionMetric) {
  await supabase.from('function_metrics').insert([metric])
}

// In executeFunctionCall
const startTime = Date.now()
try {
  const result = await handler(supabase, userId, args)
  await logFunctionMetric({
    functionName,
    userId,
    isAdmin,
    success: true,
    executionTime: Date.now() - startTime,
    timestamp: new Date()
  })
  return result
} catch (error) {
  await logFunctionMetric({
    functionName,
    userId,
    isAdmin,
    success: false,
    executionTime: Date.now() - startTime,
    timestamp: new Date()
  })
  throw error
}
```

---

## Complete Integration Checklist

- [ ] Define function schemas in `function-definitions.ts`
- [ ] Implement function handlers in `function-handlers.ts`
- [ ] Create chat API endpoint at `/api/ai/chat/route.ts`
- [ ] Add authentication and authorization checks
- [ ] Implement role-based function selection
- [ ] Add iterative function calling loop (max 5 rounds)
- [ ] Add web scraping functions (if needed)
- [ ] Add Google Docs integration (if needed)
- [ ] Set up Row Level Security policies
- [ ] Implement rate limiting
- [ ] Add input validation with Zod
- [ ] Add error handling and logging
- [ ] Create admin UI for OpenAI settings
- [ ] Add user UI for personal API key management
- [ ] Test each function individually
- [ ] Test full integration with OpenAI
- [ ] Monitor function usage and performance
- [ ] Document all available functions for users

---

## Quick Start Template

```bash
# 1. Install dependencies
npm install zod cheerio turndown googleapis
npm install -D @types/turndown

# 2. Create folder structure
mkdir -p lib/ai app/api/ai/chat

# 3. Copy templates from this guide
# - lib/ai/function-definitions.ts
# - lib/ai/function-handlers.ts
# - app/api/ai/chat/route.ts

# 4. Set environment variables
echo "OPENAI_API_KEY=sk-..." >> .env.local
echo "GOOGLE_SERVICE_ACCOUNT_EMAIL=..." >> .env.local
echo "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=..." >> .env.local

# 5. Test the integration
npm run dev
# Visit http://localhost:3000/api/ai/chat
```

---

## Additional Resources

- [OpenAI Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Zod Validation](https://zod.dev/)

---

**Remember**: Function calling is a powerful pattern that gives your AI access to live data. Always prioritize security, validate inputs, and enforce proper permissions!
