# Tour Insights Hub

Đây là một ứng dụng Next.js được xây dựng bằng Firebase Studio. Nó là một nền tảng để thu thập và hiển thị phản hồi của người dùng cho các chuyến tham quan khác nhau.

## Tính năng chính

- 🎫 **Quản lý Tour**: Tạo, chỉnh sửa và quản lý thông tin các chuyến tour đã hoàn thành
- 📸 **Upload Media**: Hỗ trợ upload hình ảnh (lên đến 10MB) và video (lên đến 100MB)
- ⭐ **Thu thập đánh giá**: Cho phép khách hàng gửi đánh giá và phản hồi
- 🔐 **Xác thực Admin**: Hệ thống đăng nhập với Custom Claims và Remember Me
- 🖼️ **Hiển thị Media**: Tự động tạo URL công khai với token-based access control
- 🛡️ **App Check**: Bảo vệ Cloud Functions và Firestore khỏi spam và lạm dụng
- 🎨 **Giao diện hiện đại**: Sử dụng ShadCN UI components với Tailwind CSS

Để bắt đầu, hãy xem `src/app/page.tsx`.

## Công nghệ sử dụng

Dự án này được xây dựng với một bộ công nghệ full-stack TypeScript hiện đại:

*   **Framework**: [Next.js](https://nextjs.org/) (sử dụng App Router)
*   **Ngôn ngữ**: [TypeScript](https://www.typescriptlang.org/)
*   **Giao diện người dùng (UI)**: [ShadCN UI](https://ui.shadcn.com/)
*   **Tạo kiểu (Styling)**: [Tailwind CSS](https://tailwindcss.com/)
*   **Biểu tượng (Icons)**: [Lucide React](https://lucide.dev/)
*   **Backend & Cơ sở dữ liệu**: [Firebase](https://firebase.google.com/) (Firestore, Firebase Authentication)
*   **Quản lý biểu mẫu**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
*   **Định dạng ngày**: [date-fns](https://date-fns.org/)

## Biến môi trường

Sao chép `.env.example` (nếu có) hoặc đặt trực tiếp trong Firebase App Hosting:

| Biến | Mô tả |
| --- | --- |
| `FIREBASE_PROJECT_ID` | Project ID cho Firebase Admin SDK |
| `FIREBASE_CLIENT_EMAIL` | Client email của service account |
| `FIREBASE_PRIVATE_KEY` | Private key của service account (dùng `\n` cho xuống dòng) |
| `FIREBASE_STORAGE_BUCKET` | Tên bucket Storage (ví dụ `project-id.appspot.com`) |
| `NEXT_PUBLIC_CLOUD_FUNCTIONS_BASE_URL` | URL gốc Cloud Functions gen2 (ví dụ `https://region-project.cloudfunctions.net`) |
| `NEXT_PUBLIC_FIREBASE_APP_CHECK_KEY` | App Check reCAPTCHA Enterprise site key |
| `NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_KEY` | reCAPTCHA Enterprise key dùng trên web |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | (Tùy chọn) GA4 Measurement ID |
| `NEXT_PUBLIC_SEARCH_CONSOLE_VERIFICATION` | (Tùy chọn) mã xác minh Search Console |
| `NEXT_PUBLIC_TRIPADVISOR_WIDGET_URL` | (Tùy chọn) URL iframe Tripadvisor |
| `NEXT_PUBLIC_GOOGLE_REVIEWS_WIDGET_URL` | (Tùy chọn) URL iframe Google Reviews |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL (ví dụ `https://tourfeedbackhub.com`) |

## Cài đặt và Chạy

```bash
# Cài đặt dependencies
npm install

# Chạy development server (localhost only)
npm run dev

# Chạy development server cho LAN/Mobile testing
npm run dev:lan

# Build production
npm run build

# Chạy production server
npm start
```

### Development URLs:

- **Localhost**: `http://localhost:9002`
- **LAN/Mobile**: `http://<YOUR_LAN_IP>:9002` (e.g., `http://192.168.1.11:9002`)

### Testing on Mobile Devices (LAN):

1. **Start LAN dev server**:
   ```bash
   npm run dev:lan
   ```

2. **Find your LAN IP**:
   - **Windows**: `ipconfig` (look for IPv4 Address)
   - **macOS/Linux**: `ifconfig` or `ip addr` (look for inet address, usually 192.168.x.x)

3. **Connect from mobile**:
   - Ensure mobile is on the same Wi-Fi network
   - Open browser and navigate to: `http://<YOUR_LAN_IP>:9002`
   - Example: `http://192.168.1.11:9002/admin`

4. **Firebase App Check behavior**:
   - ✅ **Development mode**: App Check is **BYPASSED** (works on any domain/IP)
   - 🔒 **Production mode**: App Check is **ENFORCED** with reCAPTCHA v3
   - No need to add `192.168.x.x` to Firebase Console in dev mode!

### Production Deployment (Firebase App Check Setup):

When deploying to production, you **MUST** configure Firebase App Check:

1. **Get reCAPTCHA v3 site key**:
   - Go to: [Firebase Console](https://console.firebase.google.com) > **App Check** > **Web App**
   - Register your app with **reCAPTCHA v3** provider
   - Copy the site key

2. **Add to environment variables**:
   ```bash
   # In .env.local (for local production builds)
   NEXT_PUBLIC_RECAPTCHA_KEY=your_site_key_here
   ```

3. **Add production domains to App Check allowlist**:
   - Go to: Firebase Console > **App Check** > Click your web app
   - Under **reCAPTCHA settings**, add **Allowed Domains**:
     - `your-project.web.app`
     - `your-project.firebaseapp.com`
     - `*.web.app` (if using Firebase Hosting)
     - Your custom domain (if applicable)

4. **Test production build locally**:
   ```bash
   NODE_ENV=production npm run build
   npm start
   ```

**Important**: Never commit `.env.local` with real keys to version control!

## Upload Media cho Tour

Ứng dụng hỗ trợ upload hình ảnh và video cho các tour với cơ chế token-based access control:

### Cách thức hoạt động:

1. **Upload nhỏ (< 8MB)**: Sử dụng base64 encoding và Cloud Function `adminTourUploadDirect`
2. **Upload lớn (>= 8MB)**: Sử dụng signed URL từ Cloud Function `adminTourUploadUrl`

### Định dạng hỗ trợ:

- **Hình ảnh**: JPEG, PNG, WebP, HEIC (tối đa 10MB)
- **Video**: MP4, QuickTime, WebM (tối đa 100MB)

### Storage Rules:

Các file được lưu tại đường dẫn `/tours/{tourId}/` trong Firebase Storage và tự động được gán public download token để cho phép truy cập công khai mà không cần authentication.

## Xác thực Admin

### Đăng nhập:

- Truy cập `/admin/login`
- Sử dụng email và password
- Chọn "Remember Me" để lưu trạng thái đăng nhập

### Phân quyền:

Admin được xác định thông qua Custom Claims (`admin: true`). Để cấp quyền admin cho user:

```javascript
// Sử dụng Firebase Admin SDK
await admin.auth().setCustomUserClaims(uid, { admin: true });
```

## Cloud Functions

Dự án sử dụng Firebase Cloud Functions Gen 2:

- `feedbackSubmit`: Xử lý feedback từ khách hàng
- `feedbackUploadComplete`: Xác nhận hoàn tất upload feedback photo
- `adminFeedbackApprove`: Phê duyệt feedback
- `adminFeedbackReject`: Từ chối feedback
- `adminTourUploadDirect`: Upload media trực tiếp (base64)
- `adminTourUploadUrl`: Tạo signed URL cho upload lớn

### Deploy Functions:

```bash
cd functions
npm run build
firebase deploy --only functions
```

## Firestore Security Rules

Để deploy Firestore và Storage rules:

```bash
# Deploy cả hai
firebase deploy --only firestore:rules,storage

# Hoặc riêng lẻ
firebase deploy --only firestore:rules
firebase deploy --only storage
```


