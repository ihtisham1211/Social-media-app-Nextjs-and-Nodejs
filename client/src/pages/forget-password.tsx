import { Box, Link, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import router from "next/router";
import React, {useState} from "react";
import InputField from "../components/atom/InputField";
import Wrapper from "../components/Wrapper";
import { createUrqlClient } from "../utils/createUrqlClient";
import { toErrorMap } from "../utils/toErrorMap";
import {useForgotPasswordMutation} from "../generated/graphql.tsx"

export const ForgetPassword: React.FC<{}> = ({}) => {
    const [complete,setComplete] = useState();
    const [,forgotPassword] = useForgotPasswordMutation();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: "" }}
        onSubmit={async (values) => {
          await forgotPassword(values);
          setComplete(true);
        }}
      >
        {({ isSubmitting }) => complete ? <Box>Link has been sent to your email</Box> : (
          <Form>
            <Box mt={4}>
              <InputField
                placeholder="Enter Email"
                label="Email"
                name="email"
                aria-labelledby="Enter Email"
                type="email"
              />
            </Box>
            <Button
              mt={4}
              isLoading={isSubmitting}
              colorScheme="teal"
              type="submit"
            >
              Forgot password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(ForgetPassword);
