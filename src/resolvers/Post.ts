import { Post } from "../entities/Post";
import { Arg, Int, Mutation, Query, Resolver } from "type-graphql";

// Resolver is to start a resolver
// Query is to get something for DB.
// Mutation is to add remove or update in DB.
// CTX is to get data that is passed in context from index.ts
// Arg is to accept arguments.
// inside Mutation and Query is the thing that the function will return.

@Resolver()
export class PostResolver {
  //get All Posts
  @Query(() => [Post])
  getPosts(): Promise<Post[]> {
    return Post.find();
  }

  // get a single post by id
  @Query(() => Post, { nullable: true })
  getPost(
    @Arg("id", () => Int) id: number
    // "id", () => Int is the parameter we are accepting AND
    // id: number is the type
  ): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  // create post
  @Mutation(() => Post)
  async createPost(@Arg("title", () => String) title: string): Promise<Post> {
    return Post.create({ title }).save();
  }

  // update post
  @Mutation(() => Post)
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("title", () => String, { nullable: true }) title: string
  ): Promise<Post | undefined> {
    const post = await Post.findOne(id);

    if (!post) return undefined;

    if (typeof title !== "undefined") {
      await Post.update({ id }, { title });
    }
    return post;
  }

  // Delete post
  @Mutation(() => Boolean)
  async deletePost(@Arg("id", () => Int) id: number): Promise<boolean> {
    await Post.delete(id);
    return true;
  }
}
