import React from "react";

type Props = { children: React.ReactNode };

function PreAuthLayout({ children }: Props) {
  return <main className="flex-1 overflow-auto">{children}</main>;
}

export default PreAuthLayout;
