/**
 * OpenAI Function Calling Definitions
 * These tools allow the AI to query database data securely
 */

export const userFunctions = [
  {
    name: 'getMyScenarios',
    description: 'Get all ROI scenarios for the current user, including calculations and metrics',
    parameters: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of scenarios to return (default: 50)',
        },
        sortBy: {
          type: 'string',
          enum: ['created_at', 'sales_increase', 'revenue_increase', 'cpa_improvement_percent'],
          description: 'Field to sort by (default: created_at)',
        },
        sortOrder: {
          type: 'string',
          enum: ['asc', 'desc'],
          description: 'Sort order (default: desc)',
        },
      },
      required: [],
    },
  },
  {
    name: 'getMyStats',
    description: 'Get aggregated statistics for the current user (total scenarios, average improvements, best performing scenario)',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'compareScenarios',
    description: 'Compare two specific scenarios side by side',
    parameters: {
      type: 'object',
      properties: {
        scenarioId1: {
          type: 'string',
          description: 'UUID of first scenario',
        },
        scenarioId2: {
          type: 'string',
          description: 'UUID of second scenario',
        },
      },
      required: ['scenarioId1', 'scenarioId2'],
    },
  },
  {
    name: 'getScenarioDetails',
    description: 'Get detailed information about a specific scenario including platform breakdown',
    parameters: {
      type: 'object',
      properties: {
        scenarioId: {
          type: 'string',
          description: 'UUID of the scenario',
        },
      },
      required: ['scenarioId'],
    },
  },
]

export const adminFunctions = [
  ...userFunctions,
  {
    name: 'searchUsersByEmail',
    description: 'Find users by email address (partial match supported)',
    parameters: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email address or partial email to search for',
        },
      },
      required: ['email'],
    },
  },
  {
    name: 'searchUsersByName',
    description: 'Find users by first name and/or last name',
    parameters: {
      type: 'object',
      properties: {
        firstName: {
          type: 'string',
          description: 'First name to search for',
        },
        lastName: {
          type: 'string',
          description: 'Last name to search for',
        },
      },
      required: [],
    },
  },
  {
    name: 'searchUsersByCompany',
    description: 'Find users by company name (partial match supported)',
    parameters: {
      type: 'object',
      properties: {
        companyName: {
          type: 'string',
          description: 'Company name to search for',
        },
      },
      required: ['companyName'],
    },
  },
  {
    name: 'getUserScenarios',
    description: 'Get all scenarios for a specific user (admin only)',
    parameters: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'UUID of the user',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of scenarios to return (default: 50)',
        },
      },
      required: ['userId'],
    },
  },
  {
    name: 'getCompanyStats',
    description: 'Get aggregated statistics for all users at a specific company',
    parameters: {
      type: 'object',
      properties: {
        companyName: {
          type: 'string',
          description: 'Company name to analyze',
        },
      },
      required: ['companyName'],
    },
  },
  {
    name: 'getPlatformAnalytics',
    description: 'Get platform-wide analytics and trends across all users',
    parameters: {
      type: 'object',
      properties: {
        timeRange: {
          type: 'string',
          enum: ['7days', '30days', '90days', 'all'],
          description: 'Time range for analytics (default: 30days)',
        },
      },
      required: [],
    },
  },
  {
    name: 'getTopPerformingUsers',
    description: 'Get list of users with the best ROI improvements',
    parameters: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of top users to return (default: 10)',
        },
        sortBy: {
          type: 'string',
          enum: ['sales_increase', 'revenue_increase', 'cpa_improvement'],
          description: 'Metric to sort by (default: revenue_increase)',
        },
      },
      required: [],
    },
  },
]
