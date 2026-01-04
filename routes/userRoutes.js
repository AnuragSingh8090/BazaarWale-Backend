import { Router } from "express";
import {
  deleteUserAccount,
  verifyUserEmail,
  verifyUserEmailOTP,
  manageTwoFactorAuth,
  manageLoginActivity,
  updateUserProfile,
  changePassword,
  addNewAddress,
  userData,
  userDataBasic
} from "../controllers/userControllers.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const userRouter = Router();
userRouter.get('/userdata', requireAuth, userData)
userRouter.get('/userdatabasic', requireAuth, userDataBasic)
userRouter.post("/verify-user-email", requireAuth, verifyUserEmail);
userRouter.post("/verify-user-email-otp", requireAuth, verifyUserEmailOTP);
userRouter.post("/delete-user", requireAuth, deleteUserAccount);
userRouter.post("/manage-twofactor-auth", requireAuth, manageTwoFactorAuth);
userRouter.post("/manage-login-activity", requireAuth, manageLoginActivity);
userRouter.post("/update-user-profile", requireAuth, updateUserProfile);
userRouter.post("/change-password", requireAuth, changePassword);
userRouter.post('/add-address', requireAuth, addNewAddress)


export default userRouter;
