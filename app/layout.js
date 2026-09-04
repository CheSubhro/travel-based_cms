
import "./globals.css";
import siteConfig from "@/config/site";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function RootLayout({ children }) {
  return (
      <html lang="en">
          <body>
              <Navbar />
              {children}
              <Footer />
          </body>
      </html>
  );
}
