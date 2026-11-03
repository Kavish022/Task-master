import { Router } from 'express';
import { CommentController } from './comment.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createCommentSchema, updateCommentSchema } from './comment.validation';

const router = Router();

router.use(authenticate);

router.get('/tasks/:taskId/comments', CommentController.list);
router.post(
  '/tasks/:taskId/comments',
  validate({ body: createCommentSchema }),
  CommentController.add
);

router.patch(
  '/comments/:commentId',
  validate({ body: updateCommentSchema }),
  CommentController.update
);

router.delete('/comments/:commentId', CommentController.delete);

export const commentRoutes = router;
