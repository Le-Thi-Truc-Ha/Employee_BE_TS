import express from "express";
import jwt from "../middleware/jwt";
import employeeController from "../controllers/employeeController";

let employeeRoute = express.Router();

employeeRoute.use(jwt.checkLogin, jwt.checkPermission);

employeeRoute.get("/get-deduction", employeeController.getDeductionController);
employeeRoute.post("/add-work", employeeController.addWorkController);
employeeRoute.get("/get-work-list", employeeController.getWorkListController);
employeeRoute.get("/delete-work", employeeController.deleteWorkController);
employeeRoute.get("/get-work", employeeController.getWorkController);
employeeRoute.post("/update-work", employeeController.updateWorkController);
employeeRoute.get("/find-work", employeeController.findWorkController);
employeeRoute.post("/get-salary-deduction", employeeController.getSalaryDeductionController);

export default employeeRoute;