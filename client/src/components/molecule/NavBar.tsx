import { Box, Flex, Link } from "@chakra-ui/layout";
import React from "react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../../generated/graphql";
import { Button } from "@chakra-ui/button";
import { isServer } from "../../utils/isServer";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  // fetching works as loading so its good to use it.

  // pause true means this query is not going to run on server side.
  // but we have to define a window variable that check if we are on server or not.
  // + point: Nextjs on run the server side page once we are on that page,
  // if we go back it will rendered as client side.
  // for that we need to check if we are on server or not.
  // isServer() will tell us that.
  const [{ data, fetching }] = useMeQuery({
    pause: isServer(),
  });

  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();

  // MIND BLOWN here <------
  let body = null;
  //data is loading
  if (fetching) {
    body = <>Loading data... </>;

    // user not logged in
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link m={3}>Login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link m={3}>Register</Link>
        </NextLink>
      </>
    );
    // user logged in
  } else {
    body = (
      <Flex>
        <Box mr="7">{data.me.username}</Box>
        <Button
          isLoading={logoutFetching}
          fontSize="small"
          variant="link"
          onClick={() => {
            logout();
          }}
        >
          Logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex bg="teal" p={"4"}>
      <Box ml={"auto"}>{body}</Box>
    </Flex>
  );
};
