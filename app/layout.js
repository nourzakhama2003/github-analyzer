import '../styles/globals.css';

export const metadata = {
  title: 'GitHub Repository Analyzer',
  description: 'Advanced GitHub repository analysis tool',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
