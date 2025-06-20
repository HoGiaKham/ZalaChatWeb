# ZalaChat 💬✨

ZalaChat là một ứng dụng chat thời gian thực với đầy đủ tính năng hiện đại như xác thực OTP, chat cá nhân & nhóm, đổi chủ đề giao diện, đặt biệt hiệu, quản lý thành viên, chia sẻ ảnh và nhiều hơn nữa.

---

## 🚀 Tính năng nổi bật

- ✅ Đăng ký, đăng nhập bằng OTP (AWS Cognito)
- 🔐 Đổi mật khẩu, quên mật khẩu
- 💬 Chat cá nhân và nhóm (Socket.IO real-time)
- 📷 Gửi và xem ảnh chia sẻ
- 🧑‍🎨 Đổi chủ đề màu sắc & biệt hiệu
- 🛡️ Quản lý nhóm: đổi tên nhóm, thêm/xoá thành viên
- 🔍 Tìm kiếm tin nhắn, người dùng
- 👤 Xem & chỉnh sửa thông tin cá nhân

---

## 🖼️ Giao diện demo

| Giao diện                        | Hình ảnh                                     |
|----------------------------------|----------------------------------------------|
| 🔐 Đăng nhập                    | ![](image/LoginScreen.jpg)                   |
| 🆕 Đăng ký                      | ![](image/RegisterScreen.jpg)                |
| 🔁 Quên mật khẩu                | ![](image/ForgetPasswordScreen.jpg)          |
| 🔒 Đổi mật khẩu                 | ![](image/ChangePasswordScreen.jpg)          |
| 💬 Chat cá nhân                | ![](image/ChatScreen.jpg)                    |
| 👥 Chat nhóm                   | ![](image/ChatGroupScreen.jpg)               |
| 🧑‍💼 Thông tin cá nhân        | ![](image/ViewMyProfile.jpg)                 |
| 👨‍👩‍👧‍👦 Thông tin người dùng  | ![](image/ViewChatPeopleInformation.jpg)     |
| 🎨 Chọn màu chủ đề             | ![](image/SelectColorTheme.jpg)              |
| ✍️ Đặt biệt hiệu               | ![](image/SetNicknameScreen.jpg)             |
| 🧭 Danh bạ bạn bè               | ![](image/ContactScreen.jpg)                 |
| 🔍 Tìm tin nhắn                | ![](image/SearchForMessage.jpg)              |
| 🖼️ Ảnh được chia sẻ            | ![](image/ImageSharedScreen.jpg)             |
| 🧩 Modal nhóm (header)         | ![](image/ModalChatHeaderGroupScreen.jpg)    |
| 🧩 Modal nhóm (danh sách)      | ![](image/ModalChatHeaderScreen.jpg)         |

---

## ⚙️ Cài đặt và chạy dự án

### 1. Clone project


- git clone https://github.com/HoGiaKham/ZalaChatWeb.git
- cd ZalaChatWeb-main
- npm install simple-peer
### 2. Backend (Node.js + Express + AWS SDK)
- cd zalachat-backend
- npm install
- cp .env.example .env
- node src/server.js
### 3. Frontend (ReactJS)
- new terminal
- cd zalachat-frontend
- npm install
- cp env.example .env
- npm start


🌐 Công nghệ sử dụng
- Frontend: ReactJS, Axios, React Router, React Icons
- Backend: Node.js, Express, AWS Cognito, DynamoDB, S3
- Realtime: Socket.IO
- Khác: dotenv, bcryptjs, uuid, react-toastify
