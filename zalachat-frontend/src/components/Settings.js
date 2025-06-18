import React, { useState, useEffect } from "react";
import { FaBell, FaPalette, FaLock, FaQuestionCircle, FaInfoCircle } from "react-icons/fa";
import Switch from "react-switch";
import axios from "axios";
import { useTheme } from "../contexts/ThemeContext";

const settingsOptions = [
  { id: "1", icon: <FaBell />, label: "Thông báo" },
  { id: "2", icon: <FaPalette />, label: "Chủ đề giao diện" },
  { id: "3", icon: <FaLock />, label: "Bảo mật" },
  { id: "4", icon: <FaQuestionCircle />, label: "Trợ giúp" },
  { id: "5", icon: <FaInfoCircle />, label: "Thông tin ứng dụng" },
];

function Settings() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isAppInfoModalOpen, setIsAppInfoModalOpen] = useState(false);
  const [isNotificationOn, setIsNotificationOn] = useState(() => {
    const savedState = localStorage.getItem("isNotificationOn");
    return savedState === "true";
  });
  const [notificationTime, setNotificationTime] = useState(localStorage.getItem("notificationTime") || "15 phút");

  // State cho việc đổi mật khẩu
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const savedNotificationTime = localStorage.getItem("notificationTime");
    if (savedNotificationTime) {
      setNotificationTime(savedNotificationTime);
    }
  }, []);

  // Effect cho chế độ tối
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
      document.body.style.height = "100%";
      document.body.style.margin = "0";
    } else {
      document.body.classList.remove("dark-mode");
      document.body.style.height = "auto";
      document.body.style.margin = "0";
    }
  }, [isDarkMode]);

  const handleOptionClick = (label) => {
    switch (label) {
      case "Thông báo":
        setIsModalOpen(true);
        break;
      case "Chủ đề giao diện":
        setIsThemeModalOpen(true);
        break;
      case "Bảo mật":
        setIsSecurityModalOpen(true);
        break;
      case "Trợ giúp":
        window.open("https://support.example.com", "_blank");
        break;
      case "Thông tin ứng dụng":
        setIsAppInfoModalOpen(true);
        break;
      default:
        alert("Chưa chọn tùy chọn nào");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const closeThemeModal = () => {
    setIsThemeModalOpen(false);
  };

  const closeSecurityModal = () => {
    setIsSecurityModalOpen(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setError("");
  };

  const closeAppInfoModal = () => {
    setIsAppInfoModalOpen(false);
  };

  const saveSettings = () => {
    localStorage.setItem("isNotificationOn", isNotificationOn);
    localStorage.setItem("notificationTime", notificationTime);
    setIsModalOpen(false);
  };

  const toggleNotification = (checked) => {
    setIsNotificationOn(checked);
  };

  const handleNotificationTimeChange = (time) => {
    setNotificationTime(time);
  };

  const handlePasswordChange = async () => {
    // Kiểm tra các trường trống
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    // Kiểm tra mật khẩu mới và xác nhận mật khẩu có khớp không
    if (newPassword !== confirmNewPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }

    // Kiểm tra mật khẩu mới có giống mật khẩu cũ không
    if (newPassword === oldPassword) {
      setError("Mật khẩu mới không thể giống mật khẩu cũ.");
      return;
    }

    try {
      // Lấy token từ localStorage
      const tokens = JSON.parse(localStorage.getItem("tokens"));
      if (!tokens || !tokens.accessToken) {
        setError("Bạn cần đăng nhập lại để thay đổi mật khẩu.");
        return;
    }

      // Gửi yêu cầu API để thay đổi mật khẩu
      await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/change-password`,
        {
          oldPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }
      );

      // Nếu thành công
      alert("Mật khẩu đã được thay đổi thành công.");
      closeSecurityModal();
    } catch (error) {
      // Xử lý lỗi từ server
      const errorMessage = error.response?.data?.error || "Đã xảy ra lỗi. Vui lòng thử lại.";
      setError(errorMessage);
    }
  };

  return (
    <div className="tab-container" style={{ ... (isDarkMode ? darkModeStyles : lightModeStyles), overflowY: "hidden" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", textAlign: "center", marginBottom: "20px" }}>
        Cài đặt
      </h1>
      <div style={{ overflowY: "hidden" }}>
        {settingsOptions.map((item) => (
          <div key={item.id} style={styles.option} onClick={() => handleOptionClick(item.label)}>
            <span style={styles.icon}>{item.icon}</span>
            <p style={styles.label}>{item.label}</p>
          </div>
        ))}
      </div>

      {/* Notification Modal */}
      {isModalOpen && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <h2 style={modalStyles.title}>Tắt thông báo</h2>
            <div style={modalStyles.content}>
              <p style={modalStyles.description}>Tắt thông báo về đoạn chat này?</p>
              <div style={modalStyles.options}>
                {["15 phút", "1 giờ", "4 giờ", "1 ngày", "Cho đến khi tôi bật lại"].map((time, index) => (
                  <div
                    key={index}
                    style={{
                      ...modalStyles.option,
                      backgroundColor: notificationTime === time ? "#6D28D9" : "transparent",
                      color: notificationTime === time ? "#FFFFFF" : "#4B5563",
                      ...modalStyles.optionHover,
                    }}
                    onClick={() => handleNotificationTimeChange(time)}
                  >
                    <span>{time}</span>
                    {notificationTime === time && <span style={modalStyles.checkmark}>✔</span>}
                  </div>
                ))}
              </div>
              <div style={modalStyles.switchContainer}>
                <Switch
                  onChange={toggleNotification}
                  checked={isNotificationOn}
                  offColor="#D1D5DB"
                  onColor="#10B981"
                  uncheckedIcon={false}
                  checkedIcon={false}
                  height={20}
                  width={48}
                />
                <span style={modalStyles.switchLabel}>{isNotificationOn ? "Bật" : "Tắt"}</span>
              </div>
              <div style={modalStyles.buttonContainer}>
                <button style={modalStyles.button} onClick={closeModal}>Đóng</button>
                <button style={{ ...modalStyles.button, ...modalStyles.saveButton }} onClick={saveSettings}>Lưu</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Theme Modal */}
      {isThemeModalOpen && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <h2 style={modalStyles.title}>Chọn chủ đề giao diện</h2>
            <div style={modalStyles.switchContainer}>
              <Switch
                onChange={toggleTheme}
                checked={isDarkMode}
                offColor="#D1D5DB"
                onColor="#10B981"
                uncheckedIcon={false}
                checkedIcon={false}
                height={20}
                width={48}
              />
              <span style={modalStyles.switchLabel}>{isDarkMode ? "Chế độ tối" : "Chế độ sáng"}</span>
            </div>
            <div style={modalStyles.buttonContainer}>
              <button style={modalStyles.button} onClick={closeThemeModal}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Security Modal */}
      {isSecurityModalOpen && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.securityModal}>
            <h2 style={modalStyles.securityTitle}>Cài đặt bảo mật</h2>
            <p style={modalStyles.securityDescription}>Đổi mật khẩu của bạn.</p>
            <div style={modalStyles.securityOptions}>
              <div style={modalStyles.securityInputContainer}>
                <label style={modalStyles.securityLabel}>Mật khẩu cũ</label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu cũ"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  style={modalStyles.securityInput}
                />
              </div>
              <div style={modalStyles.securityInputContainer}>
                <label style={modalStyles.securityLabel}>Mật khẩu mới</label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={modalStyles.securityInput}
                />
              </div>
              <div style={modalStyles.securityInputContainer}>
                <label style={modalStyles.securityLabel}>Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  placeholder="Xác nhận mật khẩu mới"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  style={modalStyles.securityInput}
                />
              </div>
              {error && <p style={modalStyles.error}>{error}</p>}
            </div>
            <div style={modalStyles.buttonContainer}>
              <button style={modalStyles.button} onClick={closeSecurityModal}>Đóng</button>
              <button style={{ ...modalStyles.button, ...modalStyles.saveButton }} onClick={handlePasswordChange}>Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}

      {/* App Info Modal */}
      {isAppInfoModalOpen && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <h2 style={modalStyles.title}>Thông tin ứng dụng</h2>
            <div style={modalStyles.content}>
              <p style={modalStyles.description}>
                <strong>Tên ứng dụng:</strong> ZalaChat
              </p>
              <p style={modalStyles.description}>
                <strong>Phiên bản:</strong> 1.1.1.1
              </p>
              <p style={modalStyles.description}>
                <strong>Nhà phát triển:</strong> Nhóm 7
              </p>
              <p style={modalStyles.description}>
              <strong>Liên hệ:</strong> <a href="mailto:support@chatapp.com" style={modalStyles.link}>support@chatapp.com</a>
              </p>
              <p style={modalStyles.description}>
                <strong>Mô tả:</strong> Ứng dụng trò chuyện tiện lợi, an toàn và dễ sử dụng.
              </p>
            </div>
            <div style={modalStyles.buttonContainer}>
              <button style={modalStyles.button} onClick={closeAppInfoModal}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  option: {
    display: "flex",
    alignItems: "center",
    background: "linear-gradient(135deg, #F9FAFB 0%, #E5E7EB 100%)",
    padding: "16px",
    borderRadius: "12px",
    marginBottom: "16px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    overflowY: "hidden",
  },
  icon: {
    marginRight: "16px",
    fontSize: "24px",
    color: "#9333EA",
  },
  label: {
    fontSize: "18px",
    color: "#1E293B",
    fontWeight: "500",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "16px",
    borderRadius: "8px",
    border: "1px solid #D1D5DB",
    fontSize: "16px",
    transition: "border-color 0.3s ease",
    backgroundColor: "#FFFFFF",
  },
  error: {
    color: "#DC2626",
    fontSize: "14px",
    marginTop: "8px",
  },
};

const darkModeStyles = {
  backgroundColor: "#111827",
  color: "#F9FAFB",
  minHeight: "100vh",
  overflowY: "hidden",
};

const lightModeStyles = {
  backgroundColor: "#F3F4F6",
  color: "#1E293B",
  minHeight: "100vh",
  overflowY: "hidden",
};

const modalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 50,
    overflowY: "hidden",
  },
  modal: {
    background: "linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)",
    padding: "24px",
    borderRadius: "12px",
    width: "400px",
    textAlign: "center",
    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
    animation: "fadeIn 0.3s ease",
    overflowY: "hidden",
  },
  securityModal: {
    background: "linear-gradient(135deg, #E0F2FE 0%, #DBEAFE 100%)",
    padding: "24px",
    borderRadius: "15px",
    width: "450px",
    textAlign: "center",
    boxShadow: "0 15px 30px rgba(59, 130, 246, 0.3)",
    animation: "fadeIn 0.3s ease",
    overflow: "hidden", 
  },
  securityTitle: {
    fontSize: "35px", 
    marginBottom: "-15px",
    fontWeight: "600",
    color: "#1E40AF",
  },
  securityDescription: {
    fontSize: "18px", 
    marginBottom: "5px",
    textAlign: "center",
    lineHeight: "1.5",
    color: "#64748B",
  },
  securityOptions: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "20px",
    overflow: "hidden",
  },
  securityInputContainer: {
    marginBottom: "16px",
    textAlign: "left",
    overflow: "hidden", 
  },
  securityLabel: {
    fontSize: "16px", 
    color: "#64748B",
    marginBottom: "6px",
    display: "block",
  },
  securityInput: {
    width: "100%",
    padding: "14px", 
    borderRadius: "8px",
    border: "1px solid #CBD5E1",
    fontSize: "16px", 
    backgroundColor: "#FFFFFF",
    boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.05)",
    transition: "border-color 0.3s ease",
    height: "30px", 
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
    overflow: "hidden", 
  },
  button: {
    padding: "12px 24px",
    fontSize: "16px",
    background: "linear-gradient(90deg, #8B5CF6 0%, #A78BFA 100%)",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background 0.3s ease",
    overflow: "hidden", 
  },
  saveButton: {
    background: "linear-gradient(90deg, #10B981 0%, #34D399 100%)",
  },
  checkmark: {
    fontSize: "22px",
    color: "#FFFFFF",
  },
  switchContainer: {
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden", 
  },
  switchLabel: {
    marginLeft: "12px",
    color: "#6B7280",
  },
  link: {
    color: "#3B82F6",
    textDecoration: "underline",
    transition: "color 0.3s ease",
  },
};

export default Settings;