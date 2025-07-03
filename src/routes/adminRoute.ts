import express from "express";
import adminController from "../controllers/adminController";
import jwt from "../middleware/jwt";

let adminRoute = express.Router();

adminRoute.use(jwt.checkLogin, jwt.checkPermission);

adminRoute.post("/add-account", adminController.addAccountController);
adminRoute.get("/get-account", adminController.getAccountController)

export default adminRoute;