const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/user');
const Post = require('./models/post');
const Comment = require('./models/comment');

const resolvers = {
    posts: async () => {
        return Post.find().populate('author');
      },
      post: async ({ id }) => {
        return Post.findById(id).populate('author');
      },
      comments: async ({ postId, page = 1, limit = 10 }) => {
        const skip = (page - 1) * limit;
        return Comment.find({ post: postId })
          .skip(skip)
          .limit(limit)
          .populate(['post', 'author']);
      },
      me: async (args, context) => {
        if (!context.userId) {
            throw new Error('Unauthorized');
        }
        return User.findById(context.userId);
      },
      createPost: async ({ input }, context) => {
        if (!context.userId) {
          throw new Error('Unauthorized');
        }
        const post = new Post({
          title: input.title,
          content: input.content,
          author: new mongoose.Types.ObjectId(context.userId),
        });
        await post.save();
        const populatedPost = await post.populate('author');
        return populatedPost;
      },  
      updatePost: async ({ id, input }, context) => {
        if (!context.userId) {
          throw new Error('Unauthorized');
        }
        const post = await Post.findById(id);
        if (!post) {
          throw new Error('Post not found');
        }
        if (post.author.toString() !== context.userId) {
          throw new Error('Unauthorized');
        }
        post.title = input.title;
        post.content = input.content;
        await post.save();
        const populatedPost = await post.populate('author');
        return populatedPost;
      },
      deletePost: async ({ id }, context) => {
        if (!context.userId) {
          throw new Error('Unauthorized');
        }
        const post = await Post.findById(id);
        if (!post) {
          throw new Error('Post not found');
        }
        if (post.author.toString() !== context.userId) {
          throw new Error('Unauthorized');
        }
        await post.deleteOne();
        return true;
      },
      createComment: async ({ input }, context) => {
        if (!context.userId) {
          throw new Error('Unauthorized');
        }
        const post = await Post.findById(input.postId);
        if (!post) {
          throw new Error('Post not found');
        }
        const comment = new Comment({
          text: input.text,
          post: input.postId,
          author: new mongoose.Types.ObjectId(context.userId),
    
        });
        await comment.save();
        const populatedComment = await comment.populate(['post', 'author']);
        return populatedComment;
      },
      createUser: async ({ input }) => {
        const existingUser = await User.findOne({ username: input.username });
        if (existingUser) {
          throw new Error('Username already exists');
        }
        const hashedPassword = await bcrypt.hash(input.password, 10);
        const user = new User({
          username: input.username,
          password: hashedPassword,
        });
        await user.save();
        return user;
      },
      login: async ({ username, password }) => {
        const user = await User.findOne({ username });
        if (!user) {
          throw new Error('Invalid username or password');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          throw new Error('Invalid username or password');
        }
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
        return token;
      },
};

module.exports = resolvers;
