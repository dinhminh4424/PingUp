// Đây là file tạo "trung tâm realtime" cho app chat.

// 1. Import thư viện
import { Server } from "socket.io"; // thư viện tạo kết nối realtime giữa client ↔ server
import express from "express"; // → framework backend để xử lý API
import http from "http"; // → module Node.js để tạo HTTP server
import { socketAuthMiddleware } from "../middlewares/SocketMiddlewares.js";
import Connection from "../models/Connection.js";
import Follow from "../models/Follow.js";

// 2. Tạo app Express
// Khởi tạo ứng dụng Express.

// Đây là nơi bạn sẽ khai báo route API như:
//                                            app.get("/api", (req,res)=>{})
const app = express();

// 3. Tạo HTTP server từ Express
// const server = http.createServer(app); ➡ tạo server HTTP và dùng Express để xử lý request.
// Lý do cần bước này:
//      ➡ Socket.IO cần attach vào HTTP server thật để dùng chung port.
const server = http.createServer(app); // tạo server HTTP và dùng Express để xử lý request.

// Tạo Socket.IO server
// Ý nghĩa:
//      Gắn Socket.IO vào server HTTP.
//      Config CORS để cho phép frontend kết nối.

const io = new Server(server, {
  // Config CORS để cho phép frontend kết nối.
  // Gắn Socket.IO vào server HTTP.
  cors: {
    origin: process.env.CLIENT_URL, // → Chỉ cho phép domain frontend truy cập (ví dụ http://localhost:5173)
    credentials: true, // → Cho phép gửi cookie / token.
  },
});

io.use(socketAuthMiddleware);

const onlineUsers = new Map(); // Map to track online user IDs -> Set of socket IDs

// Hàm phát sóng danh sách online được cá nhân hóa (chỉ gửi bạn bè + follow)
const broadcastOnlineUsers = () => {
  const activeUserIds = Array.from(onlineUsers.keys());
  const sockets = io.sockets.sockets; // Map of socketId -> socket

  sockets.forEach((s) => {
    const sUserId = s.user?._id?.toString();
    if (!sUserId || !s.relatedUserIds) return;

    // Chỉ giữ lại những người online mà socket này follow, kết bạn hoặc chính socket này
    const filteredOnlineUsers = activeUserIds.filter(
      (uid) => uid === sUserId || s.relatedUserIds.has(uid)
    );

    s.emit("getOnlineUsers", filteredOnlineUsers);
  });
};

// Lắng nghe kết nối socket
io.on("connection", async (socket) => {
  //  Sự kiện "connection" chạy khi:
  //    👉 Một client connect tới server.
  //     socket là đối tượng đại diện cho client đó.

  const user = socket.user;
  const userIdStr = user._id.toString();

  // Tải trước danh sách bạn bè và follow để lưu vào RAM của socket (Tối ưu tốc độ cực cao)
  try {
    const [connections, follows] = await Promise.all([
      Connection.find({
        $or: [{ userA: user._id }, { userB: user._id }],
      }),
      Follow.find({ follower: user._id }),
    ]);

    const relatedUserIds = new Set();
    connections.forEach((c) => {
      const friendId = c.userA.toString() === userIdStr ? c.userB.toString() : c.userA.toString();
      relatedUserIds.add(friendId);
    });
    follows.forEach((f) => {
      relatedUserIds.add(f.following.toString());
    });

    socket.relatedUserIds = relatedUserIds;
  } catch (error) {
    console.error("Lỗi khi tải quan hệ của socket:", error);
    socket.relatedUserIds = new Set();
  }

  if (!onlineUsers.has(userIdStr)) {
    onlineUsers.set(userIdStr, new Set());
  }
  onlineUsers.get(userIdStr).add(socket.id);

  // Phát sóng danh sách online cá nhân hóa
  broadcastOnlineUsers();

  // Mỗi user có 1 room riêng theo id => mốt sau này có gì gửi vào room với id us => MỞ RỘNG DỰ ÁN
  socket.join(userIdStr);

  console.log(
    ` SOCKET.io [socket/index.js]: User ${user._id} - ${user.username}  Kết Nối (online) Với: ${socket.id} `,
  ); // socket.id = ID duy nhất của client.

  console.log(
    ` SOCKET.io [socket/index.js]: User ${user._id} - ${user.username}  đã vô room: ${userIdStr}`,
  );

  // Lắng nghe sự kiện disconnect
  socket.on("disconnect", () => {
    if (onlineUsers.has(userIdStr)) {
      const userSockets = onlineUsers.get(userIdStr);
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        onlineUsers.delete(userIdStr);
      }
    }
    
    // Phát sóng danh sách online mới
    broadcastOnlineUsers();

    console.log(
      ` SOCKET.io [socket/index.js]: User ${user._id} - ${user.userName} Đã Ngắt Kết Nối (offline) Với: ${socket.id}`,
    );
  });
});

// Cho phép file khác import dùng:
export { io, server, app, onlineUsers };
