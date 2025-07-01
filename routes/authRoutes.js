import {Router} from 'express'
import {register, login, userData, validateResetPasswordEmail, validateResetPasswordOTP, resetPassword} from '../controllers/authControllers.js'
import { authorization } from '../middlewares/authorization.js'

const authRouter = Router()

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.get('/userdata', authorization, userData)
authRouter.post('/validateresetpasswordemail', validateResetPasswordEmail)
authRouter.post('/validateresetpasswordotp', validateResetPasswordOTP)
authRouter.post('/resetpassword', resetPassword)

export default authRouter