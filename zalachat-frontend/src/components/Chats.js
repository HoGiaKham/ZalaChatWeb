// File: Chats.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import io from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Chats.css";
import ChatWindow from "./ChatWindow";

function Chats({ themes }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [lastMessages, setLastMessages] = useState({});
  const [unreadMessages, setUnreadMessages] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [friends, setFriends] = useState([]); // State cho danh sách bạn bè
  const socketRef = useRef(null);
  const ringtoneRef = useRef(null);

  const configuration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  useEffect(() => {
    const tokens = JSON.parse(localStorage.getItem("tokens"));
    if (!tokens?.accessToken) {
      window.location.href = "/login";
      return;
    }

    const fetchUserInfo = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/auth/user`,
          {
            headers: { Authorization: `Bearer ${tokens.accessToken}` },
          }
        );
        setCurrentUser(response.data.username);
      } catch (error) {
        console.error("Error fetching user info:", error);
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
        localStorage.removeItem("tokens");
        window.location.href = "/login";
      }
    };

    fetchUserInfo();
  }, []);

  const fetchFriends = async () => {
    try {
      const tokens = JSON.parse(localStorage.getItem("tokens"));
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/contacts/friends`,
        {
          headers: { Authorization: `Bearer ${tokens.accessToken}` },
        }
      );
      setFriends(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching friends:", error);
      toast.error("Không thể tải danh sách bạn bè");
      return [];
    }
  };

  const getFriendName = async (userId, friendMap) => {
    return friendMap[userId] || (await (async () => {
      try {
        const tokens = JSON.parse(localStorage.getItem("tokens"));
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/auth/user/${userId}`,
          {
            headers: { Authorization: `Bearer ${tokens.accessToken}` },
          }
        );
        return response.data.username;
      } catch (error) {
        console.error("Error fetching friend name:", error);
        return userId;
      }
    })());
  };

  const fetchConversations = async () => {
    const tokens = JSON.parse(localStorage.getItem("tokens"));
    if (!tokens?.accessToken) return Promise.reject("No access token");

    try {
      // Lấy danh sách bạn bè
      const friendsData = await fetchFriends();
      const friendMap = friendsData.reduce((map, friend) => {
        map[friend.friendId] = friend.friendName;
        return map;
      }, {});

      // Lấy danh sách cuộc trò chuyện
      const convResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/chats/conversations`,
        {
          headers: { Authorization: `Bearer ${tokens.accessToken}` },
        }
      );

      // Tạo danh sách cuộc trò chuyện từ bạn bè, kể cả chưa có tin nhắn
      const friendConversations = await Promise.all(
        friendsData.map(async (friend) => {
          const existingConv = convResponse.data.find(
            (conv) => conv.friendId === friend.friendId
          );
          if (existingConv) {
            return {
              ...existingConv,
              theme: localStorage.getItem(`theme_${existingConv.conversationId}`) || existingConv.theme || "#3b82f6",
              friendName: localStorage.getItem(`nickname_${existingConv.conversationId}`) || friend.friendName,
            };
          } else {
            return {
              conversationId: `conv_${friend.friendId}_${currentUser}`,
              friendId: friend.friendId,
              friendName: friend.friendName,
              theme: "#3b82f6",
              createdAt: new Date().toISOString(),
            };
          }
        })
      );

      // Lấy tin nhắn cuối cùng
      try {
        const lastMsgResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/chats/last-messages`,
          {
            headers: { Authorization: `Bearer ${tokens.accessToken}` },
          }
        );
        setLastMessages(lastMsgResponse.data);
      } catch (error) {
        console.error("Error fetching last messages:", error);
      }

      // Sắp xếp theo thứ tự lưu trữ hoặc thời gian tạo
      const savedOrder = JSON.parse(localStorage.getItem("conversationOrder")) || [];
      const orderedConversations = savedOrder.length
        ? savedOrder
            .map((id) => friendConversations.find((conv) => conv.conversationId === id))
            .filter((conv) => conv !== undefined)
            .concat(friendConversations.filter((conv) => !savedOrder.includes(conv.conversationId)))
        : friendConversations;

      localStorage.setItem(
        "conversationOrder",
        JSON.stringify(orderedConversations.map((conv) => conv.conversationId))
      );

      setConversations(orderedConversations);
      return orderedConversations;
    } catch (error) {
      console.error("Error fetching conversations:", error);
      return Promise.reject(error);
    }
  };

  const getMessagePreview = (msg, senderId, currentUser) => {
    if (!msg) return "";
    if (msg.status === "deleted") return "Tin nhắn đã bị xóa";
    if (msg.type === "recalled") return "Tin nhắn đã được thu hồi";
    if (msg.type === "image") return "Hình ảnh";
    if (msg.type === "video") return "Video";
    if (msg.type === "audio") return "Âm thanh";
    if (msg.type === "file") return "Tệp";
    const senderLabel = senderId === currentUser ? "Bạn" : msg.senderName || "Bạn";
    return `${senderLabel}: ${msg.content.slice(0, 50)}`;
  };

  const handleMessageSent = useCallback((conversationId, message) => {
    setLastMessages((prev) => ({
      ...prev,
      [conversationId]: {
        ...message,
        senderId: currentUser,
        timestamp: new Date().toISOString(),
      },
    }));
    setConversations((prevConvs) => {
      const updatedConvs = [...prevConvs];
      const convIndex = updatedConvs.findIndex(
        (conv) => conv.conversationId === conversationId
      );
      if (convIndex !== -1) {
        const [conv] = updatedConvs.splice(convIndex, 1);
        updatedConvs.unshift(conv);
        localStorage.setItem(
          "conversationOrder",
          JSON.stringify(updatedConvs.map((conv) => conv.conversationId))
        );
        return updatedConvs;
      }
      return prevConvs;
    });
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchConversations().then((convs) => {
        setConversations(convs);

        const savedConversationId = localStorage.getItem("selectedConversationId");
        if (savedConversationId && convs) {
          const savedConversation = convs.find(
            (conv) => conv.conversationId === savedConversationId
          );
          if (savedConversation) {
            setSelectedConversation(savedConversation);
          } else if (convs.length > 0) {
            setSelectedConversation(convs[0]);
          }
        } else if (convs && convs.length > 0) {
          setSelectedConversation(convs[0]);
        }
      });
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      const tokens = JSON.parse(localStorage.getItem("tokens"));
      socketRef.current = io("http://localhost:5000", {
        auth: { token: tokens.accessToken },
        transports: ["websocket"],
      });

      socketRef.current.on("connect", () => {
        console.log("Socket.IO connected with ID:", socketRef.current.id);
      });

      socketRef.current.on("receiveMessage", async (message) => {
        if (message.senderId === currentUser) return;
        if (
          selectedConversation &&
          message.conversationId === selectedConversation.conversationId
        ) {
        } else {
          setLastMessages((prev) => ({
            ...prev,
            [message.conversationId]: message,
          }));
          setConversations((prevConvs) => {
            const updatedConvs = [...prevConvs];
            const convIndex = updatedConvs.findIndex(
              (conv) => conv.conversationId === message.conversationId
            );
            if (convIndex !== -1) {
              const [conv] = updatedConvs.splice(convIndex, 1);
              updatedConvs.unshift(conv);
              localStorage.setItem(
                "conversationOrder",
                JSON.stringify(updatedConvs.map((conv) => conv.conversationId))
              );
              return updatedConvs;
            }
            return prevConvs;
          });
          setUnreadMessages((prev) => ({
            ...prev,
            [message.conversationId]: true,
          }));
          toast.info(
            `Tin nhắn mới từ ${await getFriendName(message.senderId, {})}`,
            {
              position: "top-right",
              autoClose: 3000,
              onClick: () => {
                const conversation = conversations.find(
                  (conv) => conv.conversationId === message.conversationId
                );
                if (conversation) {
                  setSelectedConversation(conversation);
                  setUnreadMessages((prev) => ({
                    ...prev,
                    [message.conversationId]: false,
                  }));
                }
              },
            }
          );
        }
      });

      socketRef.current.on("messageRecalled", (data) => {
        if (
          selectedConversation &&
          data.conversationId === selectedConversation.conversationId
        ) {
          setLastMessages((prev) => ({
            ...prev,
            [data.conversationId]: { ...prev[data.conversationId], type: "recalled" },
          }));
        }
      });

      socketRef.current.on("messageDeleted", (data) => {
        if (
          selectedConversation &&
          data.conversationId === selectedConversation.conversationId
        ) {
          setLastMessages((prev) => ({
            ...prev,
            [data.conversationId]: { ...prev[data.conversationId], status: "deleted" },
          }));
        }
      });

      socketRef.current.on("themeChanged", (data) => {
        setConversations((prevConvs) => {
          const updatedConvs = [...prevConvs];
          const convIndex = updatedConvs.findIndex(
            (conv) => conv.conversationId === data.conversationId
          );
          if (convIndex !== -1) {
            updatedConvs[convIndex] = { ...updatedConvs[convIndex], theme: data.newTheme };
          }
          return updatedConvs;
        });
        if (
          selectedConversation &&
          selectedConversation.conversationId === data.conversationId
        ) {
          setSelectedConversation((prev) => ({
            ...prev,
            theme: data.newTheme,
          }));
        }
        localStorage.setItem(`theme_${data.conversationId}`, data.newTheme);
      });

      socketRef.current.on("nicknameChanged", (data) => {
        console.log("Nickname changed event received:", data);
        setConversations((prev) => {
          const updatedConvs = prev.map((conv) =>
            conv.conversationId === data.conversationId
              ? { ...conv, friendName: data.newNickname }
              : conv
          );
          return updatedConvs;
        });
        if (
          selectedConversation &&
          selectedConversation.conversationId === data.conversationId
        ) {
          setSelectedConversation((prev) => ({
            ...prev,
            friendName: data.newNickname,
          }));
        }
        localStorage.setItem(`nickname_${data.conversationId}`, data.newNickname);
      });

      socketRef.current.on("friendAdded", (newFriend) => {
        setFriends((prev) => [...prev, newFriend]);
        setConversations((prevConvs) => {
          const existingConv = prevConvs.find(
            (conv) => conv.friendId === newFriend.friendId
          );
          if (!existingConv) {
            const newConv = {
              conversationId: `conv_${newFriend.friendId}_${currentUser}`,
              friendId: newFriend.friendId,
              friendName: newFriend.friendName,
              theme: "#3b82f6",
              createdAt: new Date().toISOString(),
            };
            const updatedConvs = [newConv, ...prevConvs];
            localStorage.setItem(
              "conversationOrder",
              JSON.stringify(updatedConvs.map((conv) => conv.conversationId))
            );
            return updatedConvs;
          }
          return prevConvs;
        });
      });

      socketRef.current.on("friendRemovedClient", ({ friendId }) => {
        setFriends((prev) => prev.filter((friend) => friend.friendId !== friendId));
        setConversations((prevConvs) => {
          const updatedConvs = prevConvs.filter(
            (conv) => conv.friendId !== friendId
          );
          localStorage.setItem(
            "conversationOrder",
            JSON.stringify(updatedConvs.map((conv) => conv.conversationId))
          );
          if (
            selectedConversation &&
            selectedConversation.friendId === friendId
          ) {
            setSelectedConversation(null);
            localStorage.removeItem("selectedConversationId");
          }
          return updatedConvs;
        });
      });

      socketRef.current.on("callRequest", (data) => {
        if (
          data.to === currentUser &&
          data.conversationId === selectedConversation?.conversationId
        ) {
        }
      });

      socketRef.current.on("callResponse", (data) => {
      });

      socketRef.current.on("offer", (data) => {
      });

      socketRef.current.on("answer", (data) => {
      });

      socketRef.current.on("candidate", (data) => {
      });

      return () => {
        if (socketRef.current) socketRef.current.disconnect();
      };
    }
  }, [currentUser, selectedConversation]);

  const handleOpenSettingsModal = () => {
    setIsSettingsModalOpen(true);
  };

  const handleCloseSettingsModal = () => {
    setIsSettingsModalOpen(false);
  };

  return (
    <div className="container">
      <ToastContainer />
      <audio ref={ringtoneRef} preload="auto" />
      <div className="mainContent">
        <div className="sidebar">
          <h2 className="title">Bạn bè</h2>
          {conversations.length > 0 ? (
            conversations.map((conv) => {
              const lastMessage = lastMessages[conv.conversationId];
              const isUnread = unreadMessages[conv.conversationId];
              const isOwnMessage = lastMessage?.senderId === currentUser;
              const senderName = isOwnMessage ? "Bạn" : conv.friendName;
              const messagePreview = getMessagePreview(lastMessage, lastMessage?.senderId, currentUser);
              return (
                <div
                  key={conv.conversationId}
                  className={`conversation ${
                    selectedConversation?.conversationId === conv.conversationId
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedConversation(conv);
                    setUnreadMessages((prev) => ({
                      ...prev,
                      [conv.conversationId]: false,
                    }));
                    localStorage.setItem(
                      "selectedConversationId",
                      conv.conversationId
                    );
                  }}
                >
                  <div
                    className="avatar"
                    style={{
                      backgroundColor: conv.theme || "#3b82f6",
                    }}
                  >
                    {conv.friendName.charAt(0).toUpperCase()}
                  </div>
                  <div className="friendInfo">
                    <span
                      className={`friendName ${isUnread ? "unread" : ""}`}
                    >
                      {conv.friendName}
                    </span>
                    {lastMessage ? (
                      <span
                        className={`lastMessage ${isUnread ? "unread" : ""}`}
                      >
                        {messagePreview}
                      </span>
                    ) : (
                      <span className="lastMessage">Chưa có tin nhắn</span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="emptyText">Chưa có bạn bè</p>
          )}
        </div>
        <ChatWindow
          selectedConversation={selectedConversation}
          currentUser={currentUser}
          socketRef={socketRef}
          ringtoneRef={ringtoneRef}
          configuration={configuration}
          themes={themes}
          onMessageSent={handleMessageSent}
          onOpenSettingsModal={handleOpenSettingsModal}
          isSettingsModalOpen={isSettingsModalOpen}
          onCloseSettingsModal={handleCloseSettingsModal}
          setSelectedConversation={setSelectedConversation}
        />
      </div>
    </div>
  );
}

export default Chats;