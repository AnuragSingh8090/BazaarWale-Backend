import { Router } from 'express';
import { contactUs } from '../controllers/contactControllers.js';

const contactRouter = Router();

contactRouter.post('/contact', contactUs);

export default contactRouter;