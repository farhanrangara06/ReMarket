/**
 * ReMarket API Integration Test Script
 * Uses cookie-based auth (Production Phase 2)
 * Run with server + MongoDB running: npm run test:api
 */
import dotenv from 'dotenv';

dotenv.config();

const BASE = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}/api`;
const DEMO_PASSWORD = 'Demo@123';

const results = { passed: 0, failed: 0, errors: [] };

const log = (status, name, detail = '') => {
  const icon = status === 'pass' ? '✓' : '✗';
  console.log(`  ${icon} ${name}${detail ? ` — ${detail}` : ''}`);
  if (status === 'pass') results.passed++;
  else {
    results.failed++;
    results.errors.push({ name, detail });
  }
};

const createSession = () => {
  const jar = {};

  const storeCookies = (res) => {
    if (typeof res.headers.getSetCookie === 'function') {
      for (const cookie of res.headers.getSetCookie()) {
        const [pair] = cookie.split(';');
        const eq = pair.indexOf('=');
        jar[pair.slice(0, eq).trim()] = pair.slice(eq + 1).trim();
      }
    }
  };

  const request = async (method, path, { body } = {}) => {
    const headers = {};
    if (body) headers['Content-Type'] = 'application/json';
    const cookieStr = Object.entries(jar).map(([k, v]) => `${k}=${v}`).join('; ');
    if (cookieStr) headers.Cookie = cookieStr;

    const res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    storeCookies(res);
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  };

  const login = async (email) => {
    const { status, data } = await request('POST', '/auth/login', {
      body: { email, password: DEMO_PASSWORD },
    });
    if (status !== 200 || !data.data?.user) {
      throw new Error(`Login failed for ${email}: ${data.message || status}`);
    }
    return data.data;
  };

  return { request, login };
};

const runTests = async () => {
  console.log('\n========================================');
  console.log('  ReMarket API Integration Tests');
  console.log(`  Target: ${BASE}`);
  console.log('  Auth: httpOnly cookies');
  console.log('========================================\n');

  try {
    const healthRes = await fetch(`${BASE}/health`);
    const health = await healthRes.json();
    log(healthRes.ok && health.database === 'connected' ? 'pass' : 'fail', 'Health check', `DB: ${health.database}`);
    if (health.database !== 'connected') {
      console.log('\n  MongoDB is not connected. Start MongoDB and run: npm run seed\n');
      process.exit(1);
    }
  } catch (err) {
    log('fail', 'Health check', `Server not reachable — ${err.message}`);
    process.exit(1);
  }

  const admin = createSession();
  const buyer = createSession();
  const seller = createSession();
  let productId;

  try {
    const adminUser = await admin.login('admin@remarket.demo');
    log('pass', 'Admin login (cookies)', adminUser.user.email);
  } catch (err) {
    log('fail', 'Admin login', err.message);
    console.log('\n  Run seed first: npm run seed\n');
    process.exit(1);
  }

  try {
    const buyerUser = await buyer.login('amit@remarket.demo');
    log('pass', 'Buyer login (cookies)', buyerUser.user.email);
  } catch (err) {
    log('fail', 'Buyer login', err.message);
  }

  try {
    const sellerUser = await seller.login('rahul@remarket.demo');
    log('pass', 'Seller login (cookies)', sellerUser.user.email);
  } catch (err) {
    log('fail', 'Seller login', err.message);
  }

  {
    const { status, data } = await buyer.request('GET', '/auth/me');
    log(status === 200 && data.data?.user ? 'pass' : 'fail', 'GET /auth/me (cookie auth)');
  }

  {
    const { status, data } = await buyer.request('POST', '/auth/refresh');
    log(status === 200 && data.data?.user ? 'pass' : 'fail', 'POST /auth/refresh (token rotation)');
  }

  {
    const { status, data } = await buyer.request('GET', '/products?limit=5&sort=newest');
    const hasProducts = Array.isArray(data.data) && data.data.length > 0;
    log(status === 200 && hasProducts ? 'pass' : 'fail', 'GET /products', `${data.data?.length || 0} products`);
    if (hasProducts) productId = data.data[0]._id;
  }

  {
    const { status } = await buyer.request('GET', '/products?search=Sony&category=Electronics');
    log(status === 200 ? 'pass' : 'fail', 'GET /products (search + filter)');
  }

  if (productId) {
    const { status, data } = await buyer.request('GET', `/products/${productId}`);
    log(status === 200 && data.data?.product ? 'pass' : 'fail', 'GET /products/:id');
  }

  if (productId) {
    const { status: addStatus } = await buyer.request('POST', `/wishlist/${productId}`);
    log(addStatus === 200 || addStatus === 409 ? 'pass' : 'fail', 'POST /wishlist/:productId');

    const { status, data } = await buyer.request('GET', '/wishlist');
    log(status === 200 && data.data?.products ? 'pass' : 'fail', 'GET /wishlist');
  }

  {
    const { status, data } = await seller.request('GET', '/users/dashboard');
    log(status === 200 && data.data?.stats ? 'pass' : 'fail', 'GET /users/dashboard');
  }

  {
    const { status, data } = await seller.request('GET', '/products/mine');
    log(status === 200 && Array.isArray(data.data) ? 'pass' : 'fail', 'GET /products/mine');
  }

  if (productId) {
    const { status, data } = await buyer.request('POST', '/requests', {
      body: { productId, message: 'API test request — please ignore' },
    });
    if (status === 201) log('pass', 'POST /requests');
    else if (status === 409) log('pass', 'POST /requests', 'duplicate prevented (409)');
    else log('fail', 'POST /requests', data.message);

    const { status: sentStatus } = await buyer.request('GET', '/requests/sent');
    log(sentStatus === 200 ? 'pass' : 'fail', 'GET /requests/sent');

    const { status: recvStatus } = await seller.request('GET', '/requests/received');
    log(recvStatus === 200 ? 'pass' : 'fail', 'GET /requests/received');
  }

  {
    const { status, data } = await seller.request('GET', '/notifications');
    log(status === 200 && Array.isArray(data.data) ? 'pass' : 'fail', 'GET /notifications');

    const { status: countStatus, data: countData } = await seller.request('GET', '/notifications/unread-count');
    log(countStatus === 200 && countData.data?.unreadCount !== undefined ? 'pass' : 'fail', 'GET /notifications/unread-count');
  }

  {
    const { status, data } = await admin.request('GET', '/admin/dashboard');
    log(status === 200 && data.data?.stats ? 'pass' : 'fail', 'GET /admin/dashboard');

    const { status: usersStatus } = await admin.request('GET', '/admin/users');
    log(usersStatus === 200 ? 'pass' : 'fail', 'GET /admin/users');

    const { status: productsStatus } = await admin.request('GET', '/admin/products');
    log(productsStatus === 200 ? 'pass' : 'fail', 'GET /admin/products');

    const { status: catStatus } = await admin.request('GET', '/admin/categories');
    log(catStatus === 200 ? 'pass' : 'fail', 'GET /admin/categories');
  }

  {
    const { status } = await buyer.request('GET', '/admin/dashboard');
    log(status === 403 ? 'pass' : 'fail', 'Admin route blocks non-admin', `status ${status}`);
  }

  {
    const { status } = await buyer.request('POST', '/auth/logout');
    log(status === 200 ? 'pass' : 'fail', 'POST /auth/logout (clears cookies)');

    const { status: meStatus } = await buyer.request('GET', '/auth/me');
    log(meStatus === 401 ? 'pass' : 'fail', 'Session invalidated after logout', `status ${meStatus}`);
  }

  console.log('\n========================================');
  console.log(`  Results: ${results.passed} passed, ${results.failed} failed`);
  console.log('========================================\n');

  if (results.failed > 0) {
    results.errors.forEach((e) => console.log(`  FAILED: ${e.name} — ${e.detail}`));
    process.exit(1);
  }
};

runTests().catch((err) => {
  console.error('Test runner error:', err.message);
  process.exit(1);
});
