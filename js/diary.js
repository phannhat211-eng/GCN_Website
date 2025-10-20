// Chờ cho trang web tải xong
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DÁN "CHÌA KHÓA" CỦA BẠN VÀO ĐÂY ---
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
    const auth = firebase.auth();
    const db = firebase.firestore();

    // --- 3. LẤY CÁC THÀNH PHẦN (ELEMENTS) TRÊN TRANG ---
    const diaryEntryText = document.getElementById('diary-entry');
    const saveEntryButton = document.getElementById('save-entry-button');
    const entriesContainer = document.getElementById('entries-container');
    const diaryStatus = document.getElementById('diary-status');
    const diaryWrapper = document.getElementById('diary-wrapper');
    const diaryLoadingStatus = document.getElementById('diary-loading-status');

    let currentUserId = null;

    // --- 4. HÀM CHÍNH: KIỂM TRA AN NINH (SỬA LỖI DỨT ĐIỂM) ---
    // auth.onAuthStateChanged trả về một hàm "unsubscribe"
    // Chúng ta gọi nó là "unsubscribe"
    const unsubscribe = auth.onAuthStateChanged(user => {
        
        // Ngay khi nhận được câu trả lời ĐẦU TIÊN từ Firebase,
        // chúng ta "hủy đăng ký" (unsubscribe) để nó không chạy 2 lần.
        unsubscribe(); 

        if (user) {
            // --- NGƯỜI DÙNG ĐÃ ĐĂNG NHẬP (Chắc chắn) ---
            console.log("Xác nhận đã đăng nhập:", user.uid);
            currentUserId = user.uid;
            
            diaryLoadingStatus.style.display = 'none';
            diaryWrapper.style.display = 'block';
            
            loadDiaryEntries(currentUserId);
            
        } else {
            // --- NGƯỜI DÙNG CHƯA ĐĂNG NHẬP (Chắc chắn) ---
            console.log("Xác nhận chưa đăng nhập. Đang chuyển về login...");
            
            diaryLoadingStatus.textContent = "Chưa đăng nhập. Đang chuyển về trang đăng nhập...";
            
            // Không cần chờ nữa, chuyển hướng ngay lập tức
            window.location.href = 'login.html'; 
        }
    });

    // --- 5. LẮNG NGHE SỰ KIỆN NÚT "LƯU LẠI" ---
    saveEntryButton.addEventListener('click', e => {
        e.preventDefault();
        
        const entryContent = diaryEntryText.value;

        if (entryContent.trim() === "") {
            diaryStatus.textContent = "Bạn chưa viết gì cả!";
            return;
        }
        if (!currentUserId) {
            diaryStatus.textContent = "Lỗi! Vui lòng đăng nhập lại.";
            return;
        }

        diaryStatus.textContent = "Đang lưu...";

        db.collection('diaryEntries').add({
            userId: currentUserId,
            content: entryContent,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(docRef => {
            console.log("Đã lưu nhật ký với ID:", docRef.id);
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
                    
                    entryElement.innerHTML = `
                        <div class="entry-date">${date}</div>
                        <div class="entry-content">${entry.content}</div>
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

    // --- 7. BỘ NÃO LẮNG NGHE SỰ KIỆN NÚT "XÓA" ---
    entriesContainer.addEventListener('click', e => {
        if (e.target.classList.contains('delete-button')) {
            const docId = e.target.dataset.id;
            
            if (confirm('Bạn có chắc muốn xóa nhật ký này không? Hành động này không thể hoàn tác!')) {
                db.collection('diaryEntries').doc(docId).delete()
                    .then(() => {
                        console.log("Đã xóa nhật ký thành công!");
                        e.target.closest('.entry').remove();
                    })
                    .catch(error => {
                        console.error("Lỗi khi xóa:", error);
                        alert("Không thể xóa nhật ký lúc này.");
                    });
            }
        }
    });

});