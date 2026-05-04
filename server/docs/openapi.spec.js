/**
 * OpenAPI 3.0 specification for the Medico API.
 * Served at GET /api/docs (Swagger UI) and GET /api/docs/openapi.json (raw JSON).
 */

const info = {
  title: "Medico API",
  version: "1.0.0",
  description: [
    "REST API for the Medico healthcare booking platform (Express + MongoDB).",
    "",
    "**Authentication:** Most routes use **HttpOnly cookies** `accessToken` (JWT) and `refreshToken`.",
    "Login and refresh endpoints set these cookies. Send requests with `credentials: 'include'` (browser) or forward cookies.",
    "",
    "**Try it out:** For cookie-based routes, authenticate first via `POST /api/auth/login`, then execute other calls from the same browser session.",
    "",
    "**Related:** User roles: `user`, `doctor`, `admin`, `pharmacyOwner`. Appointment statuses: `pending`, `scheduled`, `completed`, `rejected`, `cancelled`.",
  ].join("\n"),
};

const tags = [
  { name: "Health", description: "Process health (no /api prefix)." },
  { name: "Auth", description: "Registration, login, OAuth, tokens, doctor approval (admin)." },
  { name: "Users", description: "User CRUD, profile upload (authenticated)." },
  { name: "Facilities", description: "Clinics / hospitals; list is public; mutations require auth." },
  { name: "Appointments", description: "Booking, listing, admin summary, occupancy for slots." },
];

const components = {
  securitySchemes: {
    cookieAuth: {
      type: "apiKey",
      in: "cookie",
      name: "accessToken",
      description: "JWT access token set by login or Google OAuth callback.",
    },
  },
  schemas: {
    Error: {
      type: "object",
      properties: {
        error: { type: "string", example: "Invalid credentials" },
        message: { type: "string", example: "Appointment not found" },
      },
      description: "Errors use `error` (auth/users) or `message` (appointments/facilities) depending on route.",
    },
    JwtPayload: {
      type: "object",
      properties: {
        id: { type: "string", example: "507f1f77bcf86cd799439011" },
        role: { type: "string", enum: ["user", "doctor", "admin", "pharmacyOwner"] },
        iat: { type: "integer" },
        exp: { type: "integer" },
      },
    },
    AuthSuccess: {
      type: "object",
      properties: {
        message: { type: "string", example: "Login success" },
        token: { $ref: "#/components/schemas/JwtPayload" },
        user: { $ref: "#/components/schemas/User" },
        requirePasswordChange: { type: "boolean" },
        accountStatus: {
          type: "string",
          enum: ["active", "pendingApproval", "rejected", "suspended"],
        },
      },
    },
    User: {
      type: "object",
      description: "Mongoose user document (fields vary by role).",
      properties: {
        _id: { type: "string" },
        username: { type: "string", example: "Jane Patient" },
        email: { type: "string", format: "email" },
        role: { type: "string", enum: ["user", "doctor", "admin", "pharmacyOwner"] },
        accountStatus: { type: "string" },
        requirePasswordChange: { type: "boolean" },
        specialization: { type: "string", nullable: true },
        experience: { type: "number", nullable: true },
        availableDays: { type: "array", items: { type: "string" } },
        availableTime: { type: "object", additionalProperties: true },
        facilityIds: { type: "array", items: { type: "string" } },
        doctorVerification: { type: "object", additionalProperties: true },
        profileImage: { type: "string", nullable: true },
        mobile: { type: "number", nullable: true },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
    TimeSlot: {
      type: "object",
      required: ["start", "end"],
      properties: {
        start: { type: "string", example: "09:00", description: "HH:mm" },
        end: { type: "string", example: "09:30", description: "HH:mm" },
      },
    },
    Appointment: {
      type: "object",
      properties: {
        _id: { type: "string" },
        doctorId: { oneOf: [{ type: "string" }, { $ref: "#/components/schemas/User" }] },
        facilityId: { oneOf: [{ type: "string" }, { type: "object" }] },
        userId: { oneOf: [{ type: "string" }, { $ref: "#/components/schemas/User" }] },
        reason: { type: "string", example: "Follow-up consultation" },
        date: { type: "string", format: "date-time" },
        timeSlot: { $ref: "#/components/schemas/TimeSlot" },
        mode: { type: "string", enum: ["in-person", "video", "audio", "chat"] },
        status: {
          type: "string",
          enum: ["pending", "scheduled", "completed", "rejected", "cancelled"],
        },
        calendar: { type: "object", additionalProperties: true },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
    AppointmentListResponse: {
      type: "object",
      properties: {
        items: { type: "array", items: { $ref: "#/components/schemas/Appointment" } },
        page: { type: "integer", example: 1 },
        limit: { type: "integer", example: 10 },
        total: { type: "integer", example: 42 },
        totalPages: { type: "integer", example: 5 },
      },
    },
    Facility: {
      type: "object",
      properties: {
        _id: { type: "string" },
        name: { type: "string", example: "City General Hospital" },
        type: { type: "string", enum: ["hospital", "clinic", "pharmacy"] },
        owner: { type: "string" },
        address: { type: "object", additionalProperties: true },
        lat: { type: "number", example: 12.9716 },
        lng: { type: "number", example: 77.5946 },
        verificationStatus: { type: "string", enum: ["pending", "approved", "rejected"] },
        images: { type: "array", items: { type: "string" } },
        documents: { type: "array", items: { type: "string" } },
        availableDays: { type: "array", items: { type: "string" } },
        availableTimeSlots: { type: "object", additionalProperties: true },
      },
    },
    FacilityWithDoctors: {
      type: "object",
      properties: {
        facility: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            type: { type: "string" },
          },
        },
        doctors: {
          type: "array",
          items: {
            type: "object",
            properties: {
              _id: { type: "string" },
              username: { type: "string" },
              specialization: { type: "string" },
              experience: { type: "number" },
              availableDays: { type: "array", items: { type: "string" } },
              availableTime: { type: "object", additionalProperties: true },
              profileImage: { type: "string", nullable: true },
            },
          },
        },
      },
    },
    AdminSummary: {
      type: "object",
      properties: {
        counts: {
          type: "object",
          properties: {
            appointments: { type: "integer" },
            facilities: { type: "integer" },
            users: { type: "integer" },
            doctors: { type: "integer" },
          },
        },
        days: { type: "integer", description: "Window used for aggregates (7, 30, or 90)." },
        statusBreakdown: { type: "object", additionalProperties: { type: "integer" } },
        modeBreakdown: { type: "object", additionalProperties: { type: "integer" } },
        facilityStatusBreakdown: { type: "object", additionalProperties: { type: "integer" } },
        monthlyAppointments: {
          type: "array",
          items: {
            type: "object",
            properties: {
              label: { type: "string", example: "2026-04" },
              count: { type: "integer" },
            },
          },
        },
      },
    },
    BookedSlotsResponse: {
      type: "object",
      properties: {
        slots: {
          type: "array",
          items: { $ref: "#/components/schemas/TimeSlot" },
          description: "Intervals blocked by pending or scheduled appointments.",
        },
      },
      example: { slots: [{ start: "09:00", end: "09:30" }, { start: "17:00", end: "17:30" }] },
    },
  },
};

const paths = {
  "/health": {
    get: {
      tags: ["Health"],
      summary: "Health check",
      description: "Liveness probe; does not require authentication.",
      responses: {
        200: {
          description: "Service is up",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", example: "ok" },
                  uptime: { type: "number", example: 123.45 },
                },
              },
              example: { status: "ok", uptime: 3600.2 },
            },
          },
        },
      },
    },
  },

  "/api/auth/register": {
    post: {
      tags: ["Auth"],
      summary: "Register patient (password flow)",
      description:
        "Creates a patient account without password; sends email with link to `set-password-with-token`. User receives `requirePasswordChange: true` until password is set.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["username", "email"],
              properties: {
                username: { type: "string", example: "Jane Patient" },
                email: { type: "string", format: "email", example: "jane@gmail.com" },
              },
            },
            example: { username: "Jane Patient", email: "jane@gmail.com" },
          },
        },
      },
      responses: {
        201: {
          description: "Registration accepted; check email",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Registration received. Please check your email to confirm account setup.",
                  },
                },
              },
            },
          },
        },
        400: { description: "Missing fields", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        409: { description: "Email already registered", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      },
    },
  },

  "/api/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Login with password",
      description: "Authenticates by email or username (`identifier`) and password. Sets `accessToken` and `refreshToken` cookies.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["identifier", "password"],
              properties: {
                identifier: { type: "string", example: "jane@gmail.com", description: "Email or username" },
                password: { type: "string", format: "password", example: "Secret123" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Login success; cookies set",
          content: { "application/json": { schema: { $ref: "#/components/schemas/AuthSuccess" } } },
        },
        401: { description: "Invalid credentials", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        403: { description: "Account pending, rejected, or suspended", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      },
    },
  },

  "/api/auth/doctor-request": {
    post: {
      tags: ["Auth"],
      summary: "Submit doctor registration request",
      description:
        "Public endpoint. Creates doctor user with `accountStatus: pendingApproval`. Requires full `doctorVerification` with allowed council/university/degree values (see server validation).",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["username", "email", "specialization", "doctorVerification"],
              properties: {
                username: { type: "string" },
                email: { type: "string", format: "email" },
                specialization: { type: "string", example: "Cardiology" },
                experience: { type: "number", example: 5 },
                availableDays: { type: "array", items: { type: "string", example: "Monday" } },
                availableTime: {
                  type: "object",
                  additionalProperties: {
                    type: "object",
                    properties: {
                      day: { type: "string", example: "09:00-13:00" },
                      night: { type: "string", example: "17:00-20:00" },
                    },
                  },
                  example: { Monday: { day: "09:00-13:00", night: "17:00-20:00" } },
                },
                facilityIds: { type: "array", items: { type: "string" } },
                doctorVerification: {
                  type: "object",
                  required: [
                    "registrationNumber",
                    "medicalCouncil",
                    "registrationYear",
                    "degreeCategory",
                    "degree",
                    "university",
                  ],
                  properties: {
                    registrationNumber: { type: "string", example: "TN12345" },
                    medicalCouncil: { type: "string", example: "Tamil Nadu Medical Council" },
                    registrationYear: { type: "integer", example: 2015 },
                    degreeCategory: { type: "string", enum: ["undergraduate", "postgraduate"] },
                    degree: { type: "string", example: "MBBS (Bachelor of Medicine and Bachelor of Surgery)" },
                    university: {
                      type: "string",
                      example: "The Tamil Nadu Dr. M.G.R. Medical University, Chennai",
                    },
                  },
                },
              },
            },
            example: {
              username: "Dr. Example",
              email: "dr.example@hospital.org",
              specialization: "General Medicine",
              experience: 8,
              availableDays: ["Monday", "Wednesday", "Friday"],
              availableTime: {
                Monday: { day: "09:00-13:00", night: "17:00-20:00" },
              },
              facilityIds: ["507f1f77bcf86cd799439011"],
              doctorVerification: {
                registrationNumber: "AP98765",
                medicalCouncil: "Andhra Pradesh Medical Council",
                registrationYear: 2012,
                degreeCategory: "undergraduate",
                degree: "MBBS (Bachelor of Medicine and Bachelor of Surgery)",
                university: "NTR University of Health Sciences, Vijayawada",
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Request stored for admin review",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string" },
                  userId: { type: "string" },
                },
                example: {
                  message: "Doctor request submitted and pending admin approval",
                  userId: "507f1f77bcf86cd799439011",
                },
              },
            },
          },
        },
        400: { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        409: { description: "Email already exists", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      },
    },
  },

  "/api/auth/change-password": {
    post: {
      tags: ["Auth"],
      summary: "Change password (authenticated)",
      description:
        "If `requirePasswordChange` is true, `currentPassword` may be omitted. Otherwise current password is required.",
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["newPassword"],
              properties: {
                currentPassword: { type: "string", format: "password" },
                newPassword: { type: "string", format: "password", description: "Min 8 chars, letters + numbers" },
              },
            },
            example: { currentPassword: "OldPass1", newPassword: "NewPass2" },
          },
        },
      },
      responses: {
        200: {
          description: "Password updated",
          content: {
            "application/json": {
              schema: { type: "object", properties: { message: { type: "string" } } },
              example: { message: "Password updated successfully" },
            },
          },
        },
        400: { description: "Weak password or not initialized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        401: { description: "Wrong current password", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      },
    },
  },

  "/api/auth/set-password-with-token": {
    post: {
      tags: ["Auth"],
      summary: "Set password from email link",
      description: "Uses JWT from registration or doctor-approval email (`type: password_setup`).",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["token", "newPassword"],
              properties: {
                token: { type: "string", description: "JWT from email query param" },
                newPassword: { type: "string", format: "password" },
              },
            },
            example: { token: "<jwt-from-email>", newPassword: "SecurePass1" },
          },
        },
      },
      responses: {
        200: {
          description: "Password set",
          content: {
            "application/json": {
              example: { message: "Password set successfully. You can now log in." },
            },
          },
        },
        400: { description: "Invalid token or weak password", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      },
    },
  },

  "/api/auth/doctor-requests/pending": {
    get: {
      tags: ["Auth"],
      summary: "List pending doctor requests",
      security: [{ cookieAuth: [] }],
      description: "**Admin only.**",
      responses: {
        200: {
          description: "Pending doctor users",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { items: { type: "array", items: { $ref: "#/components/schemas/User" } } },
              },
              example: { items: [] },
            },
          },
        },
        403: { description: "Not admin", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      },
    },
  },

  "/api/auth/doctor-requests/{id}/approve": {
    post: {
      tags: ["Auth"],
      summary: "Approve doctor request",
      security: [{ cookieAuth: [] }],
      description: "**Admin only.** Activates account and emails password-setup link.",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        200: {
          description: "Approved",
          content: {
            "application/json": {
              example: { message: "Doctor request approved", userId: "...", requirePasswordChange: true },
            },
          },
        },
        400: { description: "Not in pending state", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        403: { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        404: { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      },
    },
  },

  "/api/auth/doctor-requests/{id}/reject": {
    post: {
      tags: ["Auth"],
      summary: "Reject doctor request",
      security: [{ cookieAuth: [] }],
      description: "**Admin only.**",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: { reason: { type: "string", example: "Incomplete verification documents" } },
            },
          },
        },
      },
      responses: {
        200: { description: "Rejected", content: { "application/json": { example: { message: "Doctor request rejected" } } } },
        403: { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      },
    },
  },

  "/api/auth/login/google": {
    post: {
      tags: ["Auth"],
      summary: "Login with Google ID token (legacy / popup flow)",
      description: "Verifies Google `idToken` from client SDK; sets cookies like password login.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { type: "object", required: ["idToken"], properties: { idToken: { type: "string" } } },
            example: { idToken: "<google-id-token>" },
          },
        },
      },
      responses: {
        200: { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthSuccess" } } } },
        401: { description: "Invalid token", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      },
    },
  },

  "/api/auth/google/url": {
    get: {
      tags: ["Auth"],
      summary: "Start redirect-based Google OAuth",
      description: "Returns Google authorization URL; also sets `google_oauth_state` cookie.",
      responses: {
        200: {
          description: "Auth URL",
          content: {
            "application/json": {
              schema: { type: "object", properties: { url: { type: "string", format: "uri" } } },
              example: { url: "https://accounts.google.com/o/oauth2/v2/auth?..." },
            },
          },
        },
      },
    },
  },

  "/api/auth/google/callback": {
    get: {
      tags: ["Auth"],
      summary: "Google OAuth redirect callback",
      description: "Browser redirect from Google with `code` and `state`. Sets session cookies and redirects to `FRONTEND_URL`.",
      parameters: [
        { name: "code", in: "query", schema: { type: "string" } },
        { name: "state", in: "query", schema: { type: "string" } },
      ],
      responses: {
        302: { description: "Redirect to frontend home or login with error query" },
      },
    },
  },

  "/api/auth/token/refresh": {
    get: {
      tags: ["Auth"],
      summary: "Refresh access token",
      description: "Reads `refreshToken` cookie; issues new `accessToken` cookie.",
      responses: {
        200: {
          description: "New access token",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string" },
                  token: { $ref: "#/components/schemas/JwtPayload" },
                  requirePasswordChange: { type: "boolean" },
                  accountStatus: { type: "string" },
                },
              },
              example: { message: "Token refreshed", token: { id: "...", role: "user" }, requirePasswordChange: false, accountStatus: "active" },
            },
          },
        },
        401: { description: "No refresh cookie", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        403: { description: "Invalid refresh", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      },
    },
  },

  "/api/auth/token/verify": {
    get: {
      tags: ["Auth"],
      summary: "Verify access token",
      description: "Validates `accessToken` cookie and returns decoded token + user document.",
      responses: {
        200: {
          description: "Valid",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string" },
                  token: { $ref: "#/components/schemas/JwtPayload" },
                  user: { $ref: "#/components/schemas/User" },
                  requirePasswordChange: { type: "boolean" },
                  accountStatus: { type: "string" },
                },
              },
            },
          },
        },
        401: { description: "Missing or invalid token", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        404: { description: "User removed", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      },
    },
  },

  "/api/auth/logout": {
    get: {
      tags: ["Auth"],
      summary: "Clear session cookies",
      responses: {
        200: { description: "Cookies cleared", content: { "application/json": { example: { message: "Logout success" } } } },
      },
    },
  },

  "/api/users/google-signin": {
    post: {
      tags: ["Users"],
      summary: "Legacy Google sign-in (alternate path)",
      description: "Older utility endpoint; prefer `/api/auth/login/google` or redirect OAuth.",
      requestBody: {
        content: {
          "application/json": {
            schema: { type: "object", properties: { token: { type: "string", description: "Google client token" } } },
            example: { token: "<google-token>" },
          },
        },
      },
      responses: {
        200: { description: "User object", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
        400: { description: "Invalid token", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      },
    },
  },

  "/api/users": {
    post: {
      tags: ["Users"],
      summary: "Create user (admin)",
      security: [{ cookieAuth: [] }],
      description: "**Admin only.** For doctors, may return `temporaryPassword` once.",
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["username", "email"],
              properties: {
                username: { type: "string" },
                email: { type: "string", format: "email" },
                role: { type: "string", enum: ["user", "doctor", "admin", "pharmacyOwner"] },
                mobile: { type: "number" },
                specialization: { type: "string" },
                experience: { type: "number" },
                availableDays: { type: "array", items: { type: "string" } },
                availableTime: { type: "object" },
                facilityIds: { type: "array", items: { type: "string" } },
                address: { type: "string" },
                state: { type: "string" },
                district: { type: "string" },
                pincode: { type: "string" },
                profileImage: { type: "string" },
                isVerified: { type: "boolean" },
                personalDetails: { type: "object" },
                paymentDetails: { type: "object" },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Created",
          content: {
            "application/json": {
              example: {
                message: "User created successfully",
                user: { _id: "...", username: "Dr New", email: "dr@example.com", role: "doctor" },
                temporaryPassword: "Docabc129",
              },
            },
          },
        },
        403: { description: "Not admin", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      },
    },
    get: {
      tags: ["Users"],
      summary: "List all users",
      security: [{ cookieAuth: [] }],
      responses: {
        200: { description: "Array of users", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/User" } } } } },
      },
    },
  },

  "/api/users/{id}": {
    get: {
      tags: ["Users"],
      summary: "Get user by ID",
      security: [{ cookieAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        200: { description: "User", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
        404: { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      },
    },
    put: {
      tags: ["Users"],
      summary: "Update user",
      security: [{ cookieAuth: [] }],
      description: "Non-admin users may only update their own profile (`req.user.id`). Admins may update any user.",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                username: { type: "string" },
                email: { type: "string" },
                mobile: { type: "number" },
                address: { type: "string" },
                specialization: { type: "string" },
                availableDays: { type: "array", items: { type: "string" } },
                availableTime: { type: "object" },
                facilityIds: { type: "array", items: { type: "string" } },
                role: { type: "string", description: "Admin only" },
                personalDetails: { type: "object" },
                paymentDetails: { type: "object" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Updated",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string" },
                  user: { $ref: "#/components/schemas/User" },
                },
              },
            },
          },
        },
        500: { description: "Server error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      },
    },
    delete: {
      tags: ["Users"],
      summary: "Delete user",
      security: [{ cookieAuth: [] }],
      description: "**Admin only.**",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        200: { description: "Deleted", content: { "application/json": { example: { message: "User deleted" } } } },
        403: { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      },
    },
  },

  "/api/users/{id}/upload-profile": {
    patch: {
      tags: ["Users"],
      summary: "Upload profile image",
      security: [{ cookieAuth: [] }],
      description: "Multipart field name: `profile` (single file).",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                profile: { type: "string", format: "binary" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Profile URL updated",
          content: {
            "application/json": {
              example: { message: "Profile updated successfully", user: { profileImage: "http://localhost:3000/uploads/profiles/..." } },
            },
          },
        },
      },
    },
  },

  "/api/facilities": {
    get: {
      tags: ["Facilities"],
      summary: "List facilities",
      description: "Optional filters: `type`, `city` (matches `address.city`), `owner`, `isVerified`.",
      parameters: [
        { name: "type", in: "query", schema: { type: "string", enum: ["hospital", "clinic", "pharmacy"] } },
        { name: "city", in: "query", schema: { type: "string" } },
        { name: "owner", in: "query", schema: { type: "string" } },
        { name: "isVerified", in: "query", schema: { type: "string" } },
      ],
      responses: {
        200: { description: "Facility array", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Facility" } } } } },
      },
    },
    post: {
      tags: ["Facilities"],
      summary: "Create facility",
      security: [{ cookieAuth: [] }],
      description: "Multipart: JSON fields in body plus optional `images` (max 5) and `documents` (max 3).",
      requestBody: {
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["name", "type", "lat", "lng"],
              properties: {
                name: { type: "string" },
                type: { type: "string", enum: ["hospital", "clinic", "pharmacy"] },
                lat: { type: "number" },
                lng: { type: "number" },
                "address.line1": { type: "string" },
                "address.city": { type: "string" },
                images: { type: "array", items: { type: "string", format: "binary" } },
                documents: { type: "array", items: { type: "string", format: "binary" } },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Created",
          content: {
            "application/json": {
              example: { message: "Facility created successfully", facility: { _id: "...", name: "City Clinic" } },
            },
          },
        },
      },
    },
  },

  "/api/facilities/{id}": {
    get: {
      tags: ["Facilities"],
      summary: "Get facility with linked doctors",
      description: "Returns slim `facility` plus `doctors` array (availability for booking). Optional `date` query is accepted for future use.",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
        { name: "date", in: "query", schema: { type: "string", format: "date", example: "2026-05-10" } },
      ],
      responses: {
        200: { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/FacilityWithDoctors" } } } },
        404: { description: "Not found", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" } } } } } },
      },
    },
    patch: {
      tags: ["Facilities"],
      summary: "Update facility",
      security: [{ cookieAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        content: {
          "multipart/form-data": {
            schema: { type: "object", additionalProperties: true },
          },
        },
      },
      responses: {
        200: { description: "Updated", content: { "application/json": { example: { message: "Facility updated", facility: {} } } } },
        404: { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      },
    },
    delete: {
      tags: ["Facilities"],
      summary: "Delete facility",
      security: [{ cookieAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        200: { description: "Deleted", content: { "application/json": { example: { message: "Facility deleted" } } } },
        404: { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      },
    },
  },

  "/api/appointments": {
    post: {
      tags: ["Appointments"],
      summary: "Create appointment request",
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["doctorId", "facilityId", "reason", "date", "timeSlot", "mode"],
              properties: {
                doctorId: { type: "string" },
                facilityId: { type: "string" },
                reason: { type: "string" },
                date: { type: "string", format: "date", example: "2026-06-15" },
                timeSlot: { $ref: "#/components/schemas/TimeSlot" },
                mode: { type: "string", enum: ["in-person", "video", "chat", "audio"] },
              },
            },
            example: {
              doctorId: "507f1f77bcf86cd799439011",
              facilityId: "507f1f77bcf86cd799439012",
              reason: "Annual checkup",
              date: "2026-06-15",
              timeSlot: { start: "10:00", end: "10:30" },
              mode: "in-person",
            },
          },
        },
      },
      responses: {
        201: { description: "Created (pending)", content: { "application/json": { schema: { $ref: "#/components/schemas/Appointment" } } } },
        400: { description: "Validation / missing fields", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" } } } } } },
      },
    },
    get: {
      tags: ["Appointments"],
      summary: "List appointments (paginated)",
      security: [{ cookieAuth: [] }],
      description:
        "**Role behaviour:** `admin` — all records + filters. `doctor` — own `doctorId`. `user` — own `userId`. Query: `facility`, `fromDate`, `toDate`, `doctorName`, `patientName`, `userName`, `status`, `mode`, `page`, `limit`.",
      parameters: [
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", default: 10, maximum: 100 } },
        { name: "status", in: "query", schema: { type: "string" } },
        { name: "mode", in: "query", schema: { type: "string" } },
        { name: "fromDate", in: "query", schema: { type: "string", format: "date" } },
        { name: "toDate", in: "query", schema: { type: "string", format: "date" } },
        { name: "facility", in: "query", schema: { type: "string", description: "Facility name substring (not 'All')" } },
        { name: "doctorName", in: "query", schema: { type: "string" } },
        { name: "patientName", in: "query", schema: { type: "string" } },
      ],
      responses: {
        200: { description: "Page of appointments", content: { "application/json": { schema: { $ref: "#/components/schemas/AppointmentListResponse" } } } },
      },
    },
  },

  "/api/appointments/booked-slots": {
    get: {
      tags: ["Appointments"],
      summary: "Booked time intervals for a day",
      description: "Public. Returns `pending` + `scheduled` appointments for the doctor at the facility on the given UTC calendar day.",
      parameters: [
        { name: "doctorId", in: "query", required: true, schema: { type: "string" } },
        { name: "facilityId", in: "query", required: true, schema: { type: "string" } },
        { name: "date", in: "query", required: true, schema: { type: "string", example: "2026-06-15" } },
      ],
      responses: {
        200: { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/BookedSlotsResponse" } } } },
        400: { description: "Bad query", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" } } } } } },
      },
    },
  },

  "/api/appointments/admin/summary": {
    get: {
      tags: ["Appointments"],
      summary: "Admin dashboard aggregates",
      security: [{ cookieAuth: [] }],
      description: "**Admin only.** Query `days`: one of 7, 30, 90 (default 30).",
      parameters: [{ name: "days", in: "query", schema: { type: "integer", enum: [7, 30, 90] } }],
      responses: {
        200: { description: "Summary", content: { "application/json": { schema: { $ref: "#/components/schemas/AdminSummary" } } } },
        403: { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      },
    },
  },

  "/api/appointments/{id}": {
    get: {
      tags: ["Appointments"],
      summary: "Get appointment by ID",
      security: [{ cookieAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        200: { description: "Appointment", content: { "application/json": { schema: { $ref: "#/components/schemas/Appointment" } } } },
        404: { description: "Not found", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" } } } } } },
      },
    },
    put: {
      tags: ["Appointments"],
      summary: "Update appointment",
      security: [{ cookieAuth: [] }],
      description:
        "Doctors may update their appointments; users may update own row but **not** `status`. Status transitions are validated (`pending`→`scheduled`|`rejected`, etc.). `scheduled` may trigger calendar sync.",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                status: { type: "string", enum: ["pending", "scheduled", "completed", "rejected", "cancelled"] },
                reason: { type: "string" },
                mode: { type: "string" },
                date: { type: "string" },
                timeSlot: { $ref: "#/components/schemas/TimeSlot" },
              },
            },
            example: { status: "scheduled" },
          },
        },
      },
      responses: {
        200: { description: "Updated document", content: { "application/json": { schema: { $ref: "#/components/schemas/Appointment" } } } },
        400: { description: "Invalid transition", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" } } } } } },
        403: { description: "Forbidden", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" } } } } } },
      },
    },
    delete: {
      tags: ["Appointments"],
      summary: "Delete appointment",
      security: [{ cookieAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: {
        200: { description: "Deleted", content: { "application/json": { example: { message: "Appointment deleted successfully" } } } },
        404: { description: "Not found", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" } } } } } },
      },
    },
  },
};

module.exports = {
  openapi: "3.0.3",
  info,
  tags,
  servers: [{ url: "http://localhost:3000", description: "Local API (adjust host/port for Docker / prod)" }],
  paths,
  components,
};
