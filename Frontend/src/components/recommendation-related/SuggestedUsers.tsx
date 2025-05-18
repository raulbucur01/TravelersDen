import SuggestedUserCard from "./SuggestedUserCard";

export const SuggestedUsers = () => {
  return (
    <div className="home-creators">
      <h1 className="text-2xl font-semibold text-dm-light">Suggested Users</h1>
      <div className="flex flex-col gap-4">
        <SuggestedUserCard />
        <SuggestedUserCard />
        <SuggestedUserCard />
      </div>
    </div>
  );
};
