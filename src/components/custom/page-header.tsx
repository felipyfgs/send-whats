import React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function PageHeader({
  className,
  children,
  ...props
}: PageHeaderProps) {
  return (
    <div className={cn("px-1", className)} {...props}>
      {children}
    </div>
  );
}

interface PageHeaderTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function PageHeaderTitle({
  className,
  children,
  ...props
}: PageHeaderTitleProps) {
  return (
    <h1
      className={cn("text-2xl font-bold tracking-tight", className)}
      {...props}
    >
      {children}
    </h1>
  );
}

interface PageHeaderDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export function PageHeaderDescription({
  className,
  children,
  ...props
}: PageHeaderDescriptionProps) {
  return (
    <p
      className={cn("text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  );
}

interface PageHeaderActionsProps extends React.HTMLAttributes<HTMLDivElement> {}

export function PageHeaderActions({
  className,
  children,
  ...props
}: PageHeaderActionsProps) {
  return (
    <div
      className={cn("flex items-center space-x-2", className)}
      {...props}
    >
      {children}
    </div>
  );
} 