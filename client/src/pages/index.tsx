import { NavBar } from "../components/molecule/NavBar";
import { createUrqlClient } from "../utils/createUrqlClient";
import { withUrqlClient } from "next-urql";
import { usePostQuery } from "../generated/graphql";

const Index = () => {
  const [{ data }] = usePostQuery();
  return (
    <>
      <NavBar />
      hello world
    </>
  );
};

//this is done for server side rendering.
// ssr true means server side rendering is ON.....
export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
