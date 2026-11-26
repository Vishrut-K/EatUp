import bcrypt from "bcryptjs";
import { Restaurant } from "../models/Restaurant.js";
import { User } from "../models/User.js";

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

export const SEED_RESTAURANTS = [
  {
    legacyId: "rest-1",
    name: "Royal Biryani House",
    cuisine: ["Biryani", "North Indian", "Mughlai"],
    rating: 4.6,
    ratingCount: "2.4k+",
    deliveryTime: "25-30 mins",
    deliveryTimeMinutes: 28,
    priceForTwo: "₹500 for two",
    costNumeric: 500,
    featured: true,
    discountBadge: "50% OFF up to ₹100",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80",
    address: "Connaught Place, Central Delhi",
    menu: [
      {
        dishId: "rb-101",
        name: "Hyderabadi Dum Biryani (Chicken)",
        category: "biryani",
        isVeg: false,
        price: 320,
        rating: 4.8,
        description: "Aromatic basmati rice layered with marinated tender chicken, saffron, and slow-cooked in traditional dum style.",
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
        bestseller: true
      },
      {
        dishId: "rb-102",
        name: "Shahi Paneer Dum Biryani",
        category: "biryani",
        isVeg: true,
        price: 260,
        rating: 4.5,
        description: "Fragrant long-grain rice infused with saffron, caramelized onions, herbs, and tender cubes of grilled paneer.",
        image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&auto=format&fit=crop&q=80",
        bestseller: true
      },
      {
        dishId: "rb-103",
        name: "Murgh Malai Tikka (6 Pcs)",
        category: "north-indian",
        isVeg: false,
        price: 290,
        rating: 4.7,
        description: "Boneless chicken marinated with rich cream, cashew paste, mild spices, roasted in clay tandoor.",
        image: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80",
        bestseller: false
      },
      {
        dishId: "rb-104",
        name: "Butter Garlic Naan (2 Pcs)",
        category: "north-indian",
        isVeg: true,
        price: 90,
        rating: 4.6,
        description: "Tandoori flatbread brushed with melted butter and fresh minced garlic.",
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80",
        bestseller: false
      },
      {
        dishId: "rb-105",
        name: "Gulab Jamun with Rabdi",
        category: "desserts",
        isVeg: true,
        price: 130,
        rating: 4.9,
        description: "Warm golden milk-solid dumplings soaked in rose-cardamom syrup topped with thick creamy rabdi.",
        image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80",
        bestseller: true
      }
    ]
  },
  {
    legacyId: "rest-2",
    name: "Woodfire Artisanal Pizza",
    cuisine: ["Pizza", "Italian", "Desserts"],
    rating: 4.5,
    ratingCount: "1.8k+",
    deliveryTime: "20-25 mins",
    deliveryTimeMinutes: 22,
    priceForTwo: "₹650 for two",
    costNumeric: 650,
    featured: true,
    discountBadge: "FREE Garlic Bread on orders > ₹499",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
    address: "Hauz Khas Village, South Delhi",
    menu: [
      {
        dishId: "wf-201",
        name: "Margherita Basilico Pizza (11\")",
        category: "pizza",
        isVeg: true,
        price: 360,
        rating: 4.7,
        description: "San Marzano tomato sauce, fresh buffalo mozzarella, aromatic sweet basil, extra virgin olive oil.",
        image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&auto=format&fit=crop&q=80",
        bestseller: true
      },
      {
        dishId: "wf-202",
        name: "Pepperoni & Hot Honey Pizza (11\")",
        category: "pizza",
        isVeg: false,
        price: 490,
        rating: 4.9,
        description: "Crispy smoked pepperoni slices, mozzarella, spicy chilli-infused honey drizzle.",
        image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80",
        bestseller: true
      },
      {
        dishId: "wf-203",
        name: "Truffle Mushroom Queso Pizza",
        category: "pizza",
        isVeg: true,
        price: 440,
        rating: 4.6,
        description: "Button & shiitake mushrooms, white truffle oil, fontina & fresh mozzarella.",
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop&q=80",
        bestseller: false
      },
      {
        dishId: "wf-204",
        name: "Cheesy Herb Garlic Breadsticks",
        category: "pizza",
        isVeg: true,
        price: 180,
        rating: 4.4,
        description: "Crispy outer crust with melted mozzarella inside, served with house marinara dip.",
        image: "https://images.unsplash.com/photo-1619895092538-128341789043?w=600&auto=format&fit=crop&q=80",
        bestseller: false
      },
      {
        dishId: "wf-205",
        name: "Classic Italian Tiramisu",
        category: "desserts",
        isVeg: true,
        price: 240,
        rating: 4.8,
        description: "Espresso-soaked savoiardi ladyfingers layered with rich mascarpone cocoa cream.",
        image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80",
        bestseller: true
      }
    ]
  },
  {
    legacyId: "rest-3",
    name: "Burger Craft Co.",
    cuisine: ["Burgers", "Beverages", "American"],
    rating: 4.4,
    ratingCount: "3.1k+",
    deliveryTime: "15-20 mins",
    deliveryTimeMinutes: 18,
    priceForTwo: "₹400 for two",
    costNumeric: 400,
    featured: true,
    discountBadge: "FLAT ₹75 OFF on Burgers",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80",
    address: "Cyber Hub, DLF Phase 2, Gurugram",
    menu: [
      {
        dishId: "bc-301",
        name: "Smoky BBQ Bacon Cheddar Burger",
        category: "burgers",
        isVeg: false,
        price: 280,
        rating: 4.7,
        description: "Char-grilled patty, crisp bacon rashers, cheddar melt, caramelized onions, house BBQ mayo in a brioche bun.",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
        bestseller: true
      },
      {
        dishId: "bc-302",
        name: "Crispy Peri-Peri Paneer Burger",
        category: "burgers",
        isVeg: true,
        price: 220,
        rating: 4.5,
        description: "Crunchy peri-peri crumb paneer slab, crunchy lettuce, jalapeño slices, chipotle sauce.",
        image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80",
        bestseller: true
      },
      {
        dishId: "bc-303",
        name: "Seasoned Waffle Fries",
        category: "burgers",
        isVeg: true,
        price: 130,
        rating: 4.3,
        description: "Golden criss-cut potato fries tossed in Cajun spices, served with garlic aioli.",
        image: "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80",
        bestseller: false
      },
      {
        dishId: "bc-304",
        name: "Belgian Chocolate Thick Shake",
        category: "beverages",
        isVeg: true,
        price: 160,
        rating: 4.8,
        description: "Dense blended Belgian cocoa milkshake crowned with chocolate shavings.",
        image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80",
        bestseller: true
      }
    ]
  },
  {
    legacyId: "rest-4",
    name: "Dakshin Tiffin & Dosa",
    cuisine: ["South Indian", "Healthy Bowls", "Beverages"],
    rating: 4.7,
    ratingCount: "5.2k+",
    deliveryTime: "15-25 mins",
    deliveryTimeMinutes: 20,
    priceForTwo: "₹250 for two",
    costNumeric: 250,
    featured: false,
    discountBadge: "20% OFF on Morning & Evening Combos",
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&auto=format&fit=crop&q=80",
    address: "Karol Bagh, New Delhi",
    menu: [
      {
        dishId: "dk-401",
        name: "Ghee Roast Masala Dosa",
        category: "south-indian",
        isVeg: true,
        price: 120,
        rating: 4.9,
        description: "Crispy golden crepe roasted in pure desi ghee, filled with spiced potato mash, served with coconut & tomato chutneys.",
        image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80",
        bestseller: true
      },
      {
        dishId: "dk-402",
        name: "Steamed Button Idli & Vada Combo",
        category: "south-indian",
        isVeg: true,
        price: 95,
        rating: 4.6,
        description: "Piping hot feather-light idlis and crisp medu vada dipped in piping hot drumstick sambar.",
        image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80",
        bestseller: true
      },
      {
        dishId: "dk-403",
        name: "Authentic Degree Filter Coffee",
        category: "beverages",
        isVeg: true,
        price: 45,
        rating: 4.9,
        description: "Freshly brewed chicory-infused South Indian filter kaapi frothed to perfection.",
        image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80",
        bestseller: true
      }
    ]
  },
  {
    legacyId: "rest-5",
    name: "Golden Wok & Dim Sum",
    cuisine: ["Chinese", "Asian", "Beverages"],
    rating: 4.3,
    ratingCount: "1.2k+",
    deliveryTime: "30-35 mins",
    deliveryTimeMinutes: 32,
    priceForTwo: "₹550 for two",
    costNumeric: 550,
    featured: false,
    discountBadge: "Complimentary Dim Sum on ₹600+",
    image: "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=800&auto=format&fit=crop&q=80",
    address: "Khan Market, New Delhi",
    menu: [
      {
        dishId: "gw-501",
        name: "Schezwan Hakka Noodles (Chicken)",
        category: "chinese",
        isVeg: false,
        price: 240,
        rating: 4.5,
        description: "Wok-tossed noodles with shredded chicken, crunchy peppers, scallions, and fiery house Schezwan sauce.",
        image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80",
        bestseller: true
      },
      {
        dishId: "gw-502",
        name: "Steamed Crystal Veg Dim Sum (6 Pcs)",
        category: "chinese",
        isVeg: true,
        price: 220,
        rating: 4.6,
        description: "Translucent dumplings stuffed with water chestnuts, mushrooms, and Asian greens with chilli-garlic dip.",
        image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&auto=format&fit=crop&q=80",
        bestseller: true
      },
      {
        dishId: "gw-503",
        name: "Crispy Chilli Paneer Dry",
        category: "chinese",
        isVeg: true,
        price: 230,
        rating: 4.4,
        description: "Fried cottage cheese cubes tossed with capsicum, spring onions, soy sauce, and green chillies.",
        image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80",
        bestseller: false
      }
    ]
  },
  {
    legacyId: "rest-6",
    name: "Green Garden Salad & Bowl Co.",
    cuisine: ["Healthy Bowls", "Desserts", "Beverages"],
    rating: 4.6,
    ratingCount: "890+",
    deliveryTime: "20-25 mins",
    deliveryTimeMinutes: 22,
    priceForTwo: "₹450 for two",
    costNumeric: 450,
    featured: false,
    discountBadge: "15% OFF on Fitness Bowls",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80",
    address: "Sector 29 Market, Gurugram",
    menu: [
      {
        dishId: "gg-601",
        name: "Mediterranean Quinoa & Avocado Bowl",
        category: "healthy",
        isVeg: true,
        price: 280,
        rating: 4.8,
        description: "Fluffy quinoa, Hass avocado, cherry tomatoes, cucumbers, kalamata olives, feta cheese, and lemon-oregano vinaigrette.",
        image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80",
        bestseller: true
      },
      {
        dishId: "gg-602",
        name: "Grilled Herb Chicken Protein Salad",
        category: "healthy",
        isVeg: false,
        price: 310,
        rating: 4.7,
        description: "Juicy grilled chicken breast slices, mixed crisp greens, hard-boiled eggs, toasted almonds, honey-dijon dressing.",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
        bestseller: true
      },
      {
        dishId: "gg-603",
        name: "Cold-Pressed Valencia Orange Juice (300ml)",
        category: "beverages",
        isVeg: true,
        price: 120,
        rating: 4.5,
        description: "100% natural pure orange juice without added sugar, preservatives, or water.",
        image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80",
        bestseller: false
      }
    ]
  },
  {
    legacyId: "rest-7",
    name: "Dilli 6 Tandoor & Dhaba",
    cuisine: ["North Indian", "Biryani", "Beverages"],
    rating: 4.7,
    ratingCount: "3.9k+",
    deliveryTime: "20-25 mins",
    deliveryTimeMinutes: 24,
    priceForTwo: "₹450 for two",
    costNumeric: 450,
    featured: true,
    discountBadge: "20% OFF on Thalis & Combos",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=80",
    address: "Chandni Chowk, Old Delhi",
    menu: [
      {
        dishId: "d6-701",
        name: "Old Delhi Butter Chicken",
        category: "north-indian",
        isVeg: false,
        price: 340,
        rating: 4.9,
        description: "Charcoal-roasted tandoori chicken simmered in velvety tomato-fenugreek makhani gravy.",
        image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80",
        bestseller: true
      },
      {
        dishId: "d6-702",
        name: "Slow-Simmered Dal Makhani",
        category: "north-indian",
        isVeg: true,
        price: 240,
        rating: 4.8,
        description: "24-hour slow-cooked black lentils finished with white butter, cream, and roasted cumin.",
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
        bestseller: true
      },
      {
        dishId: "d6-703",
        name: "Kesar Mango Lassi",
        category: "beverages",
        isVeg: true,
        price: 110,
        rating: 4.7,
        description: "Thick churned curd blended with Alphonso mango pulp, saffron strands, and crushed pistachios.",
        image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop&q=80",
        bestseller: false
      }
    ]
  },
  {
    legacyId: "rest-8",
    name: "Bombay Patty & Grill",
    cuisine: ["Burgers", "American", "Beverages"],
    rating: 4.6,
    ratingCount: "1.5k+",
    deliveryTime: "18-22 mins",
    deliveryTimeMinutes: 20,
    priceForTwo: "₹380 for two",
    costNumeric: 380,
    featured: false,
    discountBadge: "FREE Fries on orders > ₹349",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80",
    address: "Select Citywalk, Saket, New Delhi",
    menu: [
      {
        dishId: "bp-801",
        name: "Double Smash Classic Cheeseburger",
        category: "burgers",
        isVeg: false,
        price: 295,
        rating: 4.8,
        description: "Two lacy-edged smashed patties, double aged cheddar, house pickles, and caramelized onion jam.",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
        bestseller: true
      },
      {
        dishId: "bp-802",
        name: "Truffle Mushroom & Swiss Veggie Burger",
        category: "burgers",
        isVeg: true,
        price: 250,
        rating: 4.6,
        description: "Crispy herb-mushroom patty, melted Swiss cheese, baby arugula, and garlic-truffle aioli.",
        image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=600&auto=format&fit=crop&q=80",
        bestseller: true
      },
      {
        dishId: "bp-803",
        name: "Salted Caramel Cold Brew",
        category: "beverages",
        isVeg: true,
        price: 145,
        rating: 4.5,
        description: "18-hour steeped Arabica cold brew topped with sea-salted caramel cream foam.",
        image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&auto=format&fit=crop&q=80",
        bestseller: false
      }
    ]
  },
  {
    legacyId: "rest-9",
    name: "La Crust & Crumble Bakery",
    cuisine: ["Desserts", "Beverages", "Pizza"],
    rating: 4.8,
    ratingCount: "2.1k+",
    deliveryTime: "20-25 mins",
    deliveryTimeMinutes: 22,
    priceForTwo: "₹350 for two",
    costNumeric: 350,
    featured: false,
    discountBadge: "Buy 2 Pastries, Get 15% OFF",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop&q=80",
    address: "Defence Colony Market, New Delhi",
    menu: [
      {
        dishId: "lc-901",
        name: "Belgian Dark Chocolate Hazelnut Tart",
        category: "desserts",
        isVeg: true,
        price: 210,
        rating: 4.9,
        description: "Crisp cocoa shortcrust filled with 70% dark chocolate ganache and roasted Piedmont hazelnuts.",
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80",
        bestseller: true
      },
      {
        dishId: "lc-902",
        name: "Burnt Basque Cheesecake Slice",
        category: "desserts",
        isVeg: true,
        price: 240,
        rating: 4.8,
        description: "Caramelized top with an ultra-creamy vanilla bean cheesecake center.",
        image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80",
        bestseller: true
      },
      {
        dishId: "lc-903",
        name: "Artisanal Iced Matcha Latte",
        category: "beverages",
        isVeg: true,
        price: 180,
        rating: 4.6,
        description: "Ceremonial-grade Uji matcha whisked over oat milk and ice.",
        image: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=600&auto=format&fit=crop&q=80",
        bestseller: false
      }
    ]
  },
  {
    legacyId: "rest-10",
    name: "Saffron Bowl & Chaat",
    cuisine: ["Healthy Bowls", "North Indian", "South Indian"],
    rating: 4.5,
    ratingCount: "980+",
    deliveryTime: "15-20 mins",
    deliveryTimeMinutes: 18,
    priceForTwo: "₹300 for two",
    costNumeric: 300,
    featured: false,
    discountBadge: "FLAT ₹50 OFF on Bowls",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80",
    address: "Noida Sector 18",
    menu: [
      {
        dishId: "sb-1001",
        name: "Roasted Sweet Potato & Chickpea Buddha Bowl",
        category: "healthy",
        isVeg: true,
        price: 250,
        rating: 4.7,
        description: "Spiced chickpeas, roasted sweet potato, baby spinach, brown rice, and creamy tahini-mint drizzle.",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80",
        bestseller: true
      },
      {
        dishId: "sb-1002",
        name: "Millet & Lentil Khichdi Comfort Bowl",
        category: "healthy",
        isVeg: true,
        price: 190,
        rating: 4.6,
        description: "Wholesome foxtail millet and moong dal tempered with desi ghee, cumin, and roasted papad.",
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
        bestseller: false
      }
    ]
  }
];

export async function seedDatabaseIfEmpty() {
  // Upsert restaurants idempotently by legacyId
  for (const rest of SEED_RESTAURANTS) {
    await Restaurant.findOneAndUpdate(
      { legacyId: rest.legacyId },
      { $setOnInsert: rest },
      { upsert: true, new: true }
    );
  }

  // Ensure demo user exists for 1-click evaluator login in non-production environments
  if (process.env.NODE_ENV !== "production") {
    const demoEmail = "demo@eatup.com";
    const existingDemo = await User.findOne({ email: demoEmail });
    if (!existingDemo) {
      const passwordHash = await bcrypt.hash("password123", 10);
      await User.create({
        name: "Alex Morgan",
        email: demoEmail,
        passwordHash,
        defaultPhone: "9876543210",
        defaultAddress: "Flat 402, Sunshine Residency, Barakhamba Road, Connaught Place, New Delhi"
      });
    }
  }
}
