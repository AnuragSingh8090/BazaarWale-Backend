import { Router } from 'express';
import { contactUs , newsletter} from '../controllers/contactControllers.js';

const contactRouter = Router();

contactRouter.post('/contact', contactUs);
contactRouter.post('/newsletter', newsletter);

export default contactRouter;