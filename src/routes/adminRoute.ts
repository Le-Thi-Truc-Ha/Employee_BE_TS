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
adminRoute.post("/update-salary-deduction", adminController.updateSalaryDeductionController);
adminRoute.post("/add-miss-shift", adminController.addMissShiftController);
adminRoute.post("/delete-salary-deduction", adminController.deleteSalaryDeductionController);
adminRoute.post("/pay-keep-salary", adminController.payKeepSalaryController);
adminRoute.post("/cancel-pay", adminController.cancelPayController);
adminRoute.post("/delete-keep-salary", adminController.deleteKeepSalaryController);
adminRoute.get("/get-step-salary", adminController.getStepSalaryController);
adminRoute.post("/update-step-salary", adminController.updateStepSalaryController);
adminRoute.post("/update-deduction", adminController.updateDeductionController);
adminRoute.get("/get-work-error", adminController.getWorkErrorController);
adminRoute.post("/delete-work-error", adminController.deleteWorkErrorController);
adminRoute.post("/find-work", adminController.findWorkController);

export default adminRoute;