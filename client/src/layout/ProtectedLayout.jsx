import ProtectRoute from "../auth/ProtectRoute";
import MainLayout from "./MainLayout";

const ProtectedLayout = ({ children, user }) => (
  <ProtectRoute user={user}>
    <MainLayout>{children}</MainLayout>
  </ProtectRoute>
);

export default ProtectedLayout;
