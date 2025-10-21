document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Lấy các thành phần HTML ---
    const audio = document.getElementById('audio-source');
    const coverArt = document.getElementById('cover-art');
    const songTitle = document.getElementById('song-title');
    const songArtist = document.getElementById('song-artist');
    const playPauseButton = document.getElementById('play-pause-button');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const playPauseIcon = playPauseButton?.querySelector('i'); // Dùng optional chaining (?)
    const playlistItemsContainer = document.getElementById('playlist-items');
    const musicCoverContainer = document.querySelector('.music-cover');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');
    const searchInput = document.getElementById('search-input'); // <-- THÊM DÒNG NÀY

    // Kiểm tra các phần tử quan trọng
    if (!audio || !playPauseButton || !progressContainer || !progressBar || !playlistItemsContainer || !currentTimeEl || !durationEl) {
        console.error("Lỗi: Thiếu một hoặc nhiều phần tử HTML cần thiết cho trình phát nhạc!");
        return; // Dừng nếu thiếu
    }

    // --- 2. Định nghĩa Danh sách Bài hát (ĐẢM BẢO KHAI BÁO ĐÚNG) ---
    const songs = [
        { title: 'Kho Báu (with Rhymastic)', artist: 'Trọng Hiếu', src: 'music/kho_bau.mp3', cover: 'images/cover-placeholder-2.png' },
        { title: 'Kỵ Sĩ Và Ánh Sao', artist: 'Đông Nhi', src: 'music/ky_si_va_anh_sao.mp3', cover: 'images/cover-placeholder-4.png' },
        { title: 'Lộc Hải Vi Đường', artist: 'Đồng Nhân', src: 'music/loc_hai_2.mp3', cover: 'images/cover-placeholder-5.png' },
        { title: 'Phép Màu', artist: 'MAYDAY ft Minh Tốc', src: 'music/phep_mau.mp3', cover: 'images/cover-placeholder-3.png' },
        { title: 'Cảm nắng', artist: 'Suni Hạ Linh', src: 'music/cam_nang.mp3', cover: 'images/cover-placeholder-8.png' },
        { title: 'Thật quá đáng để yêu', artist: 'AMEE NICKY', src: 'music/qua_dang.mp3', cover: 'images/cover-placeholder-7.png' },
        { title: 'Lặng', artist: 'Rhymastic', src: 'music/lang.mp3', cover: 'images/cover-placeholder-9.png' },
        { title: 'Dù cho tận thế', artist: 'Erik', src: 'music/dctt.mp3', cover: 'images/cover-placeholder-10.png' },
        { title: 'Giá Như', artist: 'Chilly Cover', src: 'music/gia_nhu.mp3', cover: 'images/cover-placeholder-6.png' }
    ];
    // --- KẾT THÚC DANH SÁCH BÀI HÁT ---

    let currentSongIndex = 0;
    let isPlaying = false;

    // --- HÀM: Vẽ danh sách nhạc ---
    // --- HÀM: Vẽ danh sách nhạc ra HTML (ĐÃ SỬA ĐỂ LỌC) ---
function renderPlaylist(songsToRender = songs) { // Cho phép nhận danh sách lọc, mặc định là songs gốc
    if (!playlistItemsContainer) {
        console.error("renderPlaylist: playlistItemsContainer not found.");
        return;
    }
    playlistItemsContainer.innerHTML = ''; // Xóa list cũ

    // Kiểm tra danh sách có bài hát không
    if (!Array.isArray(songsToRender) || songsToRender.length === 0) {
        const listItem = document.createElement('li');
        listItem.textContent = (searchInput && searchInput.value) ? 'Không tìm thấy kết quả.' : 'Không có bài hát nào.'; // Thông báo khác nhau
        listItem.style.cursor = 'default';
        playlistItemsContainer.appendChild(listItem);
        // console.log("renderPlaylist: No songs to display."); // Bỏ log này đi cũng được
        return;
    }

    // Vẽ các bài hát từ danh sách được truyền vào
    songsToRender.forEach((song) => { // Không cần index ở đây nữa
        // **QUAN TRỌNG:** Tìm index gốc của bài hát trong mảng 'songs' đầy đủ
        const originalIndex = songs.findIndex(originalSong => originalSong.src === song.src);
        // Bỏ qua nếu không tìm thấy index gốc (phòng lỗi hiếm gặp)
        if (originalIndex === -1) {
             console.warn("renderPlaylist: Could not find original index for song:", song.title);
             return; // Bỏ qua bài hát này
        }

        const listItem = document.createElement('li');
        // Hiển thị số thứ tự gốc + 1
        listItem.textContent = `${originalIndex + 1}. ${song.title || 'N/A'} - ${song.artist || 'N/A'}`;
        listItem.dataset.index = originalIndex; // **LUÔN LƯU INDEX GỐC**

        listItem.addEventListener('click', () => {
            const clickedIndex = parseInt(listItem.dataset.index, 10);
            if (!isNaN(clickedIndex) && clickedIndex >= 0 && clickedIndex < songs.length) {
                if (currentSongIndex !== clickedIndex || !isPlaying) {
                    console.log("Playlist item clicked - loading original song index:", clickedIndex);
                    currentSongIndex = clickedIndex; // Cập nhật index hiện tại
                    loadSong(songs[currentSongIndex]); // Load bài hát từ mảng gốc
                    // Chờ audio sẵn sàng rồi mới play
                    if(audio.readyState >= 1) playSong();
                    else audio.addEventListener('canplay', playSong, { once: true });
                } else {
                    togglePlayPause(); // Click bài đang chạy -> Play/Pause
                }
            } else {
                console.error("Invalid index on playlist item click:", listItem.dataset.index);
            }
        });

        // Highlight nếu bài hát này đang được chọn (so sánh với currentSongIndex)
        if (originalIndex === currentSongIndex) {
             listItem.classList.add('playing');
        }

        playlistItemsContainer.appendChild(listItem);
    });
    console.log("Playlist rendered/filtered with", songsToRender.length, "songs.");
    // Không cần gọi updatePlaylistHighlight ở đây nữa vì đã xử lý highlight trong vòng lặp
}

    // --- HÀM: Cập nhật highlight (ĐÃ SỬA ĐỂ DÙNG dataset.index) ---
function updatePlaylistHighlight() {
    if (!playlistItemsContainer) return;
    const listItems = playlistItemsContainer.querySelectorAll('li');
    listItems.forEach(item => { // Không cần index ở đây
        // Lấy index gốc từ data-* attribute
        const itemIndex = parseInt(item.dataset.index, 10);
        // Kiểm tra itemIndex có hợp lệ không trước khi so sánh
         if (!isNaN(itemIndex)) {
            // Dùng classList.toggle cho gọn: thêm 'playing' nếu đúng, xóa nếu sai
            item.classList.toggle('playing', itemIndex === currentSongIndex);
         }
    });
    // console.log("Playlist highlight updated for currentSongIndex:", currentSongIndex); // Log nếu cần
}

     // --- HÀM: Cập nhật icon nút Play/Pause và đĩa quay ---
     function updatePlayPauseUI() {
        if (!playPauseButton || !playPauseIcon) return;
        if (isPlaying) {
            playPauseButton.classList.remove('play');
            playPauseIcon.classList.remove('fa-play');
            playPauseIcon.classList.add('fa-pause');
            if (musicCoverContainer) musicCoverContainer.classList.add('rotating');
        } else {
            playPauseButton.classList.add('play');
            playPauseIcon.classList.remove('fa-pause');
            playPauseIcon.classList.add('fa-play');
            if (musicCoverContainer) musicCoverContainer.classList.remove('rotating');
        }
    }

    // --- HÀM: Tải một Bài hát (THÊM KIỂM TRA SONG) ---
    function loadSong(song) {
        // **QUAN TRỌNG:** Kiểm tra xem 'song' có tồn tại không trước khi truy cập thuộc tính
        if (!song) {
            console.error("loadSong: Không thể tải bài hát không xác định (undefined). Index:", currentSongIndex);
            // Có thể hiển thị thông báo lỗi hoặc dừng nhạc
             if(songTitle) songTitle.textContent = "Lỗi bài hát";
             if(songArtist) songArtist.textContent = "-";
             if(audio) audio.src = ""; // Xóa src để dừng hẳn
             isPlaying = false;
             updatePlayPauseUI();
            return; // Dừng hàm
        }

        console.log("Loading song:", song.title);
        if (musicCoverContainer) {
            musicCoverContainer.style.animation = 'none';
            musicCoverContainer.offsetHeight;
            musicCoverContainer.style.animation = null;
        }
        if (songTitle) songTitle.textContent = song.title || 'Không tên'; // Thêm fallback
        if (songArtist) songArtist.textContent = song.artist || 'Không rõ'; // Thêm fallback
        if (audio) audio.src = song.src || ""; // Thêm fallback
        if (coverArt) coverArt.src = song.cover || 'images/cover-placeholder.png'; // Thêm fallback
        updatePlaylistHighlight();
        if (progressBar) progressBar.style.width = '0%';
        if (currentTimeEl) currentTimeEl.textContent = '0:00';
        if (durationEl) durationEl.textContent = '0:00';
        isPlaying = false; // Luôn reset isPlaying khi load bài mới
        updatePlayPauseUI();
    }

    // --- HÀM: Phát nhạc ---
    function playSong() {
        if (!isPlaying && audio.readyState >= 1) { // Chỉ play nếu chưa phát và có metadata
            console.log("Attempting audio.play() for:", audio.src);
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    isPlaying = true;
                    updatePlayPauseUI();
                    console.log("Playing:", audio.src);
                }).catch(error => {
                    console.error("Error playing audio:", error);
                    // Lỗi thường gặp: Người dùng chưa tương tác với trang
                    if (error.name === 'NotAllowedError') {
                         console.warn("Trình duyệt chặn tự động phát. Cần người dùng tương tác.");
                         // Có thể hiện thông báo yêu cầu click
                    }
                    isPlaying = false;
                    updatePlayPauseUI();
                });
            }
        } else if (!isPlaying && audio.readyState === 0 && audio.src) { // Nếu chưa có dữ liệu nhưng có src
             console.log("Audio not ready, waiting for 'canplay'...");
             audio.addEventListener('canplay', playSong, { once: true });
        } else if (!audio.src) {
             console.warn("Không thể phát, chưa có src audio.");
        } else {
             console.warn("Cannot play, isPlaying:", isPlaying, "readyState:", audio.readyState);
        }
    }

    // --- HÀM: Tạm dừng nhạc ---
    function pauseSong() {
        if (isPlaying) {
            audio.pause();
            // isPlaying sẽ tự cập nhật bởi event 'pause'
        }
    }

    // --- HÀM: Chuyển đổi Play/Pause ---
    function togglePlayPause() {
        console.log("togglePlayPause called. isPlaying:", isPlaying);
        if (isPlaying) {
            pauseSong();
        } else {
            playSong();
        }
    }


    // --- HÀM: Chuyển bài trước ---
    function prevSong() {
        const wasPlaying = isPlaying;
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        loadSong(songs[currentSongIndex]); // Load bài mới (sẽ set isPlaying = false)
        if (wasPlaying) {
             // Nếu trước đó đang phát, đợi audio sẵn sàng rồi mới play
             if(audio.readyState >= 1) playSong();
             else audio.addEventListener('canplay', playSong, { once: true });
        }
    }

    // --- HÀM: Chuyển bài sau ---
    function nextSong() {
        const wasPlaying = isPlaying;
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        loadSong(songs[currentSongIndex]); // Load bài mới (sẽ set isPlaying = false)
        if (wasPlaying) {
             if(audio.readyState >= 1) playSong();
             else audio.addEventListener('canplay', playSong, { once: true });
        }
    }

    // --- HÀM: Định dạng giây thành MM:SS ---
    function formatTime(seconds) {
        if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) return '0:00';
        const minutes = Math.floor(seconds / 60);
        let secs = Math.floor(seconds % 60);
        secs = secs < 10 ? `0${secs}` : secs;
        return `${minutes}:${secs}`;
    }

    // --- HÀM: Cập nhật thanh tiến trình và thời gian ---
    function updateProgress() {
        const duration = audio.duration;
        const currentTime = audio.currentTime;
        if (duration && isFinite(duration) && duration > 0) {
            const progressPercent = (currentTime / duration) * 100;
            if(progressBar) progressBar.style.width = `${progressPercent}%`;
            if (currentTimeEl) currentTimeEl.textContent = formatTime(currentTime);
        } else {
             if(progressBar) progressBar.style.width = '0%';
             if (currentTimeEl) currentTimeEl.textContent = '0:00';
        }
    }

    // --- HÀM: Tua nhạc ---
    function setProgress(e) {
        try {
            const width = progressContainer.clientWidth;
            const clickX = e.offsetX;
            const duration = audio.duration;
            if (duration && isFinite(duration) && duration > 0) {
                const newTime = (clickX / width) * duration;
                audio.currentTime = newTime;
                console.log(`Seek to: ${formatTime(newTime)}`);
                updateProgress(); // Cập nhật hiển thị ngay
            } else {
                 console.warn("Cannot seek, invalid duration:", duration);
            }
        } catch (error) {
            console.error("Error seeking:", error);
        }
    }

    // --- GÁN SỰ KIỆN ---
    if(playPauseButton) playPauseButton.addEventListener('click', togglePlayPause);
    if(prevButton) prevButton.addEventListener('click', prevSong);
    if(nextButton) nextButton.addEventListener('click', nextSong);

    if(audio) {
        audio.addEventListener('ended', nextSong);
        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('loadedmetadata', () => {
            const duration = audio.duration;
            console.log("loadedmetadata - duration:", duration);
            if (durationEl && duration && isFinite(duration) && duration > 0) {
                durationEl.textContent = formatTime(duration);
            } else if (durationEl) {
                 durationEl.textContent = '--:--';
            }
        });
        audio.addEventListener('error', (e) => {
            console.error("Audio Element Error:", e);
            if(songTitle) songTitle.textContent = "Lỗi nhạc";
            if(songArtist) songArtist.textContent = "-";
            isPlaying = false; updatePlayPauseUI();
        });
         audio.addEventListener('pause', () => {
             // Chỉ cập nhật nếu không phải là kết thúc bài (tránh xung đột với 'ended')
             // và nếu không phải do người dùng chủ động tua (seeking)
             if (!audio.ended && !audio.seeking) {
                 isPlaying = false;
                 updatePlayPauseUI();
                 console.log("Paused event triggered");
             }
         });
         audio.addEventListener('playing', () => {
             isPlaying = true;
             updatePlayPauseUI();
             console.log("Playing event triggered");
         });
         // Thêm sự kiện seeking/seeked để tránh cập nhật isPlaying sai khi tua
          audio.addEventListener('seeking', () => {
                console.log("Seeking started...");
          });
          audio.addEventListener('seeked', () => {
                console.log("Seeking ended.");
                // Sau khi tua xong, nếu audio không bị pause thì cập nhật lại UI play
                if(!audio.paused) {
                    isPlaying = true;
                    updatePlayPauseUI();
                }
          });

    }
    if (progressContainer) progressContainer.addEventListener('click', setProgress);

// ... (Code gán sự kiện cho audio và progressContainer) ...
    // --- KẾT THÚC BỔ SUNG SỰ KIỆN ---


    // --- DÁN CODE SỰ KIỆN TÌM KIẾM VÀO ĐÂY ---
    if (searchInput) { // Kiểm tra xem ô tìm kiếm có tồn tại không
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase().trim(); // Lấy từ khóa, chuẩn hóa
            console.log("Search term:", searchTerm); // Log để debug

            // Lọc mảng 'songs' gốc dựa trên từ khóa
            const filteredSongs = songs.filter(song => {
                // Kiểm tra an toàn trước khi gọi toLowerCase() và includes()
                const titleMatch = song.title && song.title.toLowerCase().includes(searchTerm);
                const artistMatch = song.artist && song.artist.toLowerCase().includes(searchTerm);
                // Trả về true nếu tên bài hát HOẶC tên ca sĩ khớp
                return titleMatch || artistMatch;
            });
            console.log("Filtered songs found:", filteredSongs.length); // Log số lượng kết quả

            // Vẽ lại playlist CHỈ với các bài hát đã lọc
            renderPlaylist(filteredSongs);
        });
        console.log("Search input listener added successfully.");
    } else {
        // Báo lỗi nếu không tìm thấy ô search trong HTML
        console.warn("Search input element (#search-input) not found.");
    }
    // --- KẾT THÚC SỰ KIỆN TÌM KIẾM ---


    // --- KHỞI ĐỘNG KHI TẢI TRANG ---
    console.log("Initializing player...");
    // ... (code khởi động như cũ) ...
    // --- KHỞI ĐỘNG ---
    // Kiểm tra songs trước khi dùng
    if (Array.isArray(songs) && songs.length > 0) {
        renderPlaylist();
        loadSong(songs[currentSongIndex]); // Chỉ tải bài đầu, không tự phát
    } else {
        console.error("Song list is empty or invalid! Check the 'songs' array definition.");
        if(songTitle) songTitle.textContent = "Không có bài hát";
        if(playlistItemsContainer) playlistItemsContainer.innerHTML = '<li>Lỗi tải danh sách.</li>';
    }

});