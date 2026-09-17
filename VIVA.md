# ReMarket – Viva Preparation (25+ Questions & Answers)

---

### 1. What is MERN stack?
**Answer:** MERN stands for MongoDB, Express.js, React, and Node.js. It is a full-stack JavaScript technology used to build web applications where MongoDB is the database, Express is the backend framework, React is the frontend library, and Node.js is the runtime environment.

---

### 2. Why did you choose React for the frontend?
**Answer:** React is a popular JavaScript library for building user interfaces. It uses a component-based architecture, supports fast rendering with Virtual DOM, has a large ecosystem, and works well with REST APIs through libraries like Axios.

---

### 3. Why Node.js for the backend?
**Answer:** Node.js allows us to use JavaScript on the server side, enabling a single language across the full stack. It is non-blocking, event-driven, and well-suited for REST APIs with high I/O operations.

---

### 4. Why Express.js?
**Answer:** Express is a minimal and flexible Node.js web framework. It simplifies routing, middleware handling, and HTTP request/response management, making it ideal for building REST APIs.

---

### 5. Why MongoDB?
**Answer:** MongoDB is a NoSQL document database that stores data in flexible JSON-like documents (BSON). It is suitable for marketplace applications where product data structures may vary. It integrates easily with Node.js through Mongoose.

---

### 6. What is Mongoose?
**Answer:** Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js. It provides schema definition, validation, middleware (hooks), and query building on top of MongoDB.

---

### 7. What is REST API?
**Answer:** REST (Representational State Transfer) is an architectural style for designing networked applications. It uses HTTP methods (GET, POST, PUT, PATCH, DELETE) to perform CRUD operations on resources identified by URLs.

---

### 8. What is CRUD?
**Answer:** CRUD stands for Create, Read, Update, and Delete — the four basic operations for managing data. In ReMarket: Create product (POST), Read products (GET), Update product (PUT), Delete product (DELETE).

---

### 9. What is JWT?
**Answer:** JWT (JSON Web Token) is a compact, URL-safe token format used for authentication. After login, the server generates a JWT containing the user ID. The client sends this token in the Authorization header for protected API requests.

---

### 10. Why use bcrypt for passwords?
**Answer:** bcrypt is a password hashing algorithm that converts plain-text passwords into irreversible hashes. Even if the database is compromised, actual passwords cannot be recovered. We use 12 salt rounds for security.

---

### 11. What is middleware in Express?
**Answer:** Middleware is a function that runs between receiving a request and sending a response. Examples in ReMarket: `protect` (auth check), `productImageUpload` (Multer), `errorHandler` (global error handling).

---

### 12. What is CORS?
**Answer:** CORS (Cross-Origin Resource Sharing) is a security mechanism that controls which domains can access your API. We configure CORS in Express to allow requests from the React frontend at `http://localhost:5173`.

---

### 13. How does the frontend communicate with the backend?
**Answer:** The React frontend uses Axios to send HTTP requests to Express REST APIs. During development, Vite proxies `/api` requests to `http://localhost:5000`. The backend processes requests, interacts with MongoDB via Mongoose, and returns JSON responses.

---

### 14. How does MongoDB store data?
**Answer:** MongoDB stores data as documents in collections. Each document is a BSON object (similar to JSON). For example, a product document contains fields like title, price, seller ID, and an array of image filenames.

---

### 15. Explain the Product schema.
**Answer:** The Product model has fields: title, description, category, subcategory, price, condition, brand, images (array), location, seller (User reference), status (Available/Pending/Sold/Rejected), and views. It has text indexes for search and compound indexes for filtering.

---

### 16. How does user authentication work in your project?
**Answer:** User registers with email/password → password is hashed with bcrypt → on login, credentials are verified → server generates JWT → client stores token in localStorage → Axios interceptor sends token with each request → `protect` middleware verifies token and attaches user to `req.user`.

---

### 17. What is authorization? How is it different from authentication?
**Answer:** Authentication verifies *who* the user is (login). Authorization determines *what* the user can do (permissions). In ReMarket, `authorize('admin')` middleware ensures only admin users can access `/api/admin/*` routes.

---

### 18. Explain the purchase request workflow.
**Answer:** Buyer sends request (Pending) → Seller views in Received Requests → Seller accepts (Accepted, product becomes Pending) or rejects (Rejected) → On acceptance, seller marks complete (Completed, product becomes Sold). Notifications are sent at each step.

---

### 19. What HTTP status codes does your API use?
**Answer:** 200 (success), 201 (created), 400 (validation error), 401 (not authenticated), 403 (forbidden/no permission), 404 (not found), 409 (conflict/duplicate), 500 (server error).

---

### 20. How is validation implemented?
**Answer:** Validation is done on both frontend (form validation, required fields) and backend (controller validation + Mongoose schema validation). Backend validation is mandatory because frontend validation can be bypassed.

---

### 21. How is error handling done?
**Answer:** We use a centralized `errorHandler` middleware that catches all errors and returns consistent JSON: `{ success: false, message: "..." }`. Custom `AppError` class is used for operational errors with specific status codes.

---

### 22. What is role-based access control?
**Answer:** Different user roles have different permissions. ReMarket has `user` and `admin` roles. Admin can manage users, products, and categories. Regular users can buy and sell. Role is checked in both frontend routes (`AdminRoute`) and backend middleware (`authorize`).

---

### 23. How does image upload work?
**Answer:** Multer middleware handles multipart form data. Images are saved to `server/uploads/products/` or `server/uploads/profiles/`. Filenames are stored in MongoDB. Express serves uploads statically at `/uploads/`. Frontend uses FormData for upload requests.

---

### 24. How does search work in your project?
**Answer:** Product search uses MongoDB regex queries on title, description, brand, category, and location fields. Filters (category, condition, location, price range) are applied on the backend. Sorting and pagination are also server-side.

---

### 25. What is the wishlist feature?
**Answer:** Users can save products to their wishlist. Wishlist is stored as an array of Product ObjectIds in the User document. APIs: GET /wishlist, POST /wishlist/:productId, DELETE /wishlist/:productId.

---

### 26. What is the notification system?
**Answer:** In-app notifications are created when purchase requests are sent, accepted, rejected, cancelled, or completed, and when admin takes action. Each notification has a recipient, message, type, read status, and optional related product/request references.

---

### 27. What makes your project different from a simple CRUD app?
**Answer:** ReMarket includes a complete purchase request workflow with status transitions, automatic notifications, role-based admin panel, search/filter/pagination, wishlist, image upload, and dashboard statistics — not just basic CRUD.

---

### 28. What are the limitations of your project?
**Answer:** No payment integration, no real-time chat, images stored locally (not cloud), no email notifications, single-server deployment, and no automated testing framework (Jest/Mocha).

---

### 29. What is the future scope?
**Answer:** Payment gateway, real-time chat (Socket.io), cloud deployment (Render/Vercel/Atlas), product reviews, email notifications, mobile app, and AI-based price recommendations.

---

### 30. How do you seed demo data?
**Answer:** We run `npm run seed` which executes `server/utils/seed.js`. It clears existing collections and inserts demo users, categories, products, purchase requests, and notifications for testing and demonstration.
