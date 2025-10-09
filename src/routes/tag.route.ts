import { Router } from "express";
import {
  createTag,
  getTags,
  getTagById,
  updateTag,
  deleteTag,
} from "../controllers/tag.controller";

const tagRoute = Router();

tagRoute.post("/admin/tags", createTag);

tagRoute.get("/admin/tags", getTags);

tagRoute.get("/admin/tags/:id", getTagById);

tagRoute.put("/admin/tags/:id", updateTag);

tagRoute.delete("/admin/tags/:id", deleteTag);

export default tagRoute;
