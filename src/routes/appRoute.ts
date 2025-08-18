import express from "express";
import appController from "../controllers/appController";

let appRoute = express.Router();

appRoute.get("/", appController.awakeBackendController);
appRoute.post("/login", appController.loginController);
appRoute.get("/reload-page", appController.reloadPageController);
appRoute.get("/logout", appController.logoutController);
appRoute.get("/get-profile", appController.getProfileController);
appRoute.post("/change-profile", appController.changeProfileController);
appRoute.post("/change-password", appController.changePasswordController);
appRoute.get("/check-error-work", appController.checkErrorWorkController);

export default appRoute;