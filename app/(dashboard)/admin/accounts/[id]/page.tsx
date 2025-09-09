import React from "react";
import prisma from "@/lib/prisma";
import Heading from "@/components/ui/heading";
import AccountForm from "@/components/forms/account-form";

const Page = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const params = await props.params;

  const initialData = await prisma.user.findUnique({
    where: {
      id: params.id,
    },
  });

  const title = initialData
    ? `Edit Account: ${initialData.name}`
    : "Create new account";
  const description = initialData
    ? "Update the details of the account."
    : "Fill all the required fields to create a new account.";
  return (
    <div className="p-6">
      <Heading title={title} description={description} />
      <div className="mt-5">
        <AccountForm initialData={initialData} />
      </div>
    </div>
  );
};

export default Page;
