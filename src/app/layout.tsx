import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Career-Ops: AI-Native Career Management',
  description: 'Intelligent job application automation and career orchestration platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
