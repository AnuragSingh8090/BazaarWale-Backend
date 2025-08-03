import { Router } from "express";
import {
  deleteUserAccount,
  verifyUserEmail,
  verifyUserEmailOTP,
  manageTwoFactorAuth
} from "../controllers/userControllers.js";
import { authorization } from "../middlewares/authorization.js";

const userRouter = Router();

userRouter.post("/verify-user-email", authorization, verifyUserEmail);
userRouter.post("/verify-user-email-otp", authorization, verifyUserEmailOTP);
userRouter.post("/delete-user", authorization, deleteUserAccount);
userRouter.post("/manage-twofactor-auth", authorization, manageTwoFactorAuth);

export default userRouter;
