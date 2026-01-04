import {Router} from 'express'
import {register, login, validateResetPasswordEmail, validateResetPasswordOTP, resetPassword, refreshToken} from '../controllers/authControllers.js'

const authRouter = Router()

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/refresh-token', refreshToken)
authRouter.post('/validateresetpasswordemail', validateResetPasswordEmail)
authRouter.post('/validateresetpasswordotp', validateResetPasswordOTP)
authRouter.post('/resetpassword', resetPassword)

export default authRouter