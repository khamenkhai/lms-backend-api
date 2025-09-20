import { Router } from "express";
import { getUsers } from "../controllers/user.controller";

const usersRoute = Router();

usersRoute.get("/admin/users", getUsers);

export default usersRoute;
