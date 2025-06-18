import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const navigate = useNavigate();

  const verifyEmailReal = async (emailToCheck) => {
    if (!emailToCheck) return;
    setIsCheckingEmail(true);
    setEmailError("");

    try {
      const response = await axios.get("https://emailverification.whoisxmlapi.com/api/v3", {
        params: {
          apiKey: "at_K9LqgakdtGpzFy9EAaDCzsgrkTmtI",
          emailAddress: emailToCheck,
        },
      });

      const data = response.data;
      if (!data.smtpCheck || data.smtpCheck !== "true") {
        setEmailError("Email không tồn tại hoặc không hợp lệ.");
      }
    } catch (error) {
      console.error("Lỗi kiểm tra email:", error);
      setEmailError("Không thể kiểm tra email lúc này.");
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleLogin = async () => {
    if (emailError || isCheckingEmail) return;

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, {
        username: email,
        password,
      });
      localStorage.setItem("tokens", JSON.stringify(response.data));
      navigate("/app/chats");
    } catch (error) {
      alert(error.response?.data?.error || "Đăng nhập thất bại");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>ZalaChat</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError("");
          }}
          onBlur={() => verifyEmailReal(email)}
          style={styles.input}
        />
        {emailError && <p style={styles.error}>{emailError}</p>}
        {isCheckingEmail && <p style={styles.info}>Đang kiểm tra email...</p>}

        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <button onClick={handleLogin} style={styles.button} disabled={isCheckingEmail}>
          {isCheckingEmail ? "Vui lòng đợi..." : "Đăng nhập"}
        </button>

        <a
          href="/forgot-password"
          style={styles.link}
          onMouseOver={(e) => (e.target.style.color = "#FFD700")}
          onMouseOut={(e) => (e.target.style.color = "#ffffff")}
        >
          Quên mật khẩu?
        </a>
        <a
          href="/register"
          style={styles.link}
          onMouseOver={(e) => (e.target.style.color = "#FFD700")}
          onMouseOut={(e) => (e.target.style.color = "#ffffff")}
        >
          Bạn chưa có tài khoản? Đăng ký
        </a>
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
    maxWidth: "400px",
    textAlign: "center",
    boxSizing: "border-box",
  },
  title: {
    fontSize: "44px",
    fontWeight: "bold",
    marginBottom: "30px",
    letterSpacing: "1.2px",
    color: "#222222",
    textShadow: "0 0 8px rgba(255, 255, 255, 0.4), 0 0 16px rgba(255, 255, 255, 0.3)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
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
    boxSizing: "border-box",
  },
  link: {
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "500",
    marginTop: "12px",
    display: "block",
    textDecoration: "underline",
    transition: "color 0.3s",
  },
  error: {
    color: "#ff4d4f",
    fontSize: "14px",
    marginBottom: "10px",
  },
  info: {
    color: "#eeeeee",
    fontSize: "14px",
    marginBottom: "10px",
  },
};

export default Login;
