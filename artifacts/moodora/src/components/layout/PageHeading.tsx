import type { ReactNode } from "react";

interface PageHeadingProps {
  title: string;
  description: string;
  /** Main actions for the page */
  children?: ReactNode;
}

export function PageHeading({ title, description, children }: PageHeadingProps) {
  return (
    <div className="page-heading">
      <div>
        <h1 className="display">{title}</h1>
        <p className="lede">{description}</p>
      </div>
      {children && <div className="row">{children}</div>}
    </div>
  );
}
