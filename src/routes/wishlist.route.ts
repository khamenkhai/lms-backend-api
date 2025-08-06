import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import { addToWishlist } from "../controllers/wishlist.controller";

const wishlistRoutes = Router();

wishlistRoutes.post("/wishlist/courses", authMiddleware, addToWishlist);

export default wishlistRoutes;
