import React, { type ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  maxWidth?: 'default' | 'full' | 'narrow';
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth = 'default',
}) => {
  const maxClass =
    maxWidth === 'full' ? 'w-full' : maxWidth === 'narrow' ? 'max-w-4xl' : 'max-w-7xl';

  return (
    <main className={`mx-auto w-full px-4 py-6 md:px-8 md:py-8 ${maxClass} space-y-6`}>
      {children}
    </main>
  );
};
