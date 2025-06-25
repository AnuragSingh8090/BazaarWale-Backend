import {Router} from 'express'
import {register, login, userData, resetPassword} from '../controllers/authControllers.js'
import { authorization } from '../middlewares/authorization.js'

const authRouter = Router()

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.get('/userdata', authorization, userData)
authRouter.post('/resetpassword', resetPassword)

export default authRouter