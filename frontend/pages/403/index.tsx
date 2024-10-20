"use client";

import DefaultLayout from "@/layouts/default";

const The403Page = () => {
  return (
    <>
      <DefaultLayout isLoggedIn={true}>
        <div className="flex justify-center">
          <p>403 Forbidden Access</p>
        </div>
      </DefaultLayout>
    </>
  );
};

export default The403Page;
