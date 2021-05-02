import { Field, InputType } from "type-graphql";

// Resolver is to start a resolver
// Query is to get something for DB.
// Mutation is to add remove or update in DB.
// CTX is to get data that is passed in context from index.ts
// Arg is to accept arguments.
// inside Mutation and Query is the thing that the function will return.
// InputTypes is used to create object type of input.

@InputType()
export class UsernamePasswordInput {
  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  password: string;
} // we cannot return this to GQL endpoint, we can only return ObjectTypes.
