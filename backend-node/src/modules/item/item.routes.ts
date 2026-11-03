import { Router } from 'express';
import { ItemController } from './item.controller';
import { authenticate, optionalAuthenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  createItemSchema,
  updateItemSchema,
  listItemsQuerySchema,
  itemIdParamSchema,
} from './item.validation';

const router = Router();

// Stats aggregation for dashboard overview
router.get('/stats', optionalAuthenticate, ItemController.stats);

// Read list with search, status filter, and pagination
router.get(
  '/',
  optionalAuthenticate,
  validate({ query: listItemsQuerySchema }),
  ItemController.list
);

// Get single item by ID
router.get(
  '/:id',
  optionalAuthenticate,
  validate({ params: itemIdParamSchema }),
  ItemController.getById
);

// Protected mutation routes (requires Bearer token)
router.post(
  '/',
  authenticate,
  validate({ body: createItemSchema }),
  ItemController.create
);

router.put(
  '/:id',
  authenticate,
  validate({ params: itemIdParamSchema, body: updateItemSchema }),
  ItemController.update
);

router.patch(
  '/:id',
  authenticate,
  validate({ params: itemIdParamSchema, body: updateItemSchema }),
  ItemController.update
);

router.delete(
  '/:id',
  authenticate,
  validate({ params: itemIdParamSchema }),
  ItemController.delete
);

export const itemRoutes = router;

