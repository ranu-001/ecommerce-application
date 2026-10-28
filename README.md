# Beginner-Friendly E-Commerce Web Application

This is a simple, full-stack E-Commerce Web Application designed for beginners learning web development. It features a responsive Bootstrap 5 client interface, a Node.js/Express backend server, and a MongoDB database for persisting carts and orders.

---

## Features

### User Capabilities
- **Authentication**: Register accounts, hash passwords using bcryptjs, log in/out, and store JWT sessions.
- **Browse Catalog**: Filter items by category, sort by price (low to high, high to low), and search for products in real-time.
- **Cart Management**: Add items to a persistent cart in the database, adjust item quantities (with stock limits), and remove items.
- **Checkout Checkout**: Review order summaries, input shipping coordinates, place mock orders (stock decrements automatically), and empty the cart.
- **Order History**: Track order progression statuses in real-time (Pending, Processing, Shipped, Delivered).
- **Aesthetic Additions**: A fully integrated navbar with a dynamic cart counter and dark mode toggle.

### Admin Capabilities
- **Dashboard**: View business statistics (total revenues, order logs count, items in inventory, out-of-stock counts).
- **Product Management**: View catalog details, add new products, edit product attributes (name, categories, prices, stock levels), or delete items.
- **Order Management**: Review checkouts placed by customers (including addresses and user emails) and transition order tracking statuses.

---

## Tech Stack
- **Frontend**: HTML5, Vanilla JavaScript, CSS3, Bootstrap 5, Bootstrap Icons (served statically from Express).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB with Mongoose.
- **Security**: JWT (jsonwebtoken), bcryptjs for password encryption.

---

## Directory Structure
```
ecommerce-project/
├── client/                 # Statically served frontend pages
│   ├── index.html          # Welcome home page
│   ├── products.html       # Catalog search & filters
│   ├── product-details.html# Item detail & purchase counts
│   ├── cart.html           # Table list of cart items
│   ├── checkout.html       # Shipping form
│   ├── orders.html         # Tracking orders history
│   ├── login.html          # Sign-in panel
│   ├── register.html       # Sign-up (with user/admin selector)
│   ├── css/
│   │   └── style.css       # Custom styles & dark mode support
│   └── js/
│       └── app.js          # Shared state, navbar rendering, dark mode handler
│
├── server/                 # REST API backend server
│   ├── models/             # Mongoose schemas (User, Product, Cart, Order)
│   ├── middleware/         # Token validation & Admin guard middleware
│   ├── routes/             # Express routing files
│   ├── controllers/        # Controllers containing database queries
│   └── server.js           # Express main server (seeding mechanism inside)
│
├── .env                    # Secrets and environment configs
├── .env.example            # Configuration template
├── package.json            # Node scripts and dependencies
├── Dockerfile              # Node.js application image
├── docker-compose.yml      # Application and MongoDB services
└── README.md               # Setup documentation
```

---

## Run with Docker Compose

### Prerequisites
- Docker Desktop (or Docker Engine) with Docker Compose.

From the project root, copy the example environment file and set a private JWT secret in `.env`:

```powershell
Copy-Item .env.example .env
```

Then start the application and MongoDB:

```bash
docker compose up --build
```

Open [http://localhost:5000](http://localhost:5000). The app waits for MongoDB to become healthy before starting, and MongoDB data is saved in the `mongodb_data` Docker volume.

If port `5000` is already in use, set `APP_PORT=5001` in `.env` and open [http://localhost:5001](http://localhost:5001). To stop the containers, press `Ctrl+C` and run:

```bash
docker compose down
```

The database volume is preserved when containers are stopped. To delete the database data as well, run `docker compose down --volumes`.

The Compose file has a development-only JWT secret fallback for a quick local start. Set a strong, private `JWT_SECRET` in `.env` before using this setup outside local development.

---

## Prerequisites
1. **Node.js** installed on your computer (v14 or higher).
2. **MongoDB** installed and running locally on standard port `27017` (e.g., MongoDB Community Server, or MongoDB Compass).

---

## Installation & Setup

### 1. Install Dependencies
Open your command terminal, navigate to the `ecommerce-project` folder, and run:
```bash
npm install
```

### 2. Configure Environment Variables
Create a file named `.env` in the root folder (or copy `.env.example` to `.env`) and add the following config parameters:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ecommerce-db
JWT_SECRET=my_beginner_ecommerce_secret_key_12345
```
*Note: Make sure your MongoDB service is running on your machine.*

### 3. Launch Server
Start the Express server:
```bash
npm start
```
Upon successful launch, you should see console logs confirming:
- Connection to MongoDB Database.
- Catalog seeding (6 dummy products will be auto-created if database is empty).
- Express listening on Port 5000.

---

## Testing the Application
1. Open your web browser and go to:
   ```text
   http://localhost:5000
   ```
2. **Standard Checkout Flow**:
   - Go to **Register** and create an account with **Account Type** set to "Standard Customer".
   - Browse the catalog, filter categories, search items, and add some products to the cart.
   - Go to **Cart**, increase/decrease quantities, and click **Proceed to Checkout**.
   - Fill in your shipping info and place the mock order.
   - Check your order status under **My Orders**.

3. **Admin Catalog & Order Flow**:
   - Register a second account, setting **Account Type** to "Administrator" (or log out and register as Admin).
   - Once logged in as Admin, hover or click **Admin Panel** in the navbar to open **Dashboard**, **Manage Products**, or **Manage Orders**.
   - Edit pricing/stock levels in the products catalog, add a new item, or toggle order statuses.
   - Log back into your Customer account to see those edits and shipping status updates immediately!
