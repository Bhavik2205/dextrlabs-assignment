const { buildSchema } = require('graphql');

module.exports = buildSchema(`
type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
    comments(page: Int, limit: Int): [Comment!]!
  }

  type Comment {
    id: ID!
    text: String!
    post: Post!
    author: User!
  }

  type User {
    id: ID!
    username: String!
  }

  input PostInput {
    title: String!
    content: String!
  }

  input CommentInput {
    postId: ID!
    text: String!
  }

  input UserInput {
    username: String!
    password: String!
  }

  type Query {
    posts: [Post!]!
    post(id: ID!): Post
    comments(postId: ID!, page: Int, limit: Int): [Comment!]!
    me: User
  }

  type Mutation {
    createPost(input: PostInput): Post
    updatePost(id: ID!, input: PostInput): Post
    deletePost(id: ID!): Boolean
    createComment(input: CommentInput): Comment
    createUser(input: UserInput): User
    login(username: String!, password: String!): String
  }
`);
