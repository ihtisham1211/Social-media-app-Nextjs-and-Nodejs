import { MyContext } from "src/types";
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { User } from "../entities/User";
import argon2 from "argon2";
import { COOKIE_NAME,FORGET_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendmails";
import {v4} from "uuid"
import { getConnection } from "typeorm";

// Resolver is to start a resolver
// Query is to get something for DB.
// Mutation is to add remove or update in DB.
// CTX is to get data that is passed in context from index.ts
// Arg is to accept arguments.
// inside Mutation and Query is the thing that the function will return.
// InputTypes is used to create object type of input.
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
  me(@Ctx() { req }: MyContext) {
    if (!req.session.userId) {
      return null;
    }
    return User.findOne(req.session.userId);
  }

  @Mutation(() => UserResponse)
  // create user
  async registerUser(
    @Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {

    const errors = validateRegister(options);
    if(errors){
      return {errors};
    }

    const hashPassword = await argon2.hash(options.password);

    let user;
    try {
      const result = await getConnection().createQueryBuilder().insert().into(User).values({
        username: options.username,
        password: hashPassword,
        email:options.email,
      }).returning("*").execute()//query builder to build queries without ORM
      user = result.raw[0];
    } catch (error) {
      if (error.code === "23505") {
        return {
          errors: [{ field: "username", message: "username or email already taken" },
          { field: "email", message: "username or email already taken" }],
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
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {

    const user = await User.findOne(usernameOrEmail.includes("@") ? { where:{email: usernameOrEmail}}:{ where:{username: usernameOrEmail}});
    if (!user)
      return {
        errors: [{ field: "usernameOrEmail", message: "could not find username or email" }],
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
    @Ctx(){redisClient}:MyContext,
    @Arg("email") email:string,
  ){
    // Use where, when item is not PK
    const user = await User.findOne({where:{email}}) 
    if(!user){
      return true;
    }
    const token = v4();
    await redisClient.set(FORGET_PASSWORD_PREFIX + token, user.id,"ex",1000*60*60*24*3)
    sendEmail(email,    
      `<a href="http://localhost:3000/change-password/${token}">reset password</a>`
    );
    return true;
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Ctx() { redisClient, req }: MyContext,
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,

  ): Promise<UserResponse> {
    if (newPassword.length < 2) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "length should not be less than 2",
          }
        ]
      };
    }
    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redisClient.get(key)
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "token expired",
          }
        ]
      };
    }
    const userID = parseInt(userId) 
    const user = await User.findOne(userID);
    if (!user) {
      return {
        errors: [{
          field: "token",
          message: "token expired",
        }]
      };
    }
    await User.update({id:userID},{
      password: await argon2.hash(newPassword)
    })
    await redisClient.del(key);

    // login user after change password
    req.session.userId = user.id;
    return { user };
  }
}
 