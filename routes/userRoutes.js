import { Router } from "express";
import {
  deleteUserAccount,
  verifyUserEmail,
  verifyUserEmailOTP,
  manageTwoFactorAuth,
  manageLoginActivity,
  updateUserProfile,
  changePassword
} from "../controllers/userControllers.js";
import { authorization } from "../middlewares/authorization.js";

const userRouter = Router();

userRouter.post("/verify-user-email", authorization, verifyUserEmail);
userRouter.post("/verify-user-email-otp", authorization, verifyUserEmailOTP);
userRouter.post("/delete-user", authorization, deleteUserAccount);
userRouter.post("/manage-twofactor-auth", authorization, manageTwoFactorAuth);
userRouter.post("/manage-login-activity", authorization, manageLoginActivity);
userRouter.post("/update-user-profile", authorization, updateUserProfile);
userRouter.post("/change-password", authorization, changePassword);


export default userRouter;
