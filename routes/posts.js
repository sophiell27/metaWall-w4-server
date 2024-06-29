const expres = require('express');

const router = expres.Router();

const Post = require('../models/postModel');
const Comment = require('../models/commentModel');
const successHandle = require('../services/successHandle');
const handleErrorAsync = require('../services/handleErrorAsync');
const appError = require('../services/appError');
const { isAuth } = require('../services/auth');
const { VALIDATE_ERROR_MESSAGE } = require('../constants/validate');

router.post(
  '/',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    if (req.body.content) {
      const newPost = await Post.create({
        user: req.user.id,
        content: req.body.content,
      });
      return successHandle(res, newPost);
    }
    next(appError(400, 'data is required'));
  }),
);

router.get(
  '/',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const { keyword, timeSort } = req.query;
    const filter = keyword ? { content: new RegExp(req.query.keyword) } : {};
    const order = timeSort === 'desc' ? '-createdAt' : 'createdAt';
    const posts = await Post.find(filter)
      .populate({
        path: 'user',
        select: 'username imageUrl',
      })
      .sort(order);
    successHandle(res, posts);
  }),
);
router.get(
  '/:id',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    const { id } = req.params;

    const post = await Post.findById(id).populate({
      path: 'user',
      select: 'username imageUrl',
    });

    successHandle(res, post);
  }),
);

router.post(
  '/:post_id/comment',
  handleErrorAsync(async (req, res, next) => {
    const { comment, post, user } = req.body;
    if (!comment || !post || !user) {
      return next(appError(400, VALIDATE_ERROR_MESSAGE.FIELDS_MISSING));
    }
    const newComment = await Comment.create(req.body);
    successHandle(res, newComment);
  }),
);

router.delete(
  '/comment/:comment_id',
  handleErrorAsync(async (req, res, next) => {
    const { comment_id } = req.params;

    const result = await Comment.findByIdAndDelete(comment_id, { new: true });
    if (result) {
      return successHandle(res, result, 200, 'comment had been deleted');
    }
    return next(appError(400, 'unable to delete comment'));
  }),
);

module.exports = router;
