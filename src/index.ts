import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express, {Application} from "express";
import configCors from "./configs/cors";
import initWebRoute from "./routes/webRoute";
import cron from "node-cron";
import axios from "axios";

dotenv.config();

const PORT = process.env.PORT || 3000;
const app: Application = express();

configCors(app);

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

initWebRoute(app);

cron.schedule("0 8 * * *", async () => {
    try {
        await axios.get(process.env.CHECK_WORK_URL || "");
    } catch(e) {
        console.log(e);
    }
}, {
    timezone: "Asia/Ho_Chi_Minh"
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
