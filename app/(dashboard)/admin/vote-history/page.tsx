import Image from "next/image";
import React from "react";

const Page = () => {
  return (
	<div className="flex items-center justify-center flex-col min-h-screen">
	  <Image
		src="/under-construction.svg"
		alt="Under Construction"
		width={600}
		height={600}
	  />
	  <h3 className="text-2xl font-bold mt-3">
		This page is under construction
	  </h3>
	  <p className="text-muted-foreground mt-2">
		We&apos;re working hard to bring you this page. Stay tuned!
	  </p>
	</div>
  );
};

export default Page;
