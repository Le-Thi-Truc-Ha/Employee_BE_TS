import { Application, Response } from 'express';
import appRoute from './appRoute';
import adminRoute from './adminRoute';
import employeeRoute from './employeeRoute';

let initWebRoute = (app: Application): void => {
    app.use("/", appRoute);
    app.use("/admin", adminRoute);
    app.use("/employee", employeeRoute);
}

export default initWebRoute;