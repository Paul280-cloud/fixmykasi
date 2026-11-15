import type { ReactNode } from 'react';
import Header from './Header';
import TabBar from './TabBar';

// Layout for the tab screens S4 to S11: header, content and tab bar.
export default function TabScreen({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen pb-20 lg:pb-0 lg:pl-60">
      <Header title={title} />
      <main className="mx-auto max-w-content px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      <TabBar />
    </div>
  );
}
