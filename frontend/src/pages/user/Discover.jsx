import React, { useState } from "react";

import { Search } from "lucide-react";
import UserCard from "../../components/UserCard";
import Loading from "../../components/Loading";
import { findUserBySearch } from "../../services/UserServices";
import { useEffect } from "react";

const Discover = () => {
  const [input, setInput] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    if (e.key === "Enter") {
      setUsers([]);
      setLoading(true);
      setError("");
      try {
        const result = await findUserBySearch(input);

        setUsers(result.users);
      } catch (error) {
        console.error("Lỗi : ", error);
        setError(error.response?.data?.message || "Lỗi lọc người dùng");
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchUserFind = async () => {
    setUsers([]);
    setLoading(true);
    setError("");
    try {
      const result = await findUserBySearch(input);

      setUsers(result.users);
    } catch (error) {
      console.error("Lỗi : ", error);
      setError(error.response?.data?.message || "Lỗi lọc người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserFind();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Discover People
          </h1>
          <p className="text-slate-600">
            Connections with amazing people and grow your network
          </p>
        </div>
        {error && <p className="text-red-600">{error}</p>}

        {/* Search */}
        <div className="mb-8 shadow-md rounded-md border border-slate-200/60 bg-white/80 ">
          <div className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search people by name, username, bio, or location .........."
                className="pl-10 sm:pl-12 py-2 w-full border border-gray-300 rounded-md max-sm:text-sm "
                onChange={(e) => setInput(e.target.value)}
                value={input}
                onKeyUp={handleSearch}
              />
            </div>
          </div>
        </div>

        {/* List */}
        <div className="flex flex-wrap gap-6">
          {users.map((user) => {
            return <UserCard user={user} key={user._id} />;
          })}

          {loading && (
            <div className="mx-auto">
              <Loading height="60vh" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Discover;
