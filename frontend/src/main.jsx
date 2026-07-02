import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { AuthProvider } from "./contexts/AuthContext.jsx";
import { NotificationProvider } from "./contexts/NotificationContext.jsx";
import { SocketProvider } from "./contexts/SocketContext.jsx";
import { FeedProvider } from "./contexts/FeedContext.jsx";

import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <FeedProvider>
            <App />
          </FeedProvider>
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  </BrowserRouter>,
);
