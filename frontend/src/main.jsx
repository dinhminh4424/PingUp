import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { AuthProvider } from "./contexts/AuthContext.jsx";
import { NotificationProvider } from "./contexts/NotificationContext.jsx";
import { SocketProvider } from "./contexts/SocketContext.jsx";
import { FeedProvider } from "./contexts/FeedContext.jsx";
import { ChatProvider } from "./contexts/ChatContext.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { TooltipProvider } from "@/components/ui/tooltip";

import { BrowserRouter } from "react-router-dom";
import SystemModal from "./components/SystemModal";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <ChatProvider>
            <NotificationProvider>
              <FeedProvider>
                <TooltipProvider>
                  <SystemModal />
                  <App />
                </TooltipProvider>
              </FeedProvider>
            </NotificationProvider>
          </ChatProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>,
);
