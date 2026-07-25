import React from 'react';
import { cn } from '../lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse bg-[#121318] border border-[#1f212a] rounded-md", className)}
      {...props}
    />
  );
}

