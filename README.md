# Web Technologies Final Project - Elite Sushi

Elite Sushi is a front-end restaurant web application that allows visitors to explore the sushi menu, configure orders, read customer reviews, check FAQs, manage user profiles and bonuses, and register or log into an account.

---

## Visitor User Journeys

Below are three realistic, self-contained journeys that a single visitor can complete end-to-end directly from their browser screen without requiring external actors, server configurations, or back-office intervention.

### Journey 1: Select a Meal Set and Place a Delivery Order
* **Start:** Visitor lands on the Home page (`index.html`).
* **Steps:**
  1. Click **"View Menu"** (or the **"Menu"** link in the navigation header) to browse available food items on `menu.html`.
  2. Explore sets and drinks, review prices and ingredients, and click **"Add to cart"** on a selected item (e.g., *"Morimoto" Set*).
  3. On the Cart page (`cart.html`), review the order item, verify quantity and total price (6,250 ₸), and click **"Checkout"**.
  4. On the Order page (`order.html`), choose the delivery method (*Delivery* or *Self-pickup*), fill in contact information (*Name*, *Phone*), delivery address (*Street*, *Apartment*, *Entrance*, *Floor*), utensils count, and payment card details (*Card number*, *Expiry date*, *CVV*).
* **End:** Click the **"Pay for delivery"** button to submit the order and finalize the purchase.

---

### Journey 2: Create a New Account and Log In
* **Start:** Visitor is on any page and clicks the **"Sign up/Sign in"** link in the top navigation bar.
* **Steps:**
  1. Arrive on the Registration page (`register.html`) and enter account details: *Username*, *Password*, and *Confirm Password*.
  2. Click the **"Already have an account? Log in"** button to switch to the Login page (`login.html`) or submit the registration form.
  3. On the Login page (`login.html`), enter the account *Username* and *Password*.
* **End:** Click the **"Log in"** button to submit credentials and complete the sign-in flow.

---

### Journey 3: Check Customer Reviews, FAQ, and Manage Loyalty Profile
* **Start:** Visitor starts at the Home page (`index.html`) wanting to learn more about the restaurant's reputation, policies, and loyalty program.
* **Steps:**
  1. Click the **"Reviews"** link in the navigation header to open `review.html` and read customer feedback, testimonials, and star ratings.
  2. Click the **"FAQ"** link in the navigation header to navigate to `faq.html` and check frequently asked questions.
  3. Click the **"Profile"** link in the navigation header to access `profile.html` and review personal account details (Name, Email, Cell Number, Address) and check the current balance of loyalty bonuses (67 bonuses).
* **End:** Click the **"use bonuses"** button in the bonus section to apply available bonus points.