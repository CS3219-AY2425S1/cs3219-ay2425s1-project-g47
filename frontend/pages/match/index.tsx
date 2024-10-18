"use client";

import MatchingPageBody from "@/components/matching/MatchingPageBody";
import DefaultLayout from "@/layouts/default";

const MatchPage = () => {
  return (
    <>
      <DefaultLayout isLoggedIn={true}>
        <MatchingPageBody />
      </DefaultLayout>
    </>
  );
};

export default MatchPage;
