import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

// Mikro-orm
// Entity is used to define the table.
// Property is used to define fields of the table.

// GraphQL
// ObjectTypes is used to return the whole table to GQL.
// Field is used to return the fields that we want in our GQL requests.

@ObjectType()
@Entity()
export class User {
  @Field()
  @PrimaryKey()
  id!: number;

  @Field()
  @Property({ type: "text", unique: true })
  username!: string;

  @Property({ type: "text" })
  password!: string;

  @Field(() => String)
  @Property({ type: "date" })
  createdAt = new Date();

  @Field(() => String)
  @Property({ type: "date", onUpdate: () => new Date() })
  updateAt = new Date();
}
