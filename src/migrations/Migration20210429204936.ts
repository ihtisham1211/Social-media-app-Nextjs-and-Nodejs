import { Migration } from "@mikro-orm/migrations";

export class Migration20210429204936 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "user" ("id" serial primary key, "email" text not null, "username" text not null, "password" text not null, "created_at" timestamptz(0) not null, "update_at" timestamptz(0) not null);'
    );
    this.addSql(
      'alter table "user" add constraint "user_email_unique" unique ("email");'
    );
    this.addSql(
      'alter table "user" add constraint "user_username_unique" unique ("username");'
    );
  }
}
