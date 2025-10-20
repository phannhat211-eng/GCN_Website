// Chờ cho trang web tải xong
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DÁN "CHÌA KHÓA" CỦA BẠN VÀO ĐÂY ---
    // (Bạn đã dán đúng!)
    const firebaseConfig = {
  apiKey: "AIzaSyC-QrSW72xKgib98QThqCfA5sS_i1abvUE",
  authDomain: "gcn-website.firebaseapp.com",
  projectId: "gcn-website",
  storageBucket: "gcn-website.firebasestorage.app",
  messagingSenderId: "289554109673",
  appId: "1:289554109673:web:c351328dc4d4062a4c8c78"
};

    // --- 2. KHỞI TẠO FIREBASE ---
    firebase.initializeApp(firebaseConfig);

    // Lấy các dịch vụ Authentication và Firestore
    const auth = firebase.auth();
    const db = firebase.firestore();

    // --- 3. LẤY CÁC THÀNH PHẦN (ELEMENTS) TRÊN TRANG ---
    // Form Đăng nhập
    const loginForm = document.getElementById('login-form');
    const loginEmail = document.getElementById('login-email');
    const loginPassword = document.getElementById('login-password');
    const loginButton = document.getElementById('login-button');

    // Form Đăng ký
    const registerForm = document.getElementById('register-form');
    const registerEmail = document.getElementById('register-email');
    const registerPassword = document.getElementById('register-password');
    const registerButton = document.getElementById('register-button');

    // Khu vực Đăng xuất
    const logoutContainer = document.getElementById('logout-container');
    const userEmailDisplay = document.getElementById('user-email');
    const logoutButton = document.getElementById('logout-button');
    
    // Thông báo lỗi
    const authError = document.getElementById('auth-error');

    // --- 4. HÀM CHÍNH: THEO DÕI TRẠNG THÁI ĐĂNG NHẬP ---
    // Đây là "người gác cổng" chính.
    // Nó sẽ tự động chạy khi tải trang và mỗi khi trạng thái đăng nhập thay đổi
    auth.onAuthStateChanged(user => {
        if (user) {
            // --- NGƯỜI DÙNG ĐÃ ĐĂNG NHẬP ---
            console.log("Đã đăng nhập:", user.email);
            
            // Ẩn form đăng nhập/đăng ký
            loginForm.style.display = 'none';
            registerForm.style.display = 'none';
            
            // Hiển thị khu vực đăng xuất
            logoutContainer.style.display = 'block';
            userEmailDisplay.textContent = `Chào mừng, ${user.email}`;
            authError.textContent = ''; // Xóa thông báo lỗi cũ
            
        } else {
            // --- NGƯỜI DÙNG ĐÃ ĐĂNG XUẤT HOẶC CHƯA ĐĂNG NHẬP ---
            console.log("Chưa đăng nhập.");
            
            // Hiển thị form đăng nhập/đăng ký
            loginForm.style.display = 'block';
            registerForm.style.display = 'block';
            
            // Ẩn khu vực đăng xuất
            logoutContainer.style.display = 'none';
            userEmailDisplay.textContent = '';
        }
    });

    // --- 5. LẮNG NGHE SỰ KIỆN NÚT ĐĂNG KÝ ---
    registerButton.addEventListener('click', e => {
        e.preventDefault(); // Ngăn form tự gửi đi
        
        const email = registerEmail.value;
        const password = registerPassword.value;

        auth.createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
                // Đăng ký thành công!
                console.log("Đăng ký thành công:", userCredential.user);
                // (Hàm onAuthStateChanged ở trên sẽ tự động chạy và cập nhật giao diện)
                authError.textContent = ''; // Xóa lỗi
            })
            .catch(error => {
                // Xử lý lỗi
                console.error("Lỗi Đăng ký:", error.message);
                authError.textContent = `Lỗi: ${error.message}`;
            });
    });

    // --- 6. LẮNG NGHE SỰ KIỆN NÚT ĐĂNG NHẬP ---
    loginButton.addEventListener('click', e => {
        e.preventDefault();
        
        const email = loginEmail.value;
        const password = loginPassword.value;

        auth.signInWithEmailAndPassword(email, password)
            .then(userCredential => {
                // Đăng nhập thành công!
                console.log("Đăng nhập thành công:", userCredential.user);
                // (Hàm onAuthStateChanged ở trên sẽ tự động chạy)
                authError.textContent = '';
            })
            .catch(error => {
                // Xử lý lỗi
                console.error("Lỗi Đăng nhập:", error.message);
                authError.textContent = `Lỗi: ${error.message}`;
            });
    });

    // --- 7. LẮNG NGHE SỰ KIỆN NÚT ĐĂNG XUẤT ---
    logoutButton.addEventListener('click', e => {
        e.preventDefault();
        
        auth.signOut()
            .then(() => {
                // Đăng xuất thành công!
                console.log("Đã đăng xuất.");
                // (Hàm onAuthStateChanged ở trên sẽ tự động chạy)
            })
            .catch(error => {
                // Xử lý lỗi
                console.error("Lỗi Đăng xuất:", error.message);
                authError.textContent = `Lỗi: ${error.message}`;
            });
    });

});