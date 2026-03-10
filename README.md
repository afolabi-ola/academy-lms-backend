# GigTech Backend API Documentation

This documentation reflects the current implementation in the workspace as of 2026-03-10.

## Table of Contents

- [Base Information](#base-information)
- [Quick Endpoint Index](#quick-endpoint-index)
- [Authentication](#authentication)
- [Validation Rules (Current)](#validation-rules-current)
- [Endpoint Details](#endpoint-details)
- [Endpoint Quick Links](#endpoint-quick-links)
- [Health](#health)
- [Sliders](#sliders)
- [FAQs](#faqs)
- [Courses](#courses)
- [Students](#students)
- [Payments](#payments)
- [Enrollments](#enrollments)
- [Error Response Format](#error-response-format)
- [Data Models (Database)](#data-models-database)
- [Notes About Current Behavior](#notes-about-current-behavior)

## Endpoint Quick Links

- [POST /api/v1/users/login](#users-post-login)
- [POST /api/v1/users/register](#users-post-register)
- [GET /](#health-get-root)
- [GET /api/v1/sliders](#sliders-get)
- [POST /api/v1/sliders](#sliders-post)
- [GET /api/v1/sliders/:id](#sliders-get-by-id)
- [PATCH /api/v1/sliders/:id](#sliders-patch-by-id)
- [DELETE /api/v1/sliders/:id](#sliders-delete-by-id)
- [GET /api/v1/faqs](#faqs-get)
- [POST /api/v1/faqs](#faqs-post)
- [GET /api/v1/faqs/:id](#faqs-get-by-id)
- [PATCH /api/v1/faqs/:id](#faqs-patch-by-id)
- [DELETE /api/v1/faqs/:id](#faqs-delete-by-id)
- [GET /api/v1/courses](#courses-get)
- [POST /api/v1/courses](#courses-post)
- [GET /api/v1/courses/:id](#courses-get-by-id)
- [PATCH /api/v1/courses/:id](#courses-patch-by-id)
- [DELETE /api/v1/courses/:id](#courses-delete-by-id)
- [GET /api/v1/students](#students-get)
- [POST /api/v1/students](#students-post)
- [GET /api/v1/students/:id](#students-get-by-id)
- [PATCH /api/v1/students/:id](#students-patch-by-id)
- [DELETE /api/v1/students/:id](#students-delete-by-id)
- [GET /api/v1/payments](#payments-get)
- [POST /api/v1/payments](#payments-post)
- [GET /api/v1/payments/:id](#payments-get-by-id)
- [GET /api/v1/enrollments](#enrollments-get)
- [POST /api/v1/enrollments](#enrollments-post)
- [GET /api/v1/enrollments/:id](#enrollments-get-by-id)

## Base Information

- Base URL: `http://localhost:${PORT || 3000}`
- API Prefix: `/api/v1`
- Content-Type: `application/json`
- Auth style:
	- `Authorization: Bearer <token>`
	- Or auth cookie: `gigtech_auth_token` (or value in `COOKIE_NAME` env)

## Quick Endpoint Index

| Module | Method | Endpoint | Auth | Role |
| --- | --- | --- | --- | --- |
| Health | GET | `/` | No | Public |
| Sliders | GET | `/api/v1/sliders` | No | Public |
| Sliders | POST | `/api/v1/sliders` | Yes | `ADMIN` |
| Sliders | GET | `/api/v1/sliders/:id` | No | Public |
| Sliders | PATCH | `/api/v1/sliders/:id` | Yes | `ADMIN` |
| Sliders | DELETE | `/api/v1/sliders/:id` | Yes | `ADMIN` |
| FAQs | GET | `/api/v1/faqs` | No | Public |
| FAQs | POST | `/api/v1/faqs` | Yes | `ADMIN` |
| FAQs | GET | `/api/v1/faqs/:id` | No | Public |
| FAQs | PATCH | `/api/v1/faqs/:id` | Yes | `ADMIN` |
| FAQs | DELETE | `/api/v1/faqs/:id` | Yes | `ADMIN` |
| Courses | GET | `/api/v1/courses` | No | Public |
| Courses | POST | `/api/v1/courses` | Yes | Any logged-in user |
| Courses | GET | `/api/v1/courses/:id` | No | Public |
| Courses | PATCH | `/api/v1/courses/:id` | Yes | Any logged-in user |
| Courses | DELETE | `/api/v1/courses/:id` | Yes | `ADMIN` |
| Students | GET | `/api/v1/students` | Yes | `ADMIN`, `SUB_ADMIN` |
| Students | POST | `/api/v1/students` | Yes | `ADMIN`, `SUB_ADMIN` |
| Students | GET | `/api/v1/students/:id` | Yes | `ADMIN`, `SUB_ADMIN` |
| Students | PATCH | `/api/v1/students/:id` | Yes | `ADMIN`, `SUB_ADMIN` |
| Students | DELETE | `/api/v1/students/:id` | Yes | `ADMIN`, `SUB_ADMIN` |
| Payments | GET | `/api/v1/payments` | Yes | Any logged-in user |
| Payments | POST | `/api/v1/payments` | Yes | Any logged-in user |
| Payments | GET | `/api/v1/payments/:id` | Yes | Any logged-in user |
| Users | POST | `/api/v1/users/login` | No | Public |
| Users | POST | `/api/v1/users/register` | Yes | `ADMIN` |
| Enrollments | GET | `/api/v1/enrollments` | Yes | Any logged-in user |
| Enrollments | POST | `/api/v1/enrollments` | Yes | Any logged-in user |
| Enrollments | GET | `/api/v1/enrollments/:id` | Yes | Any logged-in user |

## Authentication

<a id="users-post-login"></a>

### Login

- Endpoint: `POST /api/v1/users/login`
- Request body:

```json
{
	"email": "admin@example.com",
	"password": "password123"
}
```

- Success response: `200`

```json
{
	"status": "success",
	"data": {
		"token": "<jwt-token>"
	}
}
```

- Also sets HTTP-only cookie with token.

<a id="users-post-register"></a>

### Register User (Admin only)

- Endpoint: `POST /api/v1/users/register`
- Access: Logged-in `ADMIN` only.
- Request body:

```json
{
	"name": "New Admin",
	"email": "newadmin@example.com",
	"password": "password123"
}
```

- Success response: `201`

```json
{
	"status": "success",
	"data": {
		"user": {
			"id": 1,
			"name": "New Admin",
			"email": "newadmin@example.com",
			"role": "SUB_ADMIN",
			"createdAt": "2026-03-10T00:00:00.000Z"
		}
	}
}
```

## Validation Rules (Current)

### Course payload

`POST/PATCH /api/v1/courses`

```json
{
	"image": "string",
	"title": "min 3 chars",
	"description": "min 10 chars",
	"duration": "string, min 1",
	"fee": "number >= 1",
	"isActive": true
}
```

### Student payload

`POST /api/v1/students`

```json
{
	"surname": "string, min 3",
	"firstname": "string, min 3",
	"otherName": "string, min 3",
	"dateOfBirth": "valid date string",
	"email": "valid email",
	"phone": "string length 11-14",
	"address": "string, min 3",
	"photo": "optional string",
	"parentName": "string, min 3",
	"parentsPhone": "string length 11-14",
	"parentsAddress": "string, min 3",
	"amountReceived": "number >= 1",
	"courseId": 1
}
```

`PATCH /api/v1/students/:id`

- Accepts partial student profile fields.
- Does not allow `courseId` or `amountReceived`.

### Payment payload

`POST /api/v1/payments`

```json
{
	"amountReceived": 5000,
	"enrollmentId": 1
}
```

### Enrollment payload

`POST /api/v1/enrollments`

```json
{
	"studentId": 1,
	"courseId": 1
}
```

### FAQ payload

`POST/PATCH /api/v1/faqs`

```json
{
	"question": "min 3 chars",
	"answer": "min 3 chars",
	"isActive": true
}
```

### Slider payload

`POST/PATCH /api/v1/sliders`

```json
{
	"image": "string",
	"title": "min 3 chars",
	"description": "min 10 chars",
	"isActive": true
}
```

## Endpoint Details

### Health

<a id="health-get-root"></a>

#### `GET /`

- Public endpoint.
- Response `200`:

```json
{
	"status": "success",
	"message": "Welcome to app"
}
```

### Sliders

<a id="sliders-get"></a>

#### `GET /api/v1/sliders`

- Public.
- Response `200`:

```json
{
	"results": 2,
	"status": "success",
	"data": [
		{
			"id": 1,
			"image": "https://example.com/slide.jpg",
			"title": "Spring Bootcamp",
			"description": "Registration is now open",
			"isActive": true,
			"createdAt": "2026-03-10T00:00:00.000Z"
		}
	]
}
```

<a id="sliders-post"></a>

#### `POST /api/v1/sliders`

- Auth required, role: `ADMIN`.
- Request body: slider payload.
- Response `201`:

```json
{
	"status": "success",
	"data": {
		"id": 1,
		"image": "https://example.com/slide.jpg",
		"title": "Spring Bootcamp",
		"description": "Registration is now open",
		"isActive": true,
		"createdAt": "2026-03-10T00:00:00.000Z"
	}
}
```

<a id="sliders-get-by-id"></a>

#### `GET /api/v1/sliders/:id`

- Public.
- Path param: `id` (number).
- Response `200` returns one slider object under `data`.
- If not found: `404` with message `No slider found with that ID`.

<a id="sliders-patch-by-id"></a>

#### `PATCH /api/v1/sliders/:id`

- Auth required, role: `ADMIN`.
- Request body: partial slider payload.
- Response `200` returns updated slider under `data`.

<a id="sliders-delete-by-id"></a>

#### `DELETE /api/v1/sliders/:id`

- Auth required, role: `ADMIN`.
- Response `200`:

```json
{
	"status": "success",
	"data": null
}
```

### FAQs

<a id="faqs-get"></a>

#### `GET /api/v1/faqs`

- Public.
- Response `200`:

```json
{
	"status": "success",
	"results": 2,
	"data": {
		"faqs": [
			{
				"id": 1,
				"question": "How do I enroll?",
				"answer": "Complete the enrollment form",
				"isActive": true,
				"createdAt": "2026-03-10T00:00:00.000Z"
			}
		]
	}
}
```

<a id="faqs-post"></a>

#### `POST /api/v1/faqs`

- Auth required, role: `ADMIN`.
- Request body: FAQ payload.
- Response `201` with created FAQ under `data.faq`.

<a id="faqs-get-by-id"></a>

#### `GET /api/v1/faqs/:id`

- Public.
- Response `200` with FAQ under `data.faq`.
- If not found: `404` with message `No FAQ found with that ID`.

<a id="faqs-patch-by-id"></a>

#### `PATCH /api/v1/faqs/:id`

- Auth required, role: `ADMIN`.
- Request body: partial FAQ payload.
- Response `200` with updated FAQ under `data.faq`.

<a id="faqs-delete-by-id"></a>

#### `DELETE /api/v1/faqs/:id`

- Auth required, role: `ADMIN`.
- Response `204`:

```json
{
	"status": "success",
	"data": null
}
```

### Courses

<a id="courses-get"></a>

#### `GET /api/v1/courses`

- Public.
- Response `200`:

```json
{
	"results": 2,
	"status": "success",
	"data": [
		{
			"id": 1,
			"image": "https://example.com/course.jpg",
			"title": "Web Development",
			"description": "A practical web engineering course",
			"duration": "3 months",
			"fee": 50000,
			"isActive": true,
			"createdAt": "2026-03-10T00:00:00.000Z"
		}
	]
}
```

<a id="courses-post"></a>

#### `POST /api/v1/courses`

- Auth required.
- Current route does not enforce role restriction.
- Request body: course payload.
- Response `201` returns created course in `data`.

<a id="courses-get-by-id"></a>

#### `GET /api/v1/courses/:id`

- Public.
- Response `200` returns one course under `data`.
- If not found: `404` with `No course found with that ID`.

<a id="courses-patch-by-id"></a>

#### `PATCH /api/v1/courses/:id`

- Auth required.
- Current route does not enforce role restriction.
- Request body: partial course payload.
- Response `200` returns updated course in `data`.

<a id="courses-delete-by-id"></a>

#### `DELETE /api/v1/courses/:id`

- Auth required, role: `ADMIN`.
- Response `204` with `data: null`.

### Students

<a id="students-get"></a>

#### `GET /api/v1/students`

- Auth required, roles: `ADMIN`, `SUB_ADMIN`.
- Response `200`:

```json
{
	"status": "success",
	"results": 1,
	"data": {
		"students": [
			{
				"firstname": "John",
				"surname": "Doe",
				"otherName": "Junior",
				"email": "john@example.com",
				"phone": "08012345678",
				"enrollments": [
					{
						"createdAt": "2026-03-10T00:00:00.000Z",
						"course": {
							"title": "Web Development"
						},
						"payment": [
							{
								"amount": 30000
							}
						]
					}
				]
			}
		]
	}
}
```

<a id="students-post"></a>

#### `POST /api/v1/students`

- Auth required, roles: `ADMIN`, `SUB_ADMIN`.
- Request body: create student payload.
- Business rules:
	- Course must exist.
	- Course must be active.
	- `amountReceived` must not exceed course fee.
	- Creates `student`, `enrollment`, and initial `payment` in one transaction.
- Response `201` returns created student under `data.student`.

<a id="students-get-by-id"></a>

#### `GET /api/v1/students/:id`

- Auth required, roles: `ADMIN`, `SUB_ADMIN`.
- Response `200` with full student and enrollment details under `data.student`.
- If not found: `404` with `No student found with that ID`.

<a id="students-patch-by-id"></a>

#### `PATCH /api/v1/students/:id`

- Auth required, roles: `ADMIN`, `SUB_ADMIN`.
- Request body: partial update student payload.
- Response `200` with updated student under `data.student`.

<a id="students-delete-by-id"></a>

#### `DELETE /api/v1/students/:id`

- Auth required, roles: `ADMIN`, `SUB_ADMIN`.
- Response `204` with `data: null`.

### Payments

<a id="payments-get"></a>

#### `GET /api/v1/payments`

- Auth required.
- Response `200` returns payments under `data.payments` including nested student and course summary.

<a id="payments-post"></a>

#### `POST /api/v1/payments`

- Auth required.
- Request body: payment payload.
- Business rules:
	- Enrollment must exist.
	- `amountReceived` must not exceed course fee.
	- Total paid so far + new amount must not exceed course fee.
- Response `201` with created payment under `data.payment`.

<a id="payments-get-by-id"></a>

#### `GET /api/v1/payments/:id`

- Auth required.
- Response `200` with payment details under `data.payment`.
- If not found: `404` with `Payment not found`.

### Enrollments

<a id="enrollments-get"></a>

#### `GET /api/v1/enrollments`

- Auth required.
- Response `200` with summarized enrollment list under `data.enrollments`.

<a id="enrollments-post"></a>

#### `POST /api/v1/enrollments`

- Auth required.
- Request body:

```json
{
	"studentId": 1,
	"courseId": 1
}
```

- Business rules:
	- Student must exist.
	- Course must exist.
	- Course must be active.
	- Student must not already be enrolled in same course.
- Response `201` with created enrollment under `data.enrollment`.

<a id="enrollments-get-by-id"></a>

#### `GET /api/v1/enrollments/:id`

- Auth required.
- Response `200` includes:
	- Enrollment core details (`student`, `course`).
	- Related `payments` list.
	- `paymentSummary`:
		- `totalAmountPaid`
		- `balance`
		- `status` (`Paid`, `Partially Paid`, `Unpaid`)
- If not found: `404` with `Enrollment not found`.

## Error Response Format

### Production mode (`NODE_ENV=production`)

Operational errors return:

```json
{
	"status": "fail",
	"message": "Validation failed",
	"error": [
		{
			"field": "body.title",
			"message": "Title must be at least 3 characters long"
		}
	]
}
```

Unknown/non-operational errors return:

```json
{
	"status": "error",
	"message": "Something went wrong!"
}
```

### Development mode (`NODE_ENV=development`)

Includes full debug fields:

```json
{
	"status": "fail",
	"error": {
		"message": "Validation failed"
	},
	"message": "Validation failed",
	"stack": "...",
	"isOperational": true
}
```

## Data Models (Database)

### Slider

- `id` number
- `image` string
- `title` string
- `description` string
- `isActive` boolean, default `true`
- `createdAt` datetime

### Faq

- `id` number
- `question` string
- `answer` string
- `isActive` boolean, default `true`
- `createdAt` datetime

### Course

- `id` number
- `image` string
- `title` string
- `description` string
- `duration` string
- `fee` float
- `isActive` boolean, default `true`
- `createdAt` datetime

### Student

- `id` number
- `surname` string
- `firstname` string
- `otherName` string
- `dateOfBirth` datetime
- `email` string (unique)
- `phone` string
- `address` string
- `photo` string, optional
- `parentName` string
- `parentsPhone` string
- `parentsAddress` string
- `createdAt` datetime

### Enrollment

- `id` number
- `studentId` number
- `courseId` number
- `createdAt` datetime
- Unique composite: (`studentId`, `courseId`)

### Payment

- `id` number
- `amount` float
- `reference` string (unique UUID)
- `enrollmentId` number
- `createdAt` datetime

### User

- `id` number
- `name` string
- `email` string (unique)
- `password` string (hashed)
- `role` enum: `ADMIN` or `SUB_ADMIN` (default `SUB_ADMIN`)
- `createdAt` datetime

## Notes About Current Behavior

- `DELETE /api/v1/faqs/:id` is protected and restricted to `ADMIN`.
- `POST/PATCH /api/v1/courses` require login but currently do not enforce an admin role.
- Response envelope structure varies slightly by module (`data` can be an object or direct entity array/object).
- No pagination, filtering, or sorting query params are implemented yet.
- All `:id` path params are expected as numeric values.
