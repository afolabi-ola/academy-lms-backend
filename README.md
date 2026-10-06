# Academy LMS Backend API Documentation

This documentation reflects the current implementation in the workspace as of 2026-04-15.

## Table of Contents

- [Base Information](#base-information)
- [Quick Endpoint Index](#quick-endpoint-index)
- [Authentication](#authentication)
- [Validation Rules (Current)](#validation-rules-current)
- [Endpoint Details](#endpoint-details)
- [Endpoint Quick Links](#endpoint-quick-links)
- [Dashboard](#dashboard)
- [Health](#health)
- [Settings](#settings)
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
- [GET /api/v1/dashboard](#dashboard-get)
- [GET /api/v1/settings](#settings-get)
- [PATCH /api/v1/settings](#settings-patch)
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
- [GET /api/v1/payments/:id/receipt](#payments-get-receipt-by-id)
- [GET /api/v1/payments/:id/receipt/pdf](#payments-get-receipt-pdf-by-id)
- [GET /api/v1/enrollments](#enrollments-get)
- [POST /api/v1/enrollments](#enrollments-post)
- [GET /api/v1/enrollments/:id](#enrollments-get-by-id)

## Base Information

- Base URL: `http://localhost:${PORT || 3000}`
- API Prefix: `/api/v1`
- Content-Type:
	- `application/json` for non-file endpoints
	- `multipart/form-data` for image upload endpoints
- Auth style:
	- `Authorization: Bearer <token>`
	- Or auth cookie: `academy_lms_auth_token` (or value in `COOKIE_NAME` env)
- Image uploads are handled through Cloudinary, not the local `public/uploads` folder.
	- The server accepts `multipart/form-data`, resizes the image with `sharp`, and uploads it to Cloudinary under the root folder `academy_lms`.
	- Storage folders: `academy_lms/students`, `academy_lms/sliders`, and `academy_lms/courses`.
	- The database stores the returned Cloudinary `secure_url` plus a `publicId` for future delete/replace operations.
- Image resize presets currently applied before upload (`sharp`):
	- student: 200x300, fit `cover`
	- slider: 2000x800, fit `cover`
	- course: 500x800, fit `cover`
	- uploads are converted to JPEG at 85% quality before sending to Cloudinary

## Quick Endpoint Index

| Module | Method | Endpoint | Auth | Role |
| --- | --- | --- | --- | --- |
| Health | GET | `/` | No | Public |
| Dashboard | GET | `/api/v1/dashboard` | Yes | Any logged-in user |
| Settings | GET | `/api/v1/settings` | No | Public |
| Settings | PATCH | `/api/v1/settings` | Yes | `ADMIN` |
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
| Courses | POST | `/api/v1/courses` | Yes | `ADMIN` |
| Courses | GET | `/api/v1/courses/:id` | No | Public |
| Courses | PATCH | `/api/v1/courses/:id` | Yes | `ADMIN` |
| Courses | DELETE | `/api/v1/courses/:id` | Yes | `ADMIN` |
| Students | GET | `/api/v1/students` | Yes | `ADMIN`, `SUB_ADMIN` |
| Students | POST | `/api/v1/students` | Yes | `ADMIN`, `SUB_ADMIN` |
| Students | GET | `/api/v1/students/:id` | Yes | `ADMIN`, `SUB_ADMIN` |
| Students | PATCH | `/api/v1/students/:id` | Yes | `ADMIN`, `SUB_ADMIN` |
| Students | DELETE | `/api/v1/students/:id` | Yes | `ADMIN`, `SUB_ADMIN` |
| Payments | GET | `/api/v1/payments` | Yes | Any logged-in user |
| Payments | POST | `/api/v1/payments` | Yes | Any logged-in user |
| Payments | GET | `/api/v1/payments/:id` | Yes | Any logged-in user |
| Payments | GET | `/api/v1/payments/:id/receipt` | Yes | Any logged-in user |
| Payments | GET | `/api/v1/payments/:id/receipt/pdf` | Yes | Any logged-in user |
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

- Use `multipart/form-data`.
- File field:
	- `image`: image file (`jpg`, `jpeg`, `png`, etc.)
- Text fields:
	- `title`: string, min 3
	- `description`: string, min 10
	- `duration`: string, min 1
	- `fee`: number, min 1
	- `isActive`: optional boolean

Current implementation note:
- `image` is handled as multipart file upload (`req.file`) while the validator checks text fields from the request body.
- The uploaded file is resized and then pushed to Cloudinary; the saved database value is the Cloudinary `secure_url`, with `publicId` stored separately for delete/replace flows.

### Dashboard query params

`GET /api/v1/dashboard`

- Optional query params:
	- `range`: one of `today`, `week`, `month`, `year`, `custom`
	- `from`: date string
	- `to`: date string
- Query validation is enforced with Zod (`getDashboardSchema`) and returns `400` on invalid input.
- Validation rules:
	- If `range=custom`, both `from` and `to` are required.
	- `from` and `to` must be provided together when either is present.
	- `from` and `to` must be valid date strings.
	- `from` cannot be later than `to`.

### Student payload

`POST /api/v1/students`

- Use `multipart/form-data`.
- Optional file field:
	- `photo`: image file
- Text fields:
	- `surname`: string, min 3
	- `firstname`: string, min 3
	- `otherName`: string, min 3
	- `dateOfBirth`: valid date string (coerced to Date)
	- `email`: valid email
	- `phone`: string length 11-14
	- `address`: string, min 3
	- `parentName`: string, min 3
	- `parentsPhone`: string length 11-14
	- `parentsAddress`: string, min 3
	- `amountReceived`: number >= 1 (coerced)
	- `courseId`: positive integer (coerced)

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

- Use `multipart/form-data`.
- File field:
	- `image`: image file
- Text fields:
	- `title`: string, min 3
	- `description`: string, min 10
	- `isActive`: optional boolean

## Endpoint Details

### Dashboard

<a id="dashboard-get"></a>

#### `GET /api/v1/dashboard`

- Auth required (any logged-in user).
- Query params:
	- `range`: `today` | `week` | `month` | `year` | `custom`
	- `from`: ISO date string
	- `to`: ISO date string
- Query validation rules:
	- If `range=custom`, both `from` and `to` are required.
	- `from` and `to` must be provided together.
	- Both must be valid dates.
	- `from` must be less than or equal to `to`.
- Response `200`:

```json
{
	"status": "success",
	"data": {
		"range": "month",
		"from": "2026-04-01T00:00:00.000Z",
		"to": "2026-04-12T10:00:00.000Z",
		"overview": {
			"totalStudents": 42,
			"activeStudents": 38,
			"totalCourses": 8,
			"activeCourses": 6,
			"totalEnrollments": 55,
			"totalPaymentsReceived": 250000,
			"totalOutstandingBalance": 50000
		},
		"paymentStatusSummary": {
			"fullyPaid": 20,
			"partiallyPaid": 25,
			"unpaid": 10
		},
		"recents": {
			"payments": {
				"results": 5,
				"data": []
			},
			"enrollments": {
				"results": 5,
				"data": []
			}
		},
		"courseStats": {
			"results": 3,
			"data": [
				{
					"title": "Web Development",
					"totalEnrolled": 12,
					"expectedRevenue": 600000,
					"actualRevenue": 450000,
					"outstandingBalance": 150000
				}
			]
		}
	}
}
```

Possible error cases:
- `400` validation error when query rules are violated.
- Common messages include:
	- `` `from` and `to` are required when range is custom ``
	- `` `from` and `to` must be provided together ``
	- `` `from` must be a valid date string ``
	- `` `to` must be a valid date string ``
	- `` `from` cannot be later than `to` ``

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

### Settings

<a id="settings-get"></a>

#### `GET /api/v1/settings`

- Public endpoint; authentication is not required.
- Returns the singleton application settings record.
- Response `200`:

```json
{
	"status": "success",
	"data": {
		"settings": {
			"id": 1,
			"appName": "Academy LMS",
			"appDescription": "A modern learning management system",
			"contactEmail": "admin@example.com",
			"logoUrl": "https://example.com/logo.jpg",
			"favicon": "https://example.com/favicon.jpg",
			"defaultStudentPhoto": "https://example.com/student.jpg",
			"themeMode": "LIGHT",
			"primaryColor": "#eeeeee",
			"secondaryColor": "#1b1b1b",
			"accentColor": "#1b1b1b",
			"backgroundColor": "#070707",
			"timezone": "Africa/Lagos",
			"currency": "NGN"
		}
	}
}
```

<a id="settings-patch"></a>

#### `PATCH /api/v1/settings`

- Auth required, role: `ADMIN`.
- Request type: `multipart/form-data`.
- This is a partial update; send only the fields that should change.
- Text fields:
	- `appName`, `appDescription`, `contactEmail`, `timezone`, `currency`
	- `primaryColor`, `secondaryColor`, `accentColor`, `backgroundColor`
	- `themeMode`: `LIGHT`, `DARK`, or `SYSTEM`
	- `logoText` is accepted by validation but is not currently persisted.
- Optional image file fields:
	- `logo`
	- `favicon`
	- `defaultStudentPhoto`
- Image files are resized and uploaded to Cloudinary. The response contains the resulting image URLs.

Example using `curl` after obtaining a login token:

```bash
curl -X PATCH http://localhost:3000/api/v1/settings \
	-H "Authorization: Bearer <token>" \
	-F "appName=Florintech Academy" \
	-F "themeMode=LIGHT" \
	-F "primaryColor=#eeeeee" \
	-F "currency=NGN" \
	-F "logo=@./logo.png" \
	-F "favicon=@./favicon.png" \
	-F "defaultStudentPhoto=@./default-student-photo.jpg"
```

- Response `200` uses the same `data.settings` shape as `GET /api/v1/settings`.
- A frontend using `FormData` should not set the `Content-Type` header manually; the browser adds the multipart boundary.

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
- Request type: `multipart/form-data`.
- Send `image` file + slider text fields.
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
- Request type: `multipart/form-data`.
- You can send a new `image` file and/or partial slider text fields.
- If a new image is uploaded, the old slider image file is deleted from disk.
- Response `200` returns updated slider under `data`.

<a id="sliders-delete-by-id"></a>

#### `DELETE /api/v1/sliders/:id`

- Auth required, role: `ADMIN`.
- Deletes both DB record and existing slider image file (if present).
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

- Auth required, role: `ADMIN`.
- Request type: `multipart/form-data`.
- Send `image` file + course text fields.
- Response `201` returns created course in `data`.

<a id="courses-get-by-id"></a>

#### `GET /api/v1/courses/:id`

- Public.
- Response `200` returns one course under `data`.
- If not found: `404` with `No course found with that ID`.

<a id="courses-patch-by-id"></a>

#### `PATCH /api/v1/courses/:id`

- Auth required, role: `ADMIN`.
- Request type: `multipart/form-data`.
- You can send a new `image` file and/or partial course text fields.
- If a new image is uploaded, the old course image file is deleted from disk.
- Response `200` returns updated course in `data`.

<a id="courses-delete-by-id"></a>

#### `DELETE /api/v1/courses/:id`

- Auth required, role: `ADMIN`.
- Deletes both DB record and existing course image file (if present).
- Response `204` with `data: null`.

### Students

<a id="students-get"></a>

#### `GET /api/v1/students`

- Auth required, roles: `ADMIN`, `SUB_ADMIN`.
- Response `200` returns a compact list with selected profile fields and enrollment course titles:

```json
{
	"status": "success",
	"results": 1,
	"data": {
		"students": [
			{
				"id": 1,
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
						}
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
- Request type: `multipart/form-data`.
- Send optional `photo` file + student text fields.
- Business rules:
	- Course must exist.
	- Course must be active.
	- `amountReceived` must not exceed course fee.
	- Creates `student`, `enrollment`, and initial `payment` in one transaction.
- Response `201` returns created student under `data.student` with `photo` as absolute URL when file exists.

<a id="students-get-by-id"></a>

#### `GET /api/v1/students/:id`

- Auth required, roles: `ADMIN`, `SUB_ADMIN`.
- Response `200` with full student and enrollment details under `data.student`.
- If not found: `404` with `No student found with that ID`.

<a id="students-patch-by-id"></a>

#### `PATCH /api/v1/students/:id`

- Auth required, roles: `ADMIN`, `SUB_ADMIN`.
- Request type: `multipart/form-data`.
- Send optional new `photo` file + partial student text fields.
- If a new photo is uploaded, the old student photo file is deleted from disk.
- Response `200` with updated student under `data.student` and `photo` as absolute URL when file exists.

<a id="students-delete-by-id"></a>

#### `DELETE /api/v1/students/:id`

- Auth required, roles: `ADMIN`, `SUB_ADMIN`.
- Deletes both DB record and existing student photo file (if present).
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

<a id="payments-get-receipt-by-id"></a>

#### `GET /api/v1/payments/:id/receipt`

- Auth required.
- Returns receipt summary JSON under `data.receipt`.
- Receipt fields currently include:
	- `receiptId`
	- `paymentReferenceId`
	- `student`
	- `course`
	- `courseFee`
	- `amount`
	- `totalPaid`
	- `balance`
	- `date`
- If payment does not exist: `404` with `Payment not found`.

<a id="payments-get-receipt-pdf-by-id"></a>

#### `GET /api/v1/payments/:id/receipt/pdf`

- Auth required.
- Generates receipt PDF using server-side `puppeteer`.
- Response `200`:
	- `Content-Type: application/pdf`
	- `Content-Disposition: attachment; filename=receipt-<receiptId>.pdf`
	- Binary PDF body
- Uses logo watermark/source image from `/uploads/siteSettings/logo.png`.
- If payment does not exist: `404` with `Payment not found`.

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
- `image` string (Cloudinary `secure_url`)
- `publicId` string (Cloudinary public ID used for deletion/overwrite)
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
- `image` string (Cloudinary `secure_url`)
- `publicId` string (Cloudinary public ID used for deletion/overwrite)
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
- `photo` string, optional (Cloudinary `secure_url`)
- `publicId` string, optional (Cloudinary public ID used for deletion/overwrite)
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
- `POST/PATCH /api/v1/courses` are protected and restricted to `ADMIN`.
- Slider, course, and student create/update endpoints use `multer` + `sharp` before uploading to Cloudinary.
- The server stores each uploaded asset’s Cloudinary `publicId` and deletes that asset via Cloudinary when the record is replaced or deleted.
- Read endpoints return direct Cloudinary image URLs from the stored `secure_url` values.
- `GET /api/v1/dashboard` supports date-based filtering using `range` and optional `from`/`to` (for `custom`).
- Payment module now exposes receipt endpoints:
	- JSON receipt: `GET /api/v1/payments/:id/receipt` (protected)
	- PDF receipt download: `GET /api/v1/payments/:id/receipt/pdf` (protected)
- Response envelope structure varies slightly by module (`data` can be an object or direct entity array/object).
- No pagination, filtering, or sorting query params are implemented yet.
- All `:id` path params are expected as numeric values.
