import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Acme Dashboard',
    default: 'Acme Dashboard',
  },
  description: 'The official Next.js Learn Dashboard built with App Router.',
  metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
};
// The %s in the template will be replaced with the specific page title.
// Now, in your /dashboard/invoices page, you can add the page title

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* <body>{children}</body> */}
      {/* you're also adding the Tailwind antialiased class which smooths out the
      // font. It's not necessary to use this class, but it adds a nice touch. */}

      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}

// You can also include a metadata object from any layout.js or page.js file to add 
// additional page information like title and description. Any metadata in layout.js 
// will be inherited by all pages that use it.

// read more - https://nextjs.org/learn/dashboard-app/adding-metadata
