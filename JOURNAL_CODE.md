# ReMarket – Important Code for Journal

This file contains the most important code sections suitable for a college practical journal, with brief explanations.

---

## 1. MongoDB Connection (`server/config/db.js`)

```javascript
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
```

**Explanation:** Connects the Express server to MongoDB using the connection string from environment variables. If connection fails, the server exits.

---

## 2. User Model (`server/models/User.js`)

```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
```

**Explanation:** Defines user schema with validation. Password is hashed using bcrypt before saving. `comparePassword` method is used during login.

---

## 3. Product Model (`server/models/Product.js`)

```javascript
const productSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 150 },
  description: { type: String, required: true, maxlength: 2000 },
  category: { type: String, required: true, enum: PRODUCT_CATEGORIES },
  price: { type: Number, required: true, min: 1 },
  condition: { type: String, required: true, enum: PRODUCT_CONDITIONS },
  images: [{ type: String }],
  location: { type: String, required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: PRODUCT_STATUS, default: 'Available' },
  views: { type: Number, default: 0 },
}, { timestamps: true });

productSchema.index({ title: 'text', description: 'text', brand: 'text' });
```

**Explanation:** Product schema with reference to seller (User). Text index enables search on title, description, and brand.

---

## 4. Register API (`server/controllers/authController.js`)

```javascript
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, confirmPassword, phone, city } = req.body;

  if (!name?.trim()) throw new AppError('Name is required', 400);
  if (!isValidEmail(email)) throw new AppError('Please provide a valid email', 400);
  validatePassword(password);
  if (password !== confirmPassword) throw new AppError('Passwords do not match', 400);

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) throw new AppError('Email already registered', 409);

  const user = await User.create({ name, email, password, phone, city });
  const token = generateToken(user._id);

  sendSuccess(res, 201, 'Registration successful', {
    user: formatUserResponse(user),
    token,
  });
});
```

**Explanation:** Validates input, checks duplicate email, creates user, generates JWT token, and returns user data.

---

## 5. Login API (`server/controllers/authController.js`)

```javascript
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('Your account has been blocked. Contact admin', 403);
  }

  const token = generateToken(user._id);

  sendSuccess(res, 200, 'Login successful', {
    user: formatUserResponse(user),
    token,
  });
});
```

**Explanation:** Finds user by email, compares password with bcrypt, checks if account is active, and returns JWT token.

---

## 6. JWT Auth Middleware (`server/middleware/auth.js`)

```javascript
export const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) throw new AppError('Not authorized. Please login', 401);

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select('-password');

  if (!user) throw new AppError('User not found. Please login again', 401);
  if (!user.isActive) throw new AppError('Your account has been blocked', 403);

  req.user = user;
  next();
});

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError('You do not have permission', 403);
    }
    next();
  };
};
```

**Explanation:** `protect` verifies JWT and attaches user to request. `authorize` checks user role for admin-only routes.

---

## 7. Product CRUD – Create (`server/controllers/productController.js`)

```javascript
export const createProduct = asyncHandler(async (req, res) => {
  const validated = validateProductFields(req.body, true, req.files);
  const images = req.files.map((file) => file.filename);

  const product = await Product.create({
    ...validated,
    images,
    seller: req.user._id,
    status: 'Available',
  });

  sendSuccess(res, 201, 'Product created successfully', {
    product: formatProduct(product),
  });
});
```

**Explanation:** Validates fields, saves uploaded image filenames from Multer, creates product linked to logged-in seller.

---

## 8. Purchase Request API (`server/controllers/requestController.js`)

```javascript
export const createRequest = asyncHandler(async (req, res) => {
  const { productId, message, offeredPrice } = req.body;

  const product = await Product.findById(productId);
  if (!product) throw new AppError('Product not found', 404);
  if (product.seller.toString() === req.user._id.toString()) {
    throw new AppError('Cannot request your own product', 400);
  }

  const request = await PurchaseRequest.create({
    product: productId,
    buyer: req.user._id,
    seller: product.seller,
    message: message.trim(),
    status: 'Pending',
  });

  await createNotification({
    recipient: product.seller,
    message: `${req.user.name} sent a purchase request for "${product.title}"`,
    type: 'request_received',
    relatedProduct: product._id,
    relatedRequest: request._id,
  });

  sendSuccess(res, 201, 'Purchase request sent successfully', { request });
});
```

**Explanation:** Buyer sends request for a product. Seller is notified automatically. Prevents self-requests and duplicate pending requests.

---

## 9. React API Service (`client/src/services/api.js`)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.data instanceof FormData) delete config.headers['Content-Type'];
  return config;
});

export default api;
```

**Explanation:** Centralized Axios instance. Automatically attaches JWT token to requests. Handles FormData for image uploads.

---

## 10. React Routing (`client/src/App.jsx`)

```javascript
<Route element={<MainLayout />}>
  <Route path="/" element={<Home />} />
  <Route path="/products" element={<Products />} />
  <Route path="/products/:id" element={<ProductDetails />} />
  <Route path="/login" element={<Login />} />
  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
  <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
    <Route index element={<AdminDashboardHome />} />
    <Route path="users" element={<AdminUsers />} />
  </Route>
</Route>
```

**Explanation:** React Router defines all pages. `ProtectedRoute` requires login. `AdminRoute` requires admin role.

---

## 11. Auth Context (`client/src/context/AuthContext.jsx`)

```javascript
const loginUser = async (credentials) => {
  const { data } = await authService.login(credentials);
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  setUser(data.user);
  return data;
};

const isAuthenticated = !!user;
const isAdmin = user?.role === 'admin';
```

**Explanation:** Manages global auth state. Stores JWT in localStorage for persistent login across page refreshes.
