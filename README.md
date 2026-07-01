# Function Hall Booking System

A full-stack web application for managing function hall bookings, billing, and marriage certificate issuance. Built for **Sri Lakshmi Srungara Vallabha Function Hall** (branded as **LuxeHalls**), this admin dashboard helps staff track reservations, payments, and official certificates in one place.

---

## Project Status

**Completed** — Core modules are implemented and connected to Firebase (Authentication + Firestore).

| Module | Status | Description |
|--------|--------|-------------|
| Authentication | Done | Email/password sign up and login |
| Dashboard | Done | Booking stats, revenue summary, recent bookings table |
| Booking Hall | Done | Create, edit, view, delete, and import bookings |
| Billing | Done | Payment records linked to bookings with import support |
| Certificate Issuance | Done | Marriage certificates with print, view, edit, and import |
| Data Tables | Done | Search, filters, pagination, date range, Excel export |

---

## Features

### Authentication
- User registration and login via Firebase Auth
- Protected routes — dashboard pages require login
- Session stored in `localStorage`
- Logout from sidebar

### Dashboard
- Overview cards: total bookings, total revenue, advance collected, pending balance
- Full bookings table with customer, hall, date, and amount
- Real-time stats calculated from Firestore booking data

### Booking Hall Management
- Add and manage hall bookings with:
  - Function type, hall type (Mini / Big Function Hall)
  - Customer details (name, email, phone, address)
  - Booking date, function date, and function time
  - Guest count, total amount, advance, and auto-calculated balance
  - Status: In Progress, Paid, Completed
- Prevent double booking for the same hall on the same date
- Mark bookings as paid
- Import records from CSV / Excel
- View, edit, and delete bookings

### Billing
- Create billing entries linked to existing bookings
- Track payment amount, date, and status (Pending / Paid)
- Auto-resolve booking name from linked booking
- Import records from CSV / Excel
- Full CRUD operations

### Certificate Issuance
- Issue marriage certificates with:
  - Auto-generated receipt number
  - Bridegroom and bride details (including S/O and D/O)
  - Booking date, function date, and function time
  - Requestor name
- **12-hour time format (AM/PM)** on printed and preview certificates
- Print-ready certificate layout with official formatting
- Import records from CSV / Excel
- View, edit, delete, and print certificates

### Shared UI Components
- Responsive sidebar navigation
- Reusable modal forms
- Advanced data table with:
  - Global search
  - Column filters
  - Date range filter
  - Pagination
  - Export to Excel

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, React Router 7 |
| Build Tool | Vite 8 |
| Backend / Database | Firebase Firestore |
| Authentication | Firebase Auth |
| Icons | Lucide React |
| Excel Import/Export | SheetJS (xlsx) |
| Styling | Custom CSS |

---

## Project Structure

```
Function-hall-Booking/
├── public/
│   └── icons.svg
├── src/
│   ├── assets/              # Logo and static assets
│   ├── components/
│   │   ├── DashboardLayout.jsx
│   │   ├── DataTable.jsx    # Search, filter, pagination, export
│   │   ├── HallCard.jsx
│   │   ├── Modal.jsx
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   └── TopNavbar.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── SignUp.jsx
│   │   ├── Dashboard.jsx
│   │   ├── BookingHall.jsx
│   │   ├── Billing.jsx
│   │   └── Certificate.jsx
│   ├── api.js               # Firebase API layer
│   ├── firebase.js          # Firebase configuration
│   ├── App.jsx              # Routes and auth guard
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
└── package.json
```

---

## Firebase Collections

| Collection | Purpose |
|------------|---------|
| `users` | Registered admin/user profiles |
| `bookings` | Hall booking records |
| `billings` | Payment and billing records |
| `certificates` | Marriage certificate records |
| `halls` | Hall catalog (auto-seeded with sample data if empty) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm
- Firebase project with Authentication and Firestore enabled

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Function-hall-Booking

# Install dependencies
npm install

# Start development server
npm run dev
```

The app runs at **http://localhost:5190/** (configured in `vite.config.js`).

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 5190 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## Routes

| Path | Access | Page |
|------|--------|------|
| `/login` | Public | Login |
| `/signup` | Public | Sign up |
| `/dashboard` | Protected | Dashboard overview |
| `/bookings` | Protected | Booking Hall management |
| `/billing` | Protected | Billing management |
| `/certificate` | Protected | Certificate issuance |

---

## Configuration

Firebase settings are in `src/firebase.js`. Update the config if you use your own Firebase project:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
  measurementId: "..."
};
```

Enable **Email/Password** sign-in in the Firebase Console under Authentication.

---

## Data Import Format

Bookings, billings, and certificates support bulk import via CSV or Excel. Column headers are mapped automatically (spaces become underscores, e.g. `Receipt No` → `receipt_no`).

---

## Build for Production

```bash
npm run build
```

Output is generated in the `dist/` folder. Deploy to Firebase Hosting, Vercel, Netlify, or any static hosting provider.

---

## License

Private project — all rights reserved.
