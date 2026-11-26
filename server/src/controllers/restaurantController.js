import { Restaurant } from "../models/Restaurant.js";
import { CATEGORIES } from "../services/seedService.js";

function serializeRestaurantSummary(doc, includeMenu = true) {
  const base = {
    id: doc.legacyId,
    _id: doc._id.toString(),
    name: doc.name,
    cuisine: doc.cuisine,
    rating: doc.rating,
    ratingCount: doc.ratingCount,
    deliveryTime: doc.deliveryTime,
    deliveryTimeMinutes: doc.deliveryTimeMinutes,
    priceForTwo: doc.priceForTwo,
    costNumeric: doc.costNumeric,
    featured: doc.featured,
    discountBadge: doc.discountBadge,
    image: doc.image,
    address: doc.address
  };

  if (includeMenu) {
    base.menu = doc.menu.map((m) => ({
      id: m.dishId,
      name: m.name,
      category: m.category,
      isVeg: m.isVeg,
      price: m.price,
      rating: m.rating,
      description: m.description,
      image: m.image,
      bestseller: m.bestseller,
      isAvailable: m.isAvailable
    }));
  }

  return base;
}

export async function getCategories(_req, res) {
  return res.json({ success: true, categories: CATEGORIES });
}

export async function getRestaurants(req, res) {
  const { q = "", category = "all", vegOnly = "false", minRating, maxTime, sort = "relevance", featured } = req.query;

  const docs = await Restaurant.find({}).lean();
  let list = docs.map(serializeRestaurantSummary);

  if (featured === "true") {
    list = list.filter((r) => r.featured);
  }

  const queryText = String(q).trim().toLowerCase();
  if (queryText) {
    list = list.filter((r) => {
      const matchName = r.name.toLowerCase().includes(queryText);
      const matchCuisine = r.cuisine.some((c) => c.toLowerCase().includes(queryText));
      const matchMenu = r.menu.some((m) => m.name.toLowerCase().includes(queryText));
      return matchName || matchCuisine || matchMenu;
    });
  }

  if (category && category !== "all") {
    list = list.filter((r) => {
      const matchCuisine = r.cuisine.some((c) => c.toLowerCase().replace(/\s+/g, "-") === category);
      const matchDish = r.menu.some((m) => m.category === category);
      return matchCuisine || matchDish;
    });
  }

  if (vegOnly === "true") {
    list = list.filter((r) =>
      category && category !== "all"
        ? r.menu.some((m) => m.isVeg && m.category === category) ||
          (r.menu.every((m) => m.isVeg) &&
            r.cuisine.some((c) => c.toLowerCase().replace(/\s+/g, "-") === category))
        : r.menu.some((m) => m.isVeg)
    );
  }

  if (minRating) {
    const ratingThreshold = Number(minRating);
    if (!Number.isNaN(ratingThreshold)) {
      list = list.filter((r) => r.rating >= ratingThreshold);
    }
  }

  if (maxTime) {
    const timeLimit = Number(maxTime);
    if (!Number.isNaN(timeLimit)) {
      list = list.filter((r) => r.deliveryTimeMinutes <= timeLimit);
    }
  }

  if (sort === "rating") {
    list.sort((a, b) => b.rating - a.rating);
  } else if (sort === "deliveryTime") {
    list.sort((a, b) => a.deliveryTimeMinutes - b.deliveryTimeMinutes);
  } else if (sort === "costAsc") {
    list.sort((a, b) => a.costNumeric - b.costNumeric);
  }

  return res.json({
    success: true,
    restaurants: list.map(({ menu: _menu, ...summary }) => summary),
    categories: CATEGORIES
  });
}

export async function getRestaurantById(req, res) {
  const { id } = req.params;
  const doc = await Restaurant.findOne({ legacyId: id }).lean();
  if (!doc) {
    return res.status(404).json({ success: false, message: "Restaurant not found." });
  }
  return res.json({
    success: true,
    restaurant: serializeRestaurantSummary(doc)
  });
}
