import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { clerkEnabled } from '@/lib/clerk';
import { Playfair_Display, PT_Sans } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { getSiteSettings } from '@/lib/content-service';
import { getMenu } from '@/lib/nav';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-headline',
  display: 'swap',
});

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await getSiteSettings();
  return {
    title: siteSettings.heroTitle,
    description: siteSettings.heroSubtitle,
    alternates: {
      canonical: '/',
      languages: siteSettings.languages.reduce<Record<string, string>>((acc, lang) => {
        acc[lang] = lang === siteSettings.defaultLanguage ? '/' : `/${lang}`;
        return acc;
      }, {}),
    },
    openGraph: {
      title: siteSettings.heroTitle,
      description: siteSettings.heroSubtitle,
      images: siteSettings.heroMediaUrl ? [{ url: siteSettings.heroMediaUrl }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: siteSettings.heroTitle,
      description: siteSettings.heroSubtitle,
      images: siteSettings.heroMediaUrl ? [siteSettings.heroMediaUrl] : undefined,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteSettings = await getSiteSettings();
  const locale = siteSettings.defaultLanguage || 'en';
  const [headerMenu, footerMenu] = await Promise.all([
    getMenu('header', locale),
    getMenu('footer', locale),
  ]);

  const body = (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={cn(
          playfair.variable,
          ptSans.variable,
          'min-h-screen bg-background font-body antialiased'
        )}
      >
        <div className="relative flex min-h-screen flex-col">
          <Header menu={headerMenu.items ?? []} siteSettings={siteSettings} />
          <main className="flex-1">{children}</main>
          <Footer menu={footerMenu.items ?? []} siteSettings={siteSettings} />
        </div>
        <Toaster />
      </body>
    </html>
  );

  return clerkEnabled ? <ClerkProvider>{body}</ClerkProvider> : body;
}
