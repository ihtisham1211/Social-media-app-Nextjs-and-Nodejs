import { MyContext } from "src/types";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { User } from "../entities/User";
import argon2 from "argon2";
import { SqlEntityManager } from "@mikro-orm/knex";
import { COOKIE_NAME } from "../constants";

// Resolver is to start a resolver
// Query is to get something for DB.
// Mutation is to add remove or update in DB.
// CTX is to get data that is passed in context from index.ts
// Arg is to accept arguments.
// inside Mutation and Query is the thing that the function will return.
// InputTypes is used to create object type of input.

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  password: string;
} // we cannot return this to GQL endpoint, we can only return ObjectTypes.

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { em, req }: MyContext) {
    if (!req.session.userId) {
      return null;
    }
    const user = await em.findOne(User, { id: req.session.userId });
    return user;
  }

  @Mutation(() => UserResponse)
  // create user
  async registerUser(
    @Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length < 2 || options.password.length < 2)
      return {
        errors: [
          {
            field: "username",
            message: "Username and Password should not be less than 2",
          },
        ],
      };
      if (options.password.length < 2)
      return {
        errors: [
          {
            field: "password",
            message: "Password should not be less than 2",
          },
        ],
      };
      if (options.email.includes("@"))
      return {
        errors: [
          {
            field: "email",
            message: "invalid email",
          },
        ],
      };

    const hashPassword = await argon2.hash(options.password);
    let user;
    try {
     const result = await (em as SqlEntityManager).createQueryBuilder(User).getKnexQuery().insert({
        username: options.username,
        password: hashPassword,
        email:options.email,
        created_at:new Date(),
        update_at:new Date()
      }).returning("*"); //query builder to build queries without ORM
      user = result[0];
    } catch (error) {
      if (error.code === "23505") {
        return {
          errors: [{ field: "username", message: "username already taken" }],
        };
      }
    }
    req.session.userId = user.id; // anything stored here will be stored in the cookie.
    return { user };
  }

  // Login user
  @Mutation(() => UserResponse)
  async loginUser(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {

    const user = await em.findOne(User,usernameOrEmail.includes("@") ? { email: usernameOrEmail}:{ username: usernameOrEmail});
    if (!user)
      return {
        errors: [{ field: "username or email", message: "could not find username or email" }],
      };

    const validate = await argon2.verify(user.password, password);

    if (!validate)
      return {
        errors: [{ field: "password", message: "incorrect password" }],
      };

    req.session.userId = user.id; // anything stored here will be stored in the cookie.
    return {
      user,
    };
  }

  @Mutation(()=> Boolean)
  logout(
    @Ctx(){req,res}: MyContext
  ){
    return new Promise ((resolve) => req.session.destroy((err) =>{
      res.clearCookie(COOKIE_NAME);
      if(err){
        console.log(err);
        resolve(false)
        return;
      }
      resolve(true)
    }))
  }

  @Mutation(()=> Boolean)
   async forgotPassword(
    @Ctx(){em}:MyContext,
    @Arg("email") email:string,
  ){
    const user = await em.findOne(User,{email}) 
  }
}
