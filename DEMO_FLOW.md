# ReMarket – Demonstration Flow (5–10 Minutes)

Use this sequence for your college practical viva or project presentation.

---

## Preparation

1. Start MongoDB: `Start-Service MongoDB` (Windows Admin)
2. Seed data: `cd server && npm run seed`
3. Start backend: `npm run dev` (port 5000)
4. Start frontend: `cd client && npm run dev` (port 5173)
5. Open http://localhost:5173 in browser

**Demo logins (DEVELOPMENT ONLY):**
| Role   | Email                  | Password  |
|--------|------------------------|-----------|
| Admin  | admin@remarket.demo    | Demo@123  |
| Seller | rahul@remarket.demo    | Demo@123  |
| Buyer  | amit@remarket.demo     | Demo@123  |

---

## Step-by-Step Demo (~8 minutes)

### 1. Home Page (30 sec)
- Open the landing page
- Point out hero, categories, featured products, and how-it-works
- Click **Browse Products**

### 2. Browse & Search (1 min)
- Show product grid with cards
- Use search bar (e.g., "Sony" or "iPhone")
- Open filters — set category, condition, or location
- Change sort to "Price: Low to High"
- Click a product to open details

### 3. Product Details (30 sec)
- Show image, price, description, seller info, views
- Point out **Add to Wishlist** and **Send Purchase Request** (requires login)

### 4. Register / Login (1 min)
- Click **Login** → use buyer account: `amit@remarket.demo` / `Demo@123`
- Mention JWT-based authentication and protected routes

### 5. Buyer Actions (1.5 min)
- Add product to **Wishlist** (heart icon)
- Open **Wishlist** page from navbar
- Return to a product → click **Send Purchase Request**
- Fill message and optional offered price → submit
- Show success toast

### 6. Seller Flow (2 min)
- **Logout** → login as `rahul@remarket.demo` / `Demo@123`
- Open **Received Requests** from dashboard or navbar
- Show pending request from buyer
- Click **Accept** → explain product status changes to Pending
- Show **Notifications** bell with new unread count

### 7. User Dashboard (1 min)
- Open **Dashboard** — show stat cards (listings, wishlist, requests)
- Open **My Listings** — show seller's products
- Click **Sell Product** — briefly show the form (don't need to submit)

### 8. Admin Dashboard (1.5 min)
- **Logout** → login as `admin@remarket.demo` / `Demo@123`
- Navigate to **Admin** (/admin)
- Show dashboard statistics
- Open **Users** — demonstrate block/unblock
- Open **Products** — show product management
- Open **Categories** — show category list

### 9. MongoDB Proof (30 sec)
- Open MongoDB Compass or run `mongosh`
- Show `remarket` database collections with real data
- Open a `products` or `users` document

### 10. Closing (30 sec)
- Summarize: MERN stack, JWT auth, CRUD, search, requests, notifications, admin
- Mention future scope: payments, chat, cloud hosting

---

## Quick Troubleshooting

| Issue                    | Fix                                      |
|--------------------------|------------------------------------------|
| Blank products page      | Run `npm run seed` in server folder      |
| Login fails              | Re-seed database, check MongoDB running    |
| Images not loading       | Ensure backend is running on port 5000     |
| 401 errors               | Clear browser localStorage, login again  |

---

## Viva Talking Points

- "Frontend is React with Vite; backend is Express REST API"
- "MongoDB stores users, products, requests, and notifications"
- "JWT token is sent in Authorization header for protected routes"
- "Purchase request workflow: Pending → Accepted → Completed"
- "Admin role is enforced on both frontend routes and backend middleware"
