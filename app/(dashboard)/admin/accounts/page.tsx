import React from "react";
import Heading from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { DataTable } from '@/components/globals/data-table';
import { columns } from './_components/columns';

const Page = async () => {
  const data = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <Heading
          title="Manage Candidates"
          description="Overview of all candidates. You can create, edit and delete the candidates."
        />
        <Button size="sm">
          <Link
            href="/admin/accounts/create"
            className="flex items-center gap-2"
          >
            <Plus className="size-4" />
            Create new account
          </Link>
        </Button>
      </div>
      <div className="mt-5">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
};

export default Page;
