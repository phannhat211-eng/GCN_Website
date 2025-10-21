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
        { title: 'Giá Như', artist: 'Chilly Cover', src: 'music/gia_nhu.mp3', cover: 'images/cover-placeholder-6.png' }
    ];
    // --- KẾT THÚC DANH SÁCH BÀI HÁT ---

    let currentSongIndex = 0;
    let isPlaying = false;

    // --- HÀM: Vẽ danh sách nhạc ---
    function renderPlaylist() {
        // Kiểm tra songs có hợp lệ không
        if (!Array.isArray(songs) || songs.length === 0) {
            console.error("renderPlaylist: Danh sách 'songs' không hợp lệ hoặc trống.");
            if (playlistItemsContainer) playlistItemsContainer.innerHTML = '<li>Không có bài hát nào.</li>';
            return;
        }
        playlistItemsContainer.innerHTML = '';
        songs.forEach((song, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = `${index + 1}. ${song.title || 'Không tên'} - ${song.artist || 'Không rõ'}`; // Thêm fallback
            listItem.dataset.index = index;
            listItem.addEventListener('click', () => {
                const clickedIndex = parseInt(listItem.dataset.index, 10); // Đảm bảo index là số
                if (currentSongIndex !== clickedIndex) {
                    currentSongIndex = clickedIndex;
                    loadSong(songs[currentSongIndex]);
                    // Chỉ play nếu audio sẵn sàng
                    if (audio.readyState >= 1) playSong();
                    else audio.addEventListener('canplay', playSong, { once: true });
                } else {
                    togglePlayPause();
                }
            });
            playlistItemsContainer.appendChild(listItem);
        });
        console.log("Playlist rendered.");
    }

    // --- HÀM: Cập nhật highlight ---
    function updatePlaylistHighlight() {
        if (!playlistItemsContainer) return;
        const listItems = playlistItemsContainer.querySelectorAll('li');
        listItems.forEach((item, index) => {
            item.classList.toggle('playing', index === currentSongIndex);
        });
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