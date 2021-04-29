import React from "react";
import { Formik, Form } from "formik";
import Wrapper from "../components/Wrapper";
import InputField from "../components/atom/InputField";
import { Box } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/button";
import { useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import { createUrqlClient } from "../utils/createUrqlClient";
import { withUrqlClient } from "next-urql";

interface loginrProps {}

//on Button click onSubmit in formik is excuted.
export const Login: React.FC<loginrProps> = ({}) => {
  const [, login] = useLoginMutation(); //register is the methord that we call to use useMutation function at the back-end
  const router = useRouter();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login({ options: values });
          if (response.data?.loginUser.errors) {
            setErrors(toErrorMap(response.data.loginUser.errors));
          } else if (response.data?.loginUser.user) {
            // User good to go.
            router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              placeholder="Enter Username"
              label="Username"
              name="username"
              aria-labelledby="Enter Username"
            />
            <Box mt={4}>
              <InputField
                placeholder="Enter Password"
                label="Password"
                name="password"
                aria-labelledby="Enter Password"
                type="password"
              />
            </Box>
            <Button
              mt={4}
              isLoading={isSubmitting}
              colorScheme="teal"
              type="submit"
            >
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};
export default withUrqlClient(createUrqlClient)(Login);
