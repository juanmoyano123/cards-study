# StudyMaster - API Specification

**Version:** 1.0
**Date:** 2025-11-20
**Base URL:** `https://api.studymaster.app` (Production) | `http://localhost:8000` (Development)
**Protocol:** REST over HTTPS
**Authentication:** JWT Bearer Token (Supabase Auth)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Common Response Formats](#common-response-formats)
3. [Error Codes](#error-codes)
4. [Rate Limiting](#rate-limiting)
5. [API Endpoints](#api-endpoints)
   - [Health & System](#health--system)
   - [Auth](#auth)
   - [Materials](#materials)
   - [Flashcards](#flashcards)
   - [Study](#study)
   - [Stats](#stats)
6. [Webhooks](#webhooks)
7. [Changelog](#changelog)

---

## Authentication

All API requests (except `/health`, `/auth/signup`, `/auth/login`) require authentication using JWT bearer tokens provided by Supabase Auth.

### Request Header

```http
Authorization: Bearer <jwt_token>
```

### Example

```bash
curl -X GET https://api.studymaster.app/flashcards \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Token Expiration

- **Access Token:** 7 days
- **Refresh Token:** 30 days

When an access token expires, clients should use the refresh token to obtain a new access token via Supabase SDK.

---

## Common Response Formats

### Success Response

```json
{
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2025-11-20T12:34:56Z"
}
```

### Error Response

```json
{
  "error": "Error type",
  "detail": "Detailed error message",
  "status_code": 400,
  "timestamp": "2025-11-20T12:34:56Z"
}
```

### Pagination

Endpoints that return lists support pagination:

```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total_items": 157,
    "total_pages": 8
  }
}
```

---

## Error Codes

| HTTP Status | Error Type | Description |
|------------|------------|-------------|
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 413 | Payload Too Large | Request body or file too large |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | External service (OpenAI) unavailable |

---

## Rate Limiting

Rate limits are applied per user (identified by JWT `sub` claim).

| Endpoint | Limit |
|----------|-------|
| `/flashcards/generate` | 10 requests/hour |
| `/materials/extract` | 20 requests/hour |
| All other endpoints | 100 requests/minute |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1637683200
```

When limit is exceeded:

```json
{
  "error": "Rate Limit Exceeded",
  "detail": "You have exceeded the rate limit. Try again in 23 minutes.",
  "retry_after": 1380,
  "status_code": 429
}
```

---

## API Endpoints

### Health & System

#### `GET /health`

Health check endpoint (no authentication required).

**Response:**

```json
{
  "status": "healthy",
  "checks": {
    "database": true,
    "openai": true,
    "supabase": true
  },
  "version": "1.0.0",
  "timestamp": "2025-11-20T12:34:56Z"
}
```

---

### Auth

Authentication endpoints (handled by Supabase Auth, documented for reference).

#### `POST /auth/signup`

Create a new user account.

**Request:**

```json
{
  "email": "student@university.edu",
  "password": "SecurePass123!",
  "name": "Alex Rivera"
}
```

**Validation:**
- `email`: Valid email format, max 255 chars
- `password`: Min 8 chars, must contain 1 number, 1 special char
- `name`: Min 2 chars, max 255 chars

**Response (201 Created):**

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "student@university.edu",
    "name": "Alex Rivera",
    "created_at": "2025-11-20T12:34:56Z"
  },
  "session": {
    "access_token": "eyJhbGc...",
    "refresh_token": "v1.MXX...",
    "expires_in": 604800
  },
  "message": "Account created successfully. Please verify your email."
}
```

**Errors:**
- `409 Conflict`: Email already registered
- `422 Validation Error`: Invalid input

---

#### `POST /auth/login`

Login with email and password.

**Request:**

```json
{
  "email": "student@university.edu",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "student@university.edu",
    "name": "Alex Rivera",
    "last_login_at": "2025-11-20T12:34:56Z"
  },
  "session": {
    "access_token": "eyJhbGc...",
    "refresh_token": "v1.MXX...",
    "expires_in": 604800
  }
}
```

**Errors:**
- `401 Unauthorized`: Invalid credentials
- `422 Validation Error`: Invalid input

---

#### `POST /auth/logout`

Invalidate current JWT token.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**

```json
{
  "message": "Logged out successfully"
}
```

---

#### `GET /auth/me`

Get current user profile.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "student@university.edu",
    "name": "Alex Rivera",
    "avatar_url": "https://cdn.studymaster.app/avatars/user123.jpg",
    "daily_card_limit": 100,
    "study_reminder_time": "18:00:00",
    "timezone": "America/New_York",
    "created_at": "2025-11-01T10:00:00Z",
    "last_login_at": "2025-11-20T12:34:56Z"
  }
}
```

**Errors:**
- `401 Unauthorized`: Invalid or expired token

---

### Materials

#### `POST /materials/extract`

Upload PDF or paste text to extract content.

**Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Request (Form Data):**

**Option 1: File Upload**
```
file: <binary PDF file>
subject_category: "Computer Science" (optional)
```

**Option 2: Text Paste**
```
text: "Paste your study material here..."
filename: "lecture-notes.txt"
subject_category: "Biology" (optional)
```

**Validation:**
- File: PDF only, max 10MB
- Text: Min 100 chars, max 50,000 chars
- `subject_category`: Optional, max 100 chars

**Response (201 Created):**

```json
{
  "material": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "filename": "introduction-to-python.pdf",
    "word_count": 1247,
    "subject_category": "Computer Science",
    "status": "completed",
    "extracted_text": "Python is a high-level...",
    "created_at": "2025-11-20T12:34:56Z"
  },
  "message": "Material extracted successfully"
}
```

**Errors:**
- `400 Bad Request`: Invalid file format
- `413 Payload Too Large`: File exceeds 10MB
- `422 Validation Error`: Missing required fields
- `429 Rate Limit`: Too many uploads

---

#### `GET /materials`

List user's uploaded materials.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (int, default: 1)
- `per_page` (int, default: 20, max: 100)
- `subject_category` (string, optional): Filter by subject
- `search` (string, optional): Search in filename or text

**Example:**
```
GET /materials?page=1&per_page=20&subject_category=Biology
```

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "filename": "cell-biology-chapter3.pdf",
      "word_count": 2341,
      "subject_category": "Biology",
      "status": "completed",
      "flashcard_count": 45,
      "created_at": "2025-11-18T10:20:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total_items": 12,
    "total_pages": 1
  }
}
```

---

#### `GET /materials/{material_id}`

Get a single material by ID.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**

```json
{
  "material": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "filename": "introduction-to-python.pdf",
    "word_count": 1247,
    "subject_category": "Computer Science",
    "tags": ["Python", "Programming"],
    "extracted_text": "Python is a high-level...",
    "status": "completed",
    "created_at": "2025-11-20T12:34:56Z"
  }
}
```

**Errors:**
- `404 Not Found`: Material not found or doesn't belong to user

---

#### `DELETE /materials/{material_id}`

Delete a material (soft delete).

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**

```json
{
  "message": "Material deleted successfully"
}
```

**Note:** Deleting a material also deletes associated flashcards.

---

### Flashcards

#### `POST /flashcards/generate`

Generate flashcards from a material using AI.

**Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request:**

```json
{
  "material_id": "550e8400-e29b-41d4-a716-446655440001",
  "card_count": 20,
  "difficulty": 3,
  "tags": ["Python", "Basics"]
}
```

**Validation:**
- `material_id`: Valid UUID, must belong to user
- `card_count`: Integer between 5 and 50 (default: 20)
- `difficulty`: Integer between 1-5 (default: 3)
- `tags`: Optional array of strings

**Response (201 Created):**

```json
{
  "flashcards": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "question": "Who created the Python programming language?",
      "answer": "Guido van Rossum",
      "explanation": "Guido van Rossum began working on Python in the late 1980s.",
      "tags": ["Python", "History"],
      "difficulty": 2,
      "ai_confidence": 0.95,
      "status": "draft"
    }
  ],
  "message": "Generated 20 flashcards",
  "generation_time_ms": 3420
}
```

**Errors:**
- `404 Not Found`: Material not found
- `429 Rate Limit`: Exceeded generation limit (10/hour)
- `503 Service Unavailable`: OpenAI API error

---

#### `GET /flashcards`

List user's flashcards.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (int, default: 1)
- `per_page` (int, default: 20, max: 100)
- `material_id` (UUID, optional): Filter by material
- `status` (string, optional): `draft`, `active`, `archived`
- `tags` (string, optional): Comma-separated tags
- `search` (string, optional): Search in question/answer

**Example:**
```
GET /flashcards?status=active&tags=Python,Basics&page=1
```

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "question": "Who created Python?",
      "answer": "Guido van Rossum",
      "tags": ["Python", "History"],
      "difficulty": 2,
      "status": "active",
      "stats": {
        "total_reviews": 5,
        "mastery_level": "learning",
        "due_date": "2025-11-22"
      },
      "created_at": "2025-11-20T12:34:56Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total_items": 157,
    "total_pages": 8
  }
}
```

---

#### `GET /flashcards/{card_id}`

Get a single flashcard by ID.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**

```json
{
  "flashcard": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "question": "Who created the Python programming language?",
    "answer": "Guido van Rossum",
    "explanation": "Additional context...",
    "tags": ["Python", "History"],
    "difficulty": 2,
    "ai_confidence": 0.95,
    "status": "active",
    "material": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "filename": "introduction-to-python.pdf"
    },
    "stats": {
      "total_reviews": 5,
      "successful_reviews": 4,
      "mastery_level": "learning",
      "ease_factor": 2.6,
      "current_interval_days": 3,
      "due_date": "2025-11-22"
    },
    "created_at": "2025-11-20T12:34:56Z",
    "updated_at": "2025-11-20T15:00:00Z"
  }
}
```

**Errors:**
- `404 Not Found`: Flashcard not found

---

#### `PUT /flashcards/{card_id}`

Update a flashcard.

**Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request:**

```json
{
  "question": "Updated question?",
  "answer": "Updated answer",
  "explanation": "Additional context",
  "tags": ["Python", "Updated"],
  "difficulty": 3
}
```

**Response (200 OK):**

```json
{
  "flashcard": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "question": "Updated question?",
    "answer": "Updated answer",
    "is_edited": true,
    "updated_at": "2025-11-20T15:30:00Z"
  },
  "message": "Flashcard updated successfully"
}
```

**Errors:**
- `404 Not Found`: Flashcard not found
- `422 Validation Error`: Invalid input

---

#### `DELETE /flashcards/{card_id}`

Delete a flashcard (soft delete).

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**

```json
{
  "message": "Flashcard deleted successfully"
}
```

---

#### `POST /flashcards/confirm`

Confirm draft flashcards (change status from `draft` to `active`).

**Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request:**

```json
{
  "card_ids": [
    "550e8400-e29b-41d4-a716-446655440002",
    "550e8400-e29b-41d4-a716-446655440003"
  ]
}
```

**Response (200 OK):**

```json
{
  "confirmed_count": 2,
  "message": "Flashcards confirmed and ready for study"
}
```

---

### Study

#### `GET /study/queue`

Get cards due today for studying.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `limit` (int, default: 50, max: 200): Max cards to return
- `tags` (string, optional): Filter by comma-separated tags
- `subject` (string, optional): Filter by subject category

**Example:**
```
GET /study/queue?limit=50&tags=Python
```

**Response (200 OK):**

```json
{
  "queue": [
    {
      "card_id": "550e8400-e29b-41d4-a716-446655440002",
      "question": "Who created Python?",
      "answer": "Guido van Rossum",
      "tags": ["Python", "History"],
      "due_date": "2025-11-20",
      "overdue_days": 2,
      "mastery_level": "learning",
      "total_reviews": 3
    }
  ],
  "metadata": {
    "total_due": 47,
    "new_cards": 12,
    "learning_cards": 20,
    "review_cards": 15
  }
}
```

---

#### `POST /study/review`

Submit a card review.

**Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request:**

```json
{
  "card_id": "550e8400-e29b-41d4-a716-446655440002",
  "rating": 3,
  "time_spent_seconds": 12,
  "session_id": "550e8400-e29b-41d4-a716-446655440005"
}
```

**Validation:**
- `card_id`: Valid UUID
- `rating`: Integer 1-4 (1=Again, 2=Hard, 3=Good, 4=Easy)
- `time_spent_seconds`: Integer >= 0
- `session_id`: Optional UUID

**Response (200 OK):**

```json
{
  "review": {
    "card_id": "550e8400-e29b-41d4-a716-446655440002",
    "rating": 3,
    "previous_interval_days": 1,
    "new_interval_days": 3,
    "new_ease_factor": 2.6,
    "due_date": "2025-11-23",
    "mastery_level": "learning"
  },
  "next_card": {
    "card_id": "550e8400-e29b-41d4-a716-446655440003",
    "question": "When was Python released?"
  },
  "session_stats": {
    "cards_studied": 23,
    "cards_remaining": 24
  }
}
```

**Errors:**
- `404 Not Found`: Card not found
- `422 Validation Error`: Invalid rating

---

#### `GET /study/session/{session_id}`

Get study session details.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**

```json
{
  "session": {
    "id": "550e8400-e29b-41d4-a716-446655440005",
    "date": "2025-11-20",
    "cards_studied": 47,
    "cards_again": 8,
    "cards_hard": 12,
    "cards_good": 20,
    "cards_easy": 7,
    "time_spent_minutes": 35,
    "start_time": "2025-11-20T18:00:00Z",
    "end_time": "2025-11-20T18:35:00Z",
    "accuracy": 0.83
  }
}
```

---

### Stats

#### `GET /stats/dashboard`

Get all dashboard statistics.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**

```json
{
  "stats": {
    "current_streak": 12,
    "longest_streak": 25,
    "cards_due_today": 47,
    "cards_studied_today": 0,
    "total_cards_mastered": 234,
    "total_flashcards": 567,
    "total_study_minutes": 1840,
    "average_accuracy": 0.85,
    "mastery_breakdown": {
      "mastered": 234,
      "mature": 156,
      "young": 89,
      "learning": 67,
      "new": 21
    },
    "last_study_date": "2025-11-19"
  }
}
```

---

#### `GET /stats/heatmap`

Get heatmap data for the last 90 days.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `days` (int, default: 90, max: 365): Number of days to retrieve

**Response (200 OK):**

```json
{
  "heatmap": [
    {
      "date": "2025-11-20",
      "cards_studied": 47,
      "time_spent_minutes": 35,
      "intensity": 3
    },
    {
      "date": "2025-11-19",
      "cards_studied": 52,
      "time_spent_minutes": 40,
      "intensity": 3
    }
  ],
  "summary": {
    "total_days": 90,
    "study_days": 78,
    "current_streak": 12,
    "average_cards_per_day": 43.2
  }
}
```

**Note:** `intensity` is calculated as:
- 0: 0 cards
- 1: 1-10 cards
- 2: 11-30 cards
- 3: 31-50 cards
- 4: 50+ cards

---

#### `GET /stats/progress`

Get progress breakdown by subject.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**

```json
{
  "progress": [
    {
      "subject": "Computer Science",
      "total_cards": 234,
      "mastered_cards": 156,
      "mastery_percentage": 66.67,
      "cards_due": 23,
      "last_studied": "2025-11-20"
    },
    {
      "subject": "Biology",
      "total_cards": 189,
      "mastered_cards": 78,
      "mastery_percentage": 41.27,
      "cards_due": 24,
      "last_studied": "2025-11-18"
    }
  ]
}
```

---

## Webhooks

(Future implementation - not in MVP)

StudyMaster will support webhooks for real-time notifications:

- `flashcard.generated` - Triggered when flashcards are generated
- `study.session.completed` - Triggered when study session ends
- `streak.milestone` - Triggered at streak milestones (7, 30, 100 days)

---

## Changelog

### Version 1.0.0 (2025-11-20)
- Initial API specification
- Auth, Materials, Flashcards, Study, Stats endpoints
- JWT authentication
- Rate limiting
- Error handling

---

## Notes for Developers

### Content-Type

All POST/PUT requests should use `Content-Type: application/json` unless uploading files (use `multipart/form-data`).

### Date Formats

All dates use ISO 8601 format: `2025-11-20T12:34:56Z`

### UUIDs

All resource IDs use UUID v4 format.

### Pagination

Default page size is 20, maximum is 100. Use `page` and `per_page` query parameters.

### Testing

Use the following test user for development:

```
Email: test@example.com
Password: TestPassword123!
User ID: 550e8400-e29b-41d4-a716-446655440000
```

### OpenAPI Specification

Auto-generated OpenAPI docs available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

---

**Last Updated:** 2025-11-20
**Maintained By:** Backend Team
**Questions?** Contact: dev@studymaster.app
