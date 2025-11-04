# Pathfinder API Documentation

## Overview

Pathfinder provides a RESTful API for internship discovery and outreach automation. This API is designed to be used by the Pathfinder web application and can be integrated with third-party services.

## Base URL

```
https://api.pathfinder.com/v1
```

## Authentication

Most endpoints require authentication using Clerk sessions. Include your session token in the Authorization header:

```
Authorization: Bearer <clerk_session_token>
```

## Jobs API

### Search Jobs

Search for internships with advanced filtering.

**Endpoint:** `POST /api/jobs/search`

**Request Body:**
```json
{
  "query": "software engineer",
  "filters": {
    "function": ["engineering", "product"],
    "majorTags": ["computer science", "software engineering"],
    "location": "San Francisco",
    "remoteFlag": true,
    "paidFlag": true,
    "internshipType": ["summer"],
    "atsType": ["greenhouse", "lever"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "jobs": [
    {
      "id": "uuid",
      "title": "Software Engineering Intern",
      "function": "engineering",
      "majorTags": ["Computer Science"],
      "location": "San Francisco, CA",
      "remoteFlag": true,
      "paidFlag": true,
      "payInfo": {
        "min": 45,
        "max": 60,
        "currency": "USD",
        "period": "hourly"
      },
      "internshipType": "summer",
      "sourceName": "Greenhouse",
      "sourceUrl": "https://boards.greenhouse.io/company/jobs/123",
      "atsType": "greenhouse",
      "postedAt": "2024-01-15T00:00:00Z",
      "lastVerifiedAt": "2024-01-20T00:00:00Z",
      "status": "active",
      "company": {
        "id": "uuid",
        "name": "TechCorp",
        "website": "https://techcorp.com",
        "industryTags": ["technology"]
      }
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 50
}
```

### Get Job Details

Retrieve detailed information about a specific job.

**Endpoint:** `GET /api/jobs/{id}`

**Response:**
```json
{
  "success": true,
  "job": {
    "id": "uuid",
    "title": "Software Engineering Intern",
    "company": {
      "id": "uuid",
      "name": "TechCorp",
      "description": "Leading technology company...",
      "sizeBand": "500+",
      "industryTags": ["technology", "software"]
    },
    "description": "Full job description...",
    "requirements": "List of requirements...",
    "benefits": "Information about benefits..."
  }
}
```

## Outreach API

### Launch Outreach Research

Initiate company research and contact finding for a specific job.

**Endpoint:** `POST /api/outreach/launch`

**Request Body:**
```json
{
  "jobId": "uuid",
  "studentProfile": {
    "name": "John Doe",
    "school": "University of Example",
    "major": "Computer Science",
    "gradDate": "2025-05-01",
    "resumeUrl": "https://s3.amazonaws.com/resumes/john-doe.pdf"
  }
}
```

**Response:**
```json
{
  "success": true,
  "workflowId": "uuid",
  "status": "researching",
  "estimatedCompletion": "2024-01-15T15:30:00Z"
}
```

### Get Outreach Status

Check the status of an outreach workflow.

**Endpoint:** `GET /api/outreach/{workflowId}/status`

**Response:**
```json
{
  "success": true,
  "status": "ready",
  "research": {
    "sources": 12,
    "moments": 8,
    "contacts": 15
  },
  "selectedContacts": [
    {
      "id": "uuid",
      "fullName": "Jane Smith",
      "title": "University Recruiter",
      "email": "jane@techcorp.com",
      "emailConfidence": 0.92,
      "dept": "Recruiting"
    }
  ],
  "emailDrafts": [
    {
      "subject": "Question about your engineering culture",
      "bodyText": "Full email content...",
      "angleTag": "curiosity",
      "sourcesCited": ["https://techcorp.com/blog/engineering-culture"],
      "wordCount": 112
    }
  ]
}
```

### Approve Outreach

Approve email drafts for sending.

**Endpoint:** `POST /api/outreach/{workflowId}/approve`

**Request Body:**
```json
{
  "approvedEmails": ["uuid1", "uuid2", "uuid3"],
  "sendMethod": "gmail",
  "scheduleTime": "2024-01-16T09:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "scheduledAt": "2024-01-16T09:00:00Z",
  "emailCount": 3
}
```

## Webhooks

### n8n Webhook Endpoints

These endpoints are called by n8n workflows:

#### Research Complete
**Endpoint:** `POST /api/webhooks/research-complete`

**Request Body:**
```json
{
  "workflowId": "uuid",
  "jobId": "uuid",
  "results": {
    "sources": [...],
    "moments": [...],
    "contacts": [...]
  }
}
```

#### Email Sent
**Endpoint:** `POST /api/webhooks/email-sent`

**Request Body:**
```json
{
  "workflowId": "uuid",
  "emailId": "uuid",
  "contactId": "uuid",
  "sentAt": "2024-01-16T09:15:00Z",
  "status": "sent"
}
```

#### Email Reply
**Endpoint:** `POST /api/webhooks/email-reply`

**Request Body:**
```json
{
  "workflowId": "uuid",
  "emailId": "uuid",
  "contactId": "uuid",
  "replyAt": "2024-01-17T14:30:00Z",
  "replyContent": "Reply email content..."
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes

- `UNAUTHORIZED`: Invalid or missing authentication
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid request data
- `RATE_LIMITED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Rate Limiting

- Job search: 100 requests per minute per user
- Outreach launch: 5 requests per day per user
- Other endpoints: 200 requests per minute per user

## SDKs

Official SDKs are available for:
- JavaScript/TypeScript (npm: @pathfinder/sdk)
- Python (pip: pathfinder-sdk)
- Ruby (gem: pathfinder-sdk)

## Support

For API support, contact api-support@pathfinder.com or visit our developer portal at https://developers.pathfinder.com.