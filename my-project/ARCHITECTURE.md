# Pet Adoption Platform – Architecture & Overview

## 1. Purpose
A full‑stack web platform for discovering adoptable pets, submitting new pets for moderation, managing a product cart, donating, and basic vet appointment demo. Admins moderate and edit published pets.

## 2. Core Functional Domains
| Domain | Key Actions | Storage |
|--------|-------------|---------|
| Authentication | Register, Login (JWT cookie) | users |
| Pet Catalog | Browse approved pets | pets (review_status='approved') |
| Submission Workflow | User submits → pending_pets → admin approves/rejects | pending_pets, pets |
| Admin Moderation | Approve/reject, edit published pets | pending_pets, pets |
| Notifications | New submission, approval/rejection | notifications |
| Cart & Checkout | Add items, view totals, mock payment | (client state / optional tables) |
| Donation | Amount + method UI | (client state) |
| Vet Appointments | Book ephemeral slot | (client state) |
| Theming | Light/Dark CSS vars | n/a |

## 3. Technology Stack
- Frontend: React + Vite, Fetch API, component-level CSS using CSS variables.
- Backend: Node.js (Express), MySQL/MariaDB, JSON Web Tokens, bcrypt, Multer (file upload).
- Auth: JWT in HTTP-only cookie (safer vs localStorage) + role flag (is_admin).

## 4. High-Level Architecture
```
Browser (React SPA) --fetch/JSON--> Express API --SQL--> MySQL
          | (multipart upload)          |                
          +---------- file system (uploaded images) -----+
```
Static pet images served from Express `/uploads`.

## 5. Data Model (Essential Columns)
users(id, username, email, password_hash, is_admin)
pets(id, name, animalType, breed, age, status, description, image, location, review_status, submitted_by)
pending_pets(similar to pets sans review_status)
notifications(id, user_id, type, message, is_read, created_at)

## 6. Request / Lifecycle Flows
### Pet Submission (Non-Admin)
1. User fills AddPetForm (FormData with image).
2. Backend stores image → record in pending_pets (submitted_by=user.id).
3. Notifications inserted for admins.
4. Response → front-end shows pending message.

### Approval
1. Admin panel lists pending via `/api/admin/pending-pets`.
2. Approve: move row to pets (review_status='approved'), notify submitter.
3. Reject: delete pending row, notify submitter.
4. Public list (`/api/pets`) only selects approved.

### Editing Published Pets
Admin updates core fields (including `location`) with PUT `/api/admin/pets/:id`.

## 7. Authentication & Authorization
- Login issues JWT (payload: user id, is_admin) stored in HTTP-only cookie.
- Middleware `auth.cjs` verifies token, attaches `req.user`.
- `isAdmin.cjs` guards admin endpoints.

## 8. Notifications
- Inserted on: new pending submission, approval, rejection.
- Fetched via dedicated endpoint; unread count shown in UI.
- Extensible to WebSockets later.

## 9. Frontend Feature Highlights
- Filterable pet list (client-side searching, type filtering, simple sorting).
- Dark / light theme toggle via root class + CSS variables.
- Cart UI with total calculations and mock payment step (Cash, Card, bKash, Nagad).
- Donation page reuses payment method UI concept.
- Vet list: static dataset + ephemeral appointment booking (in-memory state only).

## 10. File Upload Handling
- Saved under `backend/public/uploads`.
- Served statically; database stores relative file path.

## 11. Security Posture
Implemented: hashed passwords (bcrypt), role-based gate, HTTP-only cookie.
Needed (future): validation (Joi/Zod), CSRF token, rate limiting, MIME/type restrictions, audit logging, secure cookie flags in production.

## 12. Performance & Scaling Opportunities
- Move filtering & pagination server-side (SQL + indexes: animalType, status).
- Add CDN / caching headers for static images.
- Compress & optimize images (Sharp/WebP).
- Batch notification queries.

## 13. Deployment Outline
1. `npm run build` (Vite → `dist/`).
2. Serve dist via Express or Nginx (reverse proxy TLS).
3. Run Node API with PM2/systemd.
4. Set environment vars (.env not committed; use .env.example template).
5. Enable HTTPS, secure cookies, proper CORS.

## 14. Future Enhancements
- Real payment integration (Stripe / SSLCommerz / bKash API).
- Real-time notifications (WebSockets / SSE).
- Adoption application workflow & messaging.
- Multi-image gallery + vet health records.
- Email (approval, password reset) & admin audit logs.
- Comprehensive server-side validation & unit tests.

## 15. 30s Oral Summary
A React + Express + MySQL pet adoption platform: users browse approved pets, submit new ones that enter a moderation queue; admins approve/reject and edit published entries. JWT auth (HTTP-only cookie) secures routes, notifications inform admins and submitters, and auxiliary modules (cart, donation, vet booking, dark mode) enrich UX. Images are uploaded to disk; future work targets validation, real-time updates, and production-grade security.

---
Generated on: 2025-09-04
