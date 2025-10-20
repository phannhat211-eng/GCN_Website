// Chờ cho trang web tải xong
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DÁN "CHÌA KHÓA" CỦA BẠN VÀO ĐÂY ---
    const firebaseConfig = {
  apiKey: "AIzaSyC-QRSW72xkgib98QThqCfA5sS_ilAbvUE",
  authDomain: "gcn-website.firebaseapp.com",
  projectId: "gcn-website",
  storageBucket: "gcn-website.firebasestorage.app",
  messagingSenderId: "289554109673",
  appId: "1:289554109673:web:c351328dc4d4062a4c8c78"
};

    // --- 2. KHỞI TẠO FIREBASE ---
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();

    // --- 3. LẤY CÁC THÀNH PHẦN (ELEMENTS) TRÊN TRANG ---
    const diaryEntryText = document.getElementById('diary-entry');
    const saveEntryButton = document.getElementById('save-entry-button');
    const entriesContainer = document.getElementById('entries-container');
    const diaryStatus = document.getElementById('diary-status');
    const diaryWrapper = document.getElementById('diary-wrapper');
    const diaryLoadingStatus = document.getElementById('diary-loading-status');

    // **LẤY CÁC THÀNH PHẦN MODAL MỚI**
    const editModal = document.getElementById('edit-modal');
    const editEntryTextarea = document.getElementById('edit-entry-textarea');
    const saveEditButton = document.getElementById('save-edit-button');
    const cancelEditButton = document.getElementById('cancel-edit-button');

    let currentUserId = null;
    let currentEditingDocId = null; // Biến lưu ID của entry đang sửa

    // --- 4. HÀM CHÍNH: KIỂM TRA AN NINH ---
    const unsubscribe = auth.onAuthStateChanged(user => {
        unsubscribe(); // Chạy 1 lần duy nhất

        if (user) {
            // Đã đăng nhập
            console.log("Xác nhận đã đăng nhập:", user.uid);
            currentUserId = user.uid;
            
            diaryLoadingStatus.style.display = 'none';
            diaryWrapper.style.display = 'block';
            
            loadDiaryEntries(currentUserId);
            
        } else {
            // Chưa đăng nhập
            console.log("Xác nhận chưa đăng nhập. Đang chuyển về login...");
            diaryLoadingStatus.textContent = "Chưa đăng nhập. Đang chuyển về trang đăng nhập...";
            window.location.href = 'login.html'; 
        }
    });

    // --- 5. LẮNG NGHE SỰ KIỆN NÚT "LƯU LẠI" (VIẾT MỚI) ---
    saveEntryButton.addEventListener('click', e => {
        e.preventDefault();
        const entryContent = diaryEntryText.value;
        if (entryContent.trim() === "") return;
        if (!currentUserId) return;
        diaryStatus.textContent = "Đang lưu...";

        db.collection('diaryEntries').add({
            userId: currentUserId,
            content: entryContent,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            diaryStatus.textContent = "Đã lưu thành công!";
            diaryEntryText.value = "";
            loadDiaryEntries(currentUserId); 
        })
        .catch(error => {
            console.error("Lỗi khi lưu:", error);
            diaryStatus.textContent = `Lỗi: ${error.message}`;
        });
    });

    // --- 6. HÀM TẢI CÁC NHẬT KÝ CŨ ---
    function loadDiaryEntries(userId) {
        if (!userId) return;
        entriesContainer.innerHTML = "<p>Đang tải nhật ký cũ...</p>";

        db.collection('diaryEntries')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get()
            .then(querySnapshot => {
                if (querySnapshot.empty) {
                    entriesContainer.innerHTML = "<p>Bạn chưa có nhật ký nào cả. Hãy viết gì đó đi!</p>";
                    return;
                }
                entriesContainer.innerHTML = "";
                
                querySnapshot.forEach(doc => {
                    const entry = doc.data();
                    const date = entry.createdAt ? entry.createdAt.toDate().toLocaleString('vi-VN') : 'Không rõ ngày';
                    
                    const entryElement = document.createElement('div');
                    entryElement.className = 'entry';
                    // **THÊM NÚT "SỬA" VÀO ĐÂY**
                    entryElement.innerHTML = `
                        <div class="entry-date">${date}</div>
                        <div class="entry-content">${entry.content}</div>
                        <button class="edit-button" data-id="${doc.id}" data-content="${escape(entry.content)}">Sửa</button>
                        <button class="delete-button" data-id="${doc.id}">Xóa</button>
                    `;
                    entriesContainer.appendChild(entryElement);
                });
            })
            .catch(error => {
                console.error("Lỗi khi tải nhật ký:", error);
                entriesContainer.innerHTML = "<p>Không thể tải được nhật ký cũ.</p>";
            });
    }

    // --- 7. BỘ NÃO LẮNG NGHE SỰ KIỆN NÚT "XÓA" VÀ "SỬA" ---
    entriesContainer.addEventListener('click', e => {
        
        // --- CHỨC NĂNG XÓA (code cũ) ---
        if (e.target.classList.contains('delete-button')) {
            const docId = e.target.dataset.id;
            if (confirm('Bạn có chắc muốn xóa nhật ký này không?')) {
                db.collection('diaryEntries').doc(docId).delete()
                    .then(() => {
                        e.target.closest('.entry').remove();
                    })
                    .catch(error => {
                        console.error("Lỗi khi xóa:", error);
                        alert("Không thể xóa nhật ký lúc này.");
                    });
            }
        }
        
        // --- CHỨC NĂNG SỬA (CODE MỚI) ---
        if (e.target.classList.contains('edit-button')) {
            // Lấy ID và nội dung cũ từ nút
            currentEditingDocId = e.target.dataset.id;
            const content = unescape(e.target.dataset.content);
            
            // Đổ nội dung cũ vào hộp thoại
            editEntryTextarea.value = content;
            
            // Hiện hộp thoại
            editModal.style.display = 'flex';
        }
    });
    
    // --- 8. BỘ NÃO CHO NÚT "HỦY BỎ" (TRONG MODAL) ---
    cancelEditButton.addEventListener('click', () => {
        // Ẩn hộp thoại
        editModal.style.display = 'none';
        currentEditingDocId = null; // Xóa ID đang sửa
        editEntryTextarea.value = ""; // Xóa text
    });
    
    // --- 9. BỘ NÃO CHO NÚT "LƯU THAY ĐỔI" (TRONG MODAL) ---
    saveEditButton.addEventListener('click', () => {
        const newContent = editEntryTextarea.value;
        
        if (!currentEditingDocId || newContent.trim() === "") {
            return;
        }
        
        saveEditButton.textContent = "Đang lưu..."; // Báo đang lưu
        
        // Gọi Firestore để CẬP NHẬT (update)
        db.collection('diaryEntries').doc(currentEditingDocId).update({
            content: newContent
            // (Không cần cập nhật createdAt, giữ ngày gốc)
        })
        .then(() => {
            console.log("Cập nhật thành công!");
            // Ẩn hộp thoại
            editModal.style.display = 'none';
            currentEditingDocId = null;
            editEntryTextarea.value = "";
            saveEditButton.textContent = "Lưu Thay Đổi"; // Trả lại text cũ
            
            // Tải lại toàn bộ nhật ký để thấy thay đổi
            loadDiaryEntries(currentUserId);
        })
        .catch(error => {
            console.error("Lỗi khi cập nhật:", error);
            saveEditButton.textContent = "Lưu Thay Đổi";
            alert("Lỗi, không thể lưu thay đổi.");
        });
    });

});