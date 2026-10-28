# EatUp — Food Ordering Web Application

EatUp is a modern, responsive, frontend-only food delivery web application inspired by the core user experience of Swiggy and Zomato. Built specifically for academic project evaluations using standard web technologies.

---

## 🚀 Key Features

1. **Attractive Landing Page:**
   - Hero banner with quick food discovery search.
   - Interactive craving categories (Biryani, Pizzas, Burgers, Healthy Bowls, etc.).
   - Promotional discount banners ("50% OFF", "Free Delivery").
   - Popular restaurant highlights with real-time ratings and delivery estimates.

2. **Demo Authentication (LocalStorage):**
   - User Registration (Full Name, Email, Password) with format validation.
   - User Login with session tracking and friendly error alerts.
   - **1-Click Auto Fill Demo Button** for quick evaluation demonstrations.
   - Persistent session across page reloads and clean sign-out flow.

3. **Explore & Discovery:**
   - Multi-parameter live search across restaurant names, cuisines, and menu dishes.
   - Dietary filter for "Pure Veg" dishes.
   - Filter by "★ 4.5+ Rating" and "⚡ Under 25 mins" fast delivery.
   - Sorting by Relevance, Rating, Delivery Time, and Price.
   - Friendly empty-search state with a 1-click filter reset.

4. **Restaurant Detail & Interactive Menu:**
   - Restaurant banner with cuisines, address, ratings, and active discounts.
   - Category-wise dish menu with authentic Indian dietary badges (Veg green dot / Non-veg red triangle).
   - Real-time quantity steppers (`[-] Qty [+]`) directly embedded on dish cards.

5. **Smart Shopping Cart (Single Restaurant Rule):**
   - Single-restaurant restriction with an interactive conflict resolution modal.
   - Quantity increment/decrement and item removal.
   - Bill calculation including dynamic delivery fee (Free over ₹400), platform fee, and 5% GST.
   - Full cart persistence via Browser `LocalStorage`.

6. **Checkout & Order Confirmation:**
   - Delivery address and recipient details validation.
   - Demo payment selection (Cash on Delivery, UPI simulation, Card simulation).
   - Unique order ID generation and simulated 30-35 min delivery estimate.

7. **My Orders (Order History):**
   - Historical record of all placed orders per user account.
   - Detailed item summary, total paid, and order status.
   - 1-click "Reorder Dishes" action that loads the items back into the cart.

---

## 🛠️ Technology Stack (Strictly Frontend Only)

- **Structure:** Semantic HTML5
- **Styling:** Vanilla CSS3 (Custom Properties / CSS Variables, Flexbox, CSS Grid, Media Queries)
- **Scripting:** Modern Vanilla JavaScript (ES6 Modules)
- **Data Persistence:** Browser `LocalStorage`
- **Zero External Frameworks:** No React, Vue, Angular, Tailwind, Bootstrap, Node.js, Express, or backend databases.

---

## 📂 Project Structure

```
EatUp/
├── index.html                  # Main SPA entry point
├── styles/
│   └── style.css               # Design system, responsive layout, theme tokens
├── scripts/
│   ├── app.js                  # App controller, routing, and UI interactions
│   ├── data.js                 # Sample restaurants and menu dishes mock database
│   └── storage.js              # LocalStorage helpers for Auth, Cart, and Orders
├── project-context/
│   ├── CHAT_HISTORY.md         # Chronological development log
│   ├── PROJECT_STATE.md        # Current feature state and technical roadmap
│   └── DECISIONS.md            # Architecture Decision Records (ADRs)
└── README.md                   # Project documentation & run guide
```

---

## 🏃 How to Run the Application

Because EatUp uses modern ES6 JavaScript modules (`import`/`export`), it is recommended to run it using a lightweight local web server to avoid browser `file://` CORS restrictions:

### Option A: VS Code Live Server (Recommended)
1. Open the `EatUp` folder in Visual Studio Code.
2. Install the **Live Server** extension (by Ritwick Dey).
3. Right-click `index.html` and select **"Open with Live Server"**.
4. The application will launch in your browser at `http://127.0.0.1:5500`.

### Option B: Python Simple HTTP Server
Open your terminal in the `EatUp` folder and run:
```bash
# Python 3
python -m http.server 8000
```
Then visit `http://localhost:8000` in your web browser.

### Option C: Node.js (npx serve)
```bash
npx serve .
```

---

## 🔑 Demo Account Credentials

For instant evaluation testing, use the pre-configured demo account or click the **"1-Click Auto Fill"** button on the Sign In screen:

- **Email:** `demo@eatup.com`
- **Password:** `password123`
- *(Alternatively, you can sign up with any new test email and password!)*

---

## ⚠️ Academic Evaluation Disclaimer

This project is built purely as a frontend demonstration:
- **Authentication:** Simulated using browser `LocalStorage`. It does not use secure encrypted backend hashing and should not be used with real production passwords.
- **Payment & Tracking:** Payment methods and order arrival times are simulated for demonstration purposes. No real financial charges or live GPS tracking occur.
