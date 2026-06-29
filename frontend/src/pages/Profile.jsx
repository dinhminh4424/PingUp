import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
// import { dummyPostsData, dummyUserData } from "../assets/assets";
import Loading from "../components/Loading";
import UserProfileInfo from "../components/UserProfileInfo";
import PostCard from "../components/post/PostCard";
import moment from "moment";
import ProfileModal from "../components/ProfileModal";
import { useAuth } from "../contexts/AuthContext";
import { getUserById } from "../services/UserServices";
import { getPostsByIdUser } from "../services/PostServices";
const Profile = () => {
  const { profileId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [showEdit, setShowEdit] = useState(false);

  const { userCurrent } = useAuth();

  const [error, setError] = useState("");

  const fetchUser = async () => {
    setUser(null);
    setPosts([]);

    const id = profileId ?? userCurrent._id;

    try {
      const resultUser = await getUserById(id);
      const resultPosts = await getPostsByIdUser(id);

      // setUser(dummyUserData);
      // setPosts(dummyPostsData);

      console.log("resultUser: ", resultUser);

      setUser(resultUser.user);
      setPosts(resultPosts.posts);
    } catch (error) {
      console.log("Lỗi: ", error);
      setError(error.response?.data?.message || "Đăng bài thất bại");
      throw error;
    }
  };

  const handleUpdatePost = (updatedPost) => {
    setPosts((prev) =>
      prev.map((post) => (post._id === updatedPost._id ? updatedPost : post)),
    );
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return user ? (
    <div className="relative h-full overflow-y-scroll bg-gray-50 p-6 ">
      <div className="max-w-3xl mx-auto">
        {/* Profile Card  */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {/*   Cover Photo */}
          <div className="h-40 md:h-56 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200">
            {user.cover_photo && (
              <img
                src={user.cover_photo}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          {/* user info */}
          {error && <p className="text-red-700">{error}</p>}
          <UserProfileInfo
            user={user}
            posts={posts}
            profileId={profileId}
            setShowEdit={setShowEdit}
          />
        </div>

        {/* Tabs */}
        <div className="mt-6">
          <div className="bg-white rounded-xl shadow p-1 flex max-w-md mx-auto">
            {["posts", "media", "likes"].map((tab) => {
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${activeTab === tab ? "bg-indigo-600 text-white" : "text-gray-600 hover:text-gray-900"} `}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              );
            })}
          </div>
          {/*   Posts */}
          {activeTab === "posts" && (
            <div className="mt-6 flex flex-col items-center gap-6">
              {posts.map((post) => {
                return (
                  <PostCard
                    key={post._id}
                    post={post}
                    onUpdate={handleUpdatePost}
                  />
                );
              })}
            </div>
          )}
          {/*   Media */}
          {activeTab === "media" && (
            <div className=" flex flex-wrap mt-6 max-w-6xl">
              {posts
                .filter((post) => post.image_urls.length > 0)
                .map((post) => {
                  return post.image_urls.map((image, index) => (
                    <Link
                      target="_blank"
                      to={image}
                      key={`${post._id}-${index}`}
                      className="relative group"
                    >
                      <img
                        key={index}
                        src={image}
                        className="w-64 aspect-video object-cover "
                        alt=""
                      />
                      <p className="absolute bottom-0 right-0 text-xs p-1 px-3 backdrop-blur-xl text-white opacity-0 group-hover:opacity-100 transition duration-300">
                        Posted {moment(post.createdAt).fromNow()}
                      </p>
                    </Link>
                  ));
                })}
            </div>
          )}
        </div>
      </div>
      {/* Edit Profile Modal */}
      {showEdit && <ProfileModal setShowEdit={setShowEdit} />}
    </div>
  ) : (
    <Loading />
  );
};

export default Profile;
