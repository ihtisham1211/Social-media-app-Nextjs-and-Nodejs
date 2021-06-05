import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ObjectType, Field } from "type-graphql";


// Type-ORM
// Entity is used to define the table.
// Columns is used to define fields of the table.

// GraphQL
// ObjectTypes is used to return the whole table to GQL.
// Field is used to return the fields that we want in our GQL requests.

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  title!: string;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updateAt: Date;
}
