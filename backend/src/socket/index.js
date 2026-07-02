// Đây là file tạo "trung tâm realtime" cho app chat.

// 1. Import thư viện
import { Server } from "socket.io"; // thư viện tạo kết nối realtime giữa client ↔ server
import express from "express"; // → framework backend để xử lý API
import http from "http"; // → module Node.js để tạo HTTP server
import { socketAuthMiddleware } from "../middlewares/SocketMiddlewares.js";

// 2. Tạo app Express
// Khởi tạo ứng dụng Express.

// Đây là nơi bạn sẽ khai báo route API như:
//                                          app.get("/api", (req,res)=>{})
const app = express();

// 3. Tạo HTTP server từ Express
// const server = http.createServer(app); ➡ tạo server HTTP và dùng Express để xử lý request.
// Lý do cần bước này:
//      ➡ Socket.IO cần attach vào HTTP server thật để dùng chung port.
const server = http.createServer(app); // tạo server HTTP và dùng Express để xử lý request.

// Tạo Socket.IO server
// Ý nghĩa:
//      Gắn Socket.IO vào server HTTP.
//      Config CORS để cho phép frontend kết nối.

const io = new Server(server, {
  // Config CORS để cho phép frontend kết nối.
  // Gắn Socket.IO vào server HTTP.
  cors: {
    origin: process.env.CLIENT_URL, // → Chỉ cho phép domain frontend truy cập (ví dụ http://localhost:5173)
    credentials: true, // → Cho phép gửi cookie / token.
  },
});

io.use(socketAuthMiddleware);

// Lắng nghe kết nối socket
io.on("connection", async (socket) => {
  //  Sự kiện "connection" chạy khi:
  //    👉 Một client connect tới server.
  //     socket là đối tượng đại diện cho client đó.

  const user = socket.user;

  // Mỗi user có 1 room riêng theo id => mốt sau này có gì gửi vào room với id us => MỞ RỘNG DỰ ÁN
  socket.join(user._id.toString());

  console.log(
    ` SOCKET.io [socket/index.js]: User ${user._id} - ${user.username}  Kết Nối (online) Với: ${socket.id} `,
  ); // socket.id = ID duy nhất của client.

  // Mỗi user có 1 room riêng theo id => mốt sau này có gì gửi vào room với id us => MỞ RỘNG DỰ ÁN
  socket.join(user._id.toString());

  console.log(
    ` SOCKET.io [socket/index.js]: User ${user._id} - ${user.username}  đã vô room: ${user._id.toString()}`,
  );

  // Sự kiện "disconnect" chạy khi:
  //    → user đóng tab
  //    → mất mạng
  //    → logout
  //    → server restart

  // Lắng nghe sự kiện disconnect
  socket.on("disconnect", () => {
    console.log(
      ` SOCKET.io [socket/index.js]: User ${user._id} - ${user.userName} Đã Ngắt Kết Nối (offline) Với: ${socket.id}`,
    );
  });
});

// Cho phép file khác import dùng:
export { io, server, app };
