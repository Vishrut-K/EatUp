export const FALLBACK_FOOD_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23F3EDE2'/%3E%3Ccircle cx='200' cy='140' r='56' fill='%23EAE3D9'/%3E%3Cpath d='M165 142 Q200 104 235 142' stroke='%23C83E2B' stroke-width='6' fill='none' stroke-linecap='round'/%3E%3Ctext x='50%25' y='236' font-family='Georgia, serif' font-size='18' font-style='italic' fill='%2357534E' text-anchor='middle'%3EEatUp Kitchen%3C/text%3E%3C/svg%3E";

export const CATEGORIES = [
  { id: "all", name: "All Kitchens", tag: "Curated" },
  { id: "biryani", name: "Biryani", tag: "Slow Dum" },
  { id: "pizza", name: "Woodfire Pizza", tag: "Artisanal" },
  { id: "burgers", name: "Craft Burgers", tag: "Brioche" },
  { id: "north-indian", name: "North Indian", tag: "Tandoor" },
  { id: "south-indian", name: "South Indian", tag: "Tiffin" },
  { id: "chinese", name: "Asian Wok", tag: "Dim Sum" },
  { id: "desserts", name: "Desserts", tag: "Sweet" },
  { id: "beverages", name: "Beverages", tag: "Crafted" },
  { id: "healthy", name: "Healthy Bowls", tag: "Fresh" }
];

export const PAYMENT_METHODS = [
  {
    value: "Cash on Delivery (Demo)",
    title: "Cash on Delivery",
    subtitle: "Pay via cash or UPI scanner at your doorstep"
  },
  {
    value: "UPI / QR Simulation",
    title: "UPI Instant Pay",
    subtitle: "Google Pay, PhonePe, Paytm or any BHIM UPI app"
  },
  {
    value: "Credit / Debit Card (Demo)",
    title: "Credit or Debit Card",
    subtitle: "Visa, Mastercard, RuPay & Amex supported"
  }
];
