import { Router } from "express";
import { getCategories, getRestaurantById, getRestaurants } from "../controllers/restaurantController.js";

const router = Router();

router.get("/categories", getCategories);
router.get("/", getRestaurants);
router.get("/:id", getRestaurantById);

export default router;
