# Practical No. 10 – MERN Stack Project Journal

---

## 1. Practical No.
**Practical No. 10** – MERN Stack Web Application Development

---

## 2. Project Title
**ReMarket – Used Products Buying & Selling System**

---

## 3. Aim
To design and develop a full-stack web application using the MERN stack (MongoDB, Express.js, React, Node.js) that enables users to buy and sell used products through an online marketplace with authentication, product management, purchase requests, and admin controls.

---

## 4. Brief Description
ReMarket is a web-based marketplace where users can list used products for sale and other users can browse, search, filter, and send purchase requests. The system supports buyers, sellers (same user account), and administrators. It includes JWT authentication, image upload, wishlist, notifications, and a complete purchase request workflow.

---

## 5. Objectives
1. Build a responsive React frontend using Vite and Tailwind CSS
2. Create RESTful APIs using Node.js and Express.js
3. Store data in MongoDB using Mongoose ODM
4. Implement secure user authentication with JWT and bcrypt
5. Develop product CRUD with image upload
6. Implement search, filter, sort, and pagination
7. Build purchase request workflow with notifications
8. Create user dashboard and admin management panel
9. Handle errors, loading states, and form validation
10. Prepare project for demonstration and journal submission

---

## 6. Technologies Used

| Technology    | Purpose                              |
|---------------|--------------------------------------|
| React         | Frontend UI                          |
| Vite          | Build tool and dev server            |
| Tailwind CSS  | Styling and responsive design        |
| Axios         | HTTP client for API calls            |
| React Router  | Client-side routing                  |
| Node.js       | Backend runtime                      |
| Express.js    | Web framework and REST API           |
| MongoDB       | NoSQL database                       |
| Mongoose      | MongoDB object modeling              |
| JWT           | Authentication tokens                |
| bcryptjs      | Password hashing                     |
| Multer        | File/image upload handling           |
| Lucide React  | Icon library                         |

---

## 7. Hardware/Software Requirements

**Hardware:**
- Processor: Intel i3 or above
- RAM: 4 GB minimum (8 GB recommended)
- Storage: 2 GB free space

**Software:**
- Windows 10/11 or Linux/macOS
- Node.js v18+
- MongoDB Community Server or MongoDB Atlas
- VS Code or any code editor
- Modern web browser (Chrome/Firefox/Edge)

---

## 8. System Architecture

The application follows a three-tier architecture:

1. **Presentation Layer (React)** – User interface, forms, routing
2. **Application Layer (Express)** – REST APIs, business logic, authentication
3. **Data Layer (MongoDB)** – Persistent storage for users, products, requests

Communication flow: React → Axios → Express API → Mongoose → MongoDB

---

## 9. Project Structure

```
ReMarket/
├── client/          → React frontend
│   └── src/
│       ├── components/   → UI components
│       ├── pages/        → Route pages
│       ├── services/     → API calls
│       ├── context/      → Auth & Toast state
│       └── hooks/        → Custom hooks
└── server/          → Express backend
    ├── controllers/  → Request handlers
    ├── models/       → Mongoose schemas
    ├── routes/       → API endpoints
    ├── middleware/   → Auth, upload, errors
    └── services/     → Business logic
```

---

## 10. Database Design

### Collections

**users**
- name, email, password (hashed), phone, city, profileImage, role, wishlist[], isActive

**products**
- title, description, category, subcategory, price, condition, brand, images[], location, seller (ref), status, views

**purchaserequests**
- product (ref), buyer (ref), seller (ref), message, offeredPrice, status

**notifications**
- recipient (ref), message, type, relatedProduct (ref), relatedRequest (ref), read

**categories**
- name, subcategories[], isActive

---

## 11. Main Collections
Users, Products, PurchaseRequests, Notifications, Categories

---

## 12. Core Logic

### Purchase Request Workflow
1. Buyer sends request → status: **Pending**
2. Seller accepts → status: **Accepted**, product status: **Pending**
3. Seller completes → status: **Completed**, product status: **Sold**
4. Seller rejects → status: **Rejected**, product remains **Available**
5. Buyer cancels → status: **Cancelled**

Notifications are automatically created at each step.

---

## 13. CRUD Operations

| Entity   | Create | Read | Update | Delete |
|----------|--------|------|--------|--------|
| User     | Register | Profile, /me | Profile, password | — |
| Product  | POST /products | GET /products, /:id | PUT /products/:id | DELETE /products/:id |
| Request  | POST /requests | GET sent/received | PATCH accept/reject/cancel/complete | — |
| Wishlist | POST /wishlist/:id | GET /wishlist | — | DELETE /wishlist/:id |
| Category | POST /admin/categories | GET /admin/categories | PUT /admin/categories/:id | DELETE (deactivate) |

---

## 14. Authentication Logic

1. User registers → password hashed with bcrypt (12 rounds)
2. User logs in → credentials verified → JWT token generated
3. Token stored in browser localStorage
4. Axios interceptor attaches `Authorization: Bearer <token>` to every request
5. Backend `protect` middleware verifies token and loads user
6. `authorize('admin')` middleware restricts admin routes

---

## 15. API Integration

Frontend services in `client/src/services/` call Express REST APIs:

- `authService.js` → `/api/auth/*`
- `productService.js` → `/api/products/*`
- `requestService.js` → `/api/requests/*`
- `wishlistService.js` → `/api/wishlist/*`
- `notificationService.js` → `/api/notifications/*`
- `userService.js` → `/api/users/*`
- `adminService.js` → `/api/admin/*`

Vite dev server proxies `/api` to `http://localhost:5000`.

---

## 16. Important Code Explanation

See **JOURNAL_CODE.md** for annotated code sections including:
- MongoDB connection
- User and Product models
- Register/Login APIs
- JWT middleware
- Product CRUD
- Purchase request API
- React API service and routing

---

## 17. Testing

| Test                    | Result |
|-------------------------|--------|
| User registration       | ✅ Pass |
| User login/logout       | ✅ Pass |
| Product browse/search   | ✅ Pass |
| Product create/edit     | ✅ Pass |
| Image upload            | ✅ Pass |
| Wishlist add/remove     | ✅ Pass |
| Purchase request flow   | ✅ Pass |
| Notifications           | ✅ Pass |
| Admin dashboard         | ✅ Pass |
| Role authorization      | ✅ Pass |
| Responsive design       | ✅ Pass |
| API integration tests   | ✅ Pass (`npm run test:api`) |
| Production build        | ✅ Pass (`npm run build`) |

---

## 18. Expected Output

- A working marketplace website at http://localhost:5173
- Users can register, login, list products, browse, search, and send purchase requests
- Sellers can accept/reject requests and manage listings
- Admin can view statistics and manage users/products/categories
- MongoDB stores all data persistently
- API returns consistent JSON responses with proper status codes

---

## 19. Screenshots

*(Insert screenshots here — see SCREENSHOTS.md for checklist)*

1. Home Page
2. Registration / Login
3. Products with Search/Filter
4. Product Details
5. Sell Product Form
6. User Dashboard
7. Purchase Requests
8. Wishlist & Notifications
9. Admin Dashboard
10. MongoDB Collections
11. VS Code Project Structure

---

## 20. Conclusion

ReMarket successfully demonstrates a complete MERN stack application with real database integration, authentication, CRUD operations, search functionality, a purchase request workflow, and admin management. The project covers all requirements of Practical No. 10 including frontend-backend communication, validation, error handling, and responsive design. The modular code structure makes it easy to extend with features like payment integration and real-time chat in the future.

---

## 21. Future Scope

1. Payment gateway integration (Razorpay/UPI)
2. Real-time chat between buyer and seller (Socket.io)
3. Cloud image hosting (Cloudinary/AWS S3)
4. Email and SMS notifications
5. Product reviews and seller ratings
6. Deployment on cloud (Render, Vercel, MongoDB Atlas)
7. Mobile app using React Native
8. AI-based product price suggestions
