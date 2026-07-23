import Connection from "../models/Connection.js";

/**
 * Kiểm tra xem 2 người dùng có quan hệ bạn bè (đã kết nối) hay không.
 * @param {string|ObjectId} userId1 
 * @param {string|ObjectId} userId2 
 * @returns {Promise<boolean>}
 */
export const isConnected = async (userId1, userId2) => {
  if (!userId1 || !userId2) return false;
  
  // Tự kết nối với chính mình (luôn được xem thông tin chính mình)
  if (userId1.toString() === userId2.toString()) return true;

  const id1 = userId1.toString();
  const id2 = userId2.toString();

  // Connection Schema lưu sắp xếp userA < userB
  const userA = id1 < id2 ? id1 : id2;
  const userB = id1 < id2 ? id2 : id1;

  const connection = await Connection.findOne({ userA, userB });
  return !!connection;
};
