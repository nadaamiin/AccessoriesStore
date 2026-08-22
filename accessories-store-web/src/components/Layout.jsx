import Navbar from "./Navbar";
import Footer from "./Footer";
import AnnouncementBanner from "./AnnouncementBanner";
import CartDrawer from "./CartDrawer";
import FavoritesDrawer from "./FavoritesDrawer";

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBanner />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <FavoritesDrawer />
    </div>
  );
}

export default Layout;