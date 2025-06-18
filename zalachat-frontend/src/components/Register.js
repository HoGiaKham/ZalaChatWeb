import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

function Register() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const navigate = useNavigate();

  const formatPhoneNumber = (phone) => {
    if (phone.startsWith("0")) return "+84" + phone.slice(1);
    return phone;
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phone)) {
      setPhoneError("Số điện thoại không hợp lệ (bắt đầu bằng 0 và đủ 10 số).");
    } else {
      setPhoneError("");
    }
  };

  const verifyEmailReal = async (email) => {
    if (!email) return;
    setIsCheckingEmail(true);
    setEmailError("");

    try {
      const response = await axios.get("https://emailverification.whoisxmlapi.com/api/v3", {
        params: {
          apiKey: "at_K9LqgakdtGpzFy9EAaDCzsgrkTmtI",
          emailAddress: email,
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

  const handleRegister = async () => {
    if (phoneError || emailError || isCheckingEmail) return;
    const formattedPhone = formatPhoneNumber(phoneNumber);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/register`, {
        email,
        password,
        name,
        phoneNumber: formattedPhone,
      });
      navigate("/otp-confirm", { state: { username: response.data.username } });
    } catch (error) {
      const errMsg = error.response?.data?.error?.toLowerCase();
      if (errMsg?.includes("phone")) {
        setPhoneError("Số điện thoại đã được sử dụng hoặc không hợp lệ.");
      } else {
        alert(error.response?.data?.error || "Đăng ký thất bại");
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Đăng ký</h1>

        <input
          type="text"
          placeholder="Họ tên"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />

        <input
          type="text"
          placeholder="Số điện thoại (VD: 0123456789)"
          value={phoneNumber}
          onChange={(e) => {
            setPhoneNumber(e.target.value);
            setPhoneError("");
          }}
          onBlur={() => validatePhoneNumber(phoneNumber)}
          style={styles.input}
        />
        {phoneError && <p style={styles.error}>{phoneError}</p>}

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

        <div style={styles.passwordContainer}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.passwordInput}
          />
          <span style={styles.eyeButton} onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
          </span>
        </div>

        <button onClick={handleRegister} style={styles.button} disabled={isCheckingEmail}>
          {isCheckingEmail ? "Vui lòng đợi..." : "Đăng ký"}
        </button>

        <button
          onClick={() => navigate("/login")}
          style={{ ...styles.linkButton }}
          onMouseOver={(e) => (e.target.style.color = "#FFD700")}
          onMouseOut={(e) => (e.target.style.color = "#ffffff")}
        >
          Đã có tài khoản? Đăng nhập
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
    fontSize: "44px",
    fontWeight: "bold",
    marginBottom: "30px",
    letterSpacing: "1.2px",
    color: "#222222",
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
  },
  passwordContainer: {
    position: "relative",
    width: "100%",
    marginBottom: "15px",
  },
  passwordInput: {
    width: "107%",
    padding: "14px 44px 14px 14px", 
    borderRadius: "10px",
    border: "none",
    fontSize: "16px",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    color: "#222222",
    fontWeight: "500",
    letterSpacing: "0.3px",
    boxSizing: "border-box",
  },
  eyeButton: {
    position: "absolute",
    top: "55%",
    right: "-20px",
    transform: "translateY(-50%)",
    cursor: "pointer",
    fontSize: "20px",
    color: "#555",
    zIndex: 2,
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

export default Register;
