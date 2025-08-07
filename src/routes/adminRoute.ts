import express from "express";
import adminController from "../controllers/adminController";
import jwt from "../middleware/jwt";
import employeeController from "../controllers/employeeController";

let adminRoute = express.Router();

adminRoute.use(jwt.checkLogin, jwt.checkPermission);

adminRoute.post("/add-account", adminController.addAccountController);
adminRoute.get("/get-account", adminController.getAccountListController);
adminRoute.get("/find-account", adminController.findAccountController);
adminRoute.get("/get-account-information", adminController.getAccountInformationController);
adminRoute.post("/update-employee-account", adminController.updateEmployeeAccountController);
adminRoute.post("/reset-employee-password", adminController.resetEmployeePasswordController);
adminRoute.post("/delete-employee", adminController.deleteEmployeeController);
adminRoute.get("/get-employee-list", adminController.getEmployeeListController);
adminRoute.get("/get-deduction", employeeController.getDeductionController);
adminRoute.post("/add-work", employeeController.addWorkController);
adminRoute.get("/get-work-list", employeeController.getWorkListController);
adminRoute.get("/delete-work", employeeController.deleteWorkController);
adminRoute.get("/get-work", employeeController.getWorkController);
adminRoute.post("/update-work", employeeController.updateWorkController);
adminRoute.post("/get-salary-deduction", employeeController.getSalaryDeductionController);
adminRoute.post("/add-keep-salary", adminController.addKeepSalaryController);

export default adminRoute;