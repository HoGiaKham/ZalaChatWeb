import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleSendCode = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/auth/forgot-password`, { username: email });
      setStep(2);
    } catch (error) {
      alert(error.response?.data?.error || "Gửi mã thất bại");
    }
  };

  const handleResetPassword = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/auth/reset-password`, {
        username: email,
        code,
        newPassword,
      });
      alert("Đặt lại mật khẩu thành công");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.error || "Đặt lại mật khẩu thất bại");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Quên mật khẩu</h1>
        {step === 1 ? (
          <>
            <p style={styles.subtitle}>Nhập email để nhận mã xác nhận</p>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
            <button onClick={handleSendCode} style={styles.button}>
              Gửi mã
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Mã xác nhận"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={styles.input}
            />
            <input
              type="password"
              placeholder="Mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={styles.input}
            />
            <button onClick={handleResetPassword} style={styles.button}>
              Đặt lại mật khẩu
            </button>
          </>
        )}
        <button
          onClick={() => navigate("/login")}
          style={styles.linkButton}
          onMouseOver={(e) => (e.target.style.color = "#FFD700")}
          onMouseOut={(e) => (e.target.style.color = "#ffffff")}
        >
          Quay lại đăng nhập
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "linear-gradient(135deg, #74ebd5, #ACB6E5)",
    height: "100vh",
    width: "100vw",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  card: {
    background: "rgba(255, 255, 255, 0.15)",
    borderRadius: "20px",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    boxShadow: "0 8px 32px rgba(31, 38, 135, 0.3)",
    padding: "40px",
    width: "90%",
    maxWidth: "420px",
    textAlign: "center",
  },
  title: {
    fontSize: "36px",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "#222222",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  subtitle: {
    fontSize: "16px",
    marginBottom: "20px",
    color: "#444",
  },
  input: {
    width: "100%",
    padding: "14px",
    marginBottom: "15px",
    borderRadius: "10px",
    border: "none",
    fontSize: "16px",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    color: "#222222",
    fontWeight: "500",
    letterSpacing: "0.3px",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "15px",
    borderRadius: "10px",
    backgroundColor: "#1E90FF",
    color: "#fff",
    fontSize: "18px",
    fontWeight: "bold",
    border: "none",
    cursor: "pointer",
    marginTop: "10px",
    transition: "0.3s",
  },
  linkButton: {
    background: "none",
    border: "none",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "500",
    marginTop: "15px",
    textDecoration: "underline",
    cursor: "pointer",
    transition: "color 0.3s",
  },
};

export default ForgotPassword;
