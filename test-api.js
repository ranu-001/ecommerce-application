/**
 * E-Commerce Integration API Test Script
 * 
 * This script runs a series of HTTP requests against the running Express backend 
 * to verify all API endpoints: registration, login, products, cart, and orders.
 * 
 * Prerequisites:
 * 1. Your MongoDB service must be running.
 * 2. Start the server in another terminal: `npm start`
 * 3. Run this script: `node test-api.js`
 */

const BASE_URL = 'http://localhost:5000/api';

// Generates random emails to prevent "user already exists" DB collisions
const testEmailUser = `user_${Math.floor(Math.random() * 10000)}@test.com`;
const testEmailAdmin = `admin_${Math.floor(Math.random() * 10000)}@test.com`;
const password = 'password123';

let userToken = '';
let adminToken = '';
let sampleProductId = '';
let sampleOrderId = '';

// Helper to run fetch requests and output results
async function runTest(description, path, options = {}) {
  console.log(`\n========================================`);
  console.log(`TESTING: ${description}`);
  console.log(`ENDPOINT: ${options.method || 'GET'} ${path}`);
  
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ SUCCESS (Status ${response.status})`);
      console.log(`RESPONSE:`, JSON.stringify(data, null, 2).substring(0, 300) + (JSON.stringify(data).length > 300 ? '...' : ''));
      return data;
    } else {
      console.error(`❌ FAILED (Status ${response.status})`);
      console.error(`ERROR RESPONSE:`, data);
      throw new Error(`Test failed: ${description}`);
    }
  } catch (error) {
    console.error(`❌ NETWORK ERROR:`, error.message);
    throw error;
  }
}

async function startTests() {
  try {
    console.log('🚀 Starting E-Commerce API integration checks...');

    // 1. REGISTER USER
    const regUserData = await runTest('Register Test Customer Account', '/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Customer',
        email: testEmailUser,
        password: password,
        role: 'user'
      })
    });
    userToken = regUserData.token;

    // 2. REGISTER ADMIN
    const regAdminData = await runTest('Register Test Admin Account', '/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Administrator',
        email: testEmailAdmin,
        password: password,
        role: 'admin'
      })
    });
    adminToken = regAdminData.token;

    // 3. LOGIN USER
    await runTest('Login Customer Account', '/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testEmailUser,
        password: password
      })
    });

    // 4. FETCH PRODUCTS (PUBLIC)
    const products = await runTest('Get Catalog Products List', '/products');
    if (products.length > 0) {
      sampleProductId = products[0]._id;
      console.log(`👉 Captured Sample Product ID: ${sampleProductId} (${products[0].name})`);
    } else {
      throw new Error('No products found in DB. Seeding may have failed.');
    }

    // 5. GET SINGLE PRODUCT (PUBLIC)
    await runTest('Get Specific Product Details by ID', `/products/${sampleProductId}`);

    // 6. ADD TO CART (USER)
    await runTest('Add Product to Customer Shopping Cart', '/cart/add', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${userToken}` },
      body: JSON.stringify({
        productId: sampleProductId,
        quantity: 2
      })
    });

    // 7. GET CART (USER)
    await runTest('Fetch Customer Cart Contents', '/cart', {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });

    // 8. PLACE ORDER (USER)
    const orderData = await runTest('Place Order (Checkout Process)', '/orders', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${userToken}` },
      body: JSON.stringify({
        customerName: 'Test Buyer',
        shippingAddress: '789 Integration Testing Way, QA City, 99999',
        phoneNumber: '1-800-555-TEST'
      })
    });
    sampleOrderId = orderData.order._id;
    console.log(`👉 Captured Sample Order ID: ${sampleOrderId}`);

    // 9. VERIFY CART IS EMPTY (USER)
    const emptyCart = await runTest('Verify Cart is Emptied Post-Checkout', '/cart', {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    if (emptyCart.items.length !== 0) {
      throw new Error('Cart was not cleared after order creation!');
    }

    // 10. GET CUSTOMER ORDER HISTORY (USER)
    await runTest('Get Customer Order Tracking Log', '/orders', {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });

    // 11. GET ALL ORDERS (ADMIN)
    await runTest('Fetch All Shop Orders (Administrative)', '/orders', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    // 12. UPDATE ORDER STATUS (ADMIN)
    await runTest('Update Order Status (Set to Delivered)', `/orders/${sampleOrderId}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        status: 'Delivered'
      })
    });

    // 13. VERIFY CUSTOMER LOG SHOWS STATUS UPDATE (USER)
    const finalOrders = await runTest('Verify Status Reflected in Customer Log', '/orders', {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const updatedOrder = finalOrders.find(o => o._id === sampleOrderId);
    if (updatedOrder.status !== 'Delivered') {
      throw new Error('Order status update did not persist or sync correctly!');
    }

    console.log(`\n========================================`);
    console.log('🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY!');
    console.log('Your backend API and database schemas are operating perfectly.');
    console.log(`========================================`);

  } catch (error) {
    console.error(`\n❌ INTEGRATION TESTING ABORTED:`, error.message);
    console.log('Please ensure your local MongoDB is active and the server is running on http://localhost:5000 before running tests.');
    process.exit(1);
  }
}

startTests();
