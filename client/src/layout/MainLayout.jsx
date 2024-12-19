import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

// Layout Component for non-protected routes
const MainLayout = ({ children }) => (
  <>
    <Navbar />
    <main className="main">{children}</main>
    <Footer />
  </>
);

export default MainLayout;
