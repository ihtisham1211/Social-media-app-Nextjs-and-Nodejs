import { UsernamePasswordInput } from "src/resolvers/UsernamePasswordInput";

export const validateRegister = (options: UsernamePasswordInput) => {
  if (options.username.length < 2) {
    return [
      {
        field: "username",
        message: "Username and Password should not be less than 2",
      },
    ];
  }
  if (options.password.length < 2) {
    return [
      {
        field: "password",
        message: "Password should not be less than 2",
      },
    ];
  }

  if (options.email.length < 2) {
    return [
      {
        field: "email",
        message: "email should not be less than 2",
      },
    ];
  }

  if (!options.email.includes("@")) {
    return [
      {
        field: "email",
        message: "invalid email",
      },
    ];
  }

  return null;
};
