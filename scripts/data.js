/**
 * EatUp - Sample Restaurant & Menu Data
 * Organized mock data for restaurants, food categories, and menu items.
 * Uses high-quality Unsplash food photography with embedded fallback placeholders.
 */

// Safe fallback SVG image data URI in case remote images fail to load
export const FALLBACK_FOOD_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23F1F5F9'/%3E%3Ccircle cx='200' cy='140' r='60' fill='%23E2E8F0'/%3E%3Cpath d='M160 140 Q200 100 240 140' stroke='%23CBD5E1' stroke-width='8' fill='none' stroke-linecap='round'/%3E%3Ctext x='50%25' y='240' font-family='sans-serif' font-size='16' font-weight='600' fill='%2394A3B8' text-anchor='middle'%3EEatUp Delicacy%3C/text%3E%3C/svg%3E";

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

export const RESTAURANTS = [
  {
    id: "rest-1",
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
    address: "Koramangala 5th Block, Bengaluru",
    menu: [
      {
        id: "rb-101",
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
        id: "rb-102",
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
        id: "rb-103",
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
        id: "rb-104",
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
        id: "rb-105",
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
    id: "rest-2",
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
    address: "Indiranagar 100ft Road, Bengaluru",
    menu: [
      {
        id: "wf-201",
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
        id: "wf-202",
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
        id: "wf-203",
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
        id: "wf-204",
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
        id: "wf-205",
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
    id: "rest-3",
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
    address: "HSR Layout Sector 4, Bengaluru",
    menu: [
      {
        id: "bc-301",
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
        id: "bc-302",
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
        id: "bc-303",
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
        id: "bc-304",
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
    id: "rest-4",
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
    address: "Jayanagar 4th Block, Bengaluru",
    menu: [
      {
        id: "dk-401",
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
        id: "dk-402",
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
        id: "dk-403",
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
    id: "rest-5",
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
    address: "MG Road, Bengaluru",
    menu: [
      {
        id: "gw-501",
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
        id: "gw-502",
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
        id: "gw-503",
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
    id: "rest-6",
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
    address: "Bellandur Outer Ring Road, Bengaluru",
    menu: [
      {
        id: "gg-601",
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
        id: "gg-602",
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
        id: "gg-603",
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
  }
];
