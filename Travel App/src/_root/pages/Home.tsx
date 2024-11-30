import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import { useSignOutAccount } from "@/lib/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const { mutate: signOut, isSuccess } = useSignOutAccount();
  const { user } = useUserContext();

  const name = user.name;

  useEffect(() => {
    if (isSuccess) navigate(0);
  }, [isSuccess]);

  return (
    <div>
      <div>Hello, {name}!</div>
      <Button onClick={() => signOut()}>Sign Out</Button>
      <ModeToggle />
    </div>
  );
};

export default Home;
