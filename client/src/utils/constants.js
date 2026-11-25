export const FALLBACK_FOOD_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23F1F5F9'/%3E%3Ccircle cx='200' cy='140' r='60' fill='%23E2E8F0'/%3E%3Cpath d='M160 140 Q200 100 240 140' stroke='%23CBD5E1' stroke-width='8' fill='none' stroke-linecap='round'/%3E%3Ctext x='50%25' y='240' font-family='sans-serif' font-size='16' font-weight='600' fill='%2394A3B8' text-anchor='middle'%3EEatUp Delicacy%3C/text%3E%3C/svg%3E";

export const CATEGORIES = [
  { id: "all", name: "All Dishes", icon: "🍽️" },
  { id: "biryani", name: "Biryani", icon: "🥘" },
  { id: "pizza", name: "Pizza", icon: "🍕" },
  { id: "burgers", name: "Burgers", icon: "🍔" },
  { id: "north-indian", name: "North Indian", icon: "🍛" },
  { id: "south-indian", name: "South Indian", icon: "🥞" },
  { id: "chinese", name: "Chinese", icon: "🍜" },
  { id: "desserts", name: "Desserts", icon: "🍰" },
  { id: "beverages", name: "Beverages", icon: "🥤" },
  { id: "healthy", name: "Healthy Bowls", icon: "🥗" }
];

export const PAYMENT_METHODS = [
  {
    value: "Cash on Delivery (Demo)",
    title: "💵 Cash on Delivery",
    subtitle: "Pay via cash or UPI scanner upon delivery"
  },
  {
    value: "UPI / QR Simulation",
    title: "📱 Google Pay / PhonePe / Paytm",
    subtitle: "Simulated instant UPI settlement"
  },
  {
    value: "Credit / Debit Card (Demo)",
    title: "💳 Credit / Debit Card",
    subtitle: "Simulated demo card checkout"
  }
];

export const DEMO_CREDENTIALS = {
  email: "demo@eatup.com",
  password: "password123"
};
