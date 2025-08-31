import Sidebar from "../Dashboard/Sidebar";
import { useSession } from "../SessionProvider";
import isNull from "lodash/isNull";

const Layout = () => {
  const { session } = useSession();
  const hasSession = !isNull(session);
  return (
    <div className="flex h-screen">
      {hasSession && <Sidebar />}

      {/* Main content area */}
    </div>
  );
};

export default Layout;
