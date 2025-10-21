document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Lấy các thành phần HTML ---
    const audio = document.getElementById('audio-source');
    const coverArt = document.getElementById('cover-art');
    const songTitle = document.getElementById('song-title');
    const songArtist = document.getElementById('song-artist');
    const playPauseButton = document.getElementById('play-pause-button');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const playPauseIcon = playPauseButton?.querySelector('i');
    const playlistItemsContainer = document.getElementById('playlist-items');
    const musicCoverContainer = document.querySelector('.music-cover');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');

    // Kiểm tra các phần tử quan trọng
    if (!audio || !playPauseButton || !progressContainer || !progressBar || !playlistItemsContainer || !currentTimeEl || !durationEl) {
        console.error("Lỗi: Thiếu một hoặc nhiều phần tử HTML cần thiết cho trình phát nhạc!");
        return;
    }

    // --- 2. Định nghĩa Danh sách Bài hát ---
    const songs = [ /* Giữ nguyên danh sách songs của bạn */ ];

    let currentSongIndex = 0;
    let isPlaying = false;

    // --- HÀM: Vẽ danh sách nhạc ---
    function renderPlaylist() {
        playlistItemsContainer.innerHTML = '';
        songs.forEach((song, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = `${index + 1}. ${song.title} - ${song.artist}`;
            listItem.dataset.index = index;
            listItem.addEventListener('click', () => {
                if (currentSongIndex !== index) {
                    currentSongIndex = index;
                    loadSong(songs[currentSongIndex]);
                    playSong();
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


    // --- HÀM: Tải một Bài hát ---
    function loadSong(song) {
        console.log("Loading song:", song.title);
        if (musicCoverContainer) {
            musicCoverContainer.style.animation = 'none';
            musicCoverContainer.offsetHeight;
            musicCoverContainer.style.animation = null;
        }
        if (songTitle) songTitle.textContent = song.title;
        if (songArtist) songArtist.textContent = song.artist;
        if (audio) audio.src = song.src;
        if (coverArt) coverArt.src = song.cover;
        updatePlaylistHighlight();
        if (progressBar) progressBar.style.width = '0%';
        if (currentTimeEl) currentTimeEl.textContent = '0:00';
        if (durationEl) durationEl.textContent = '0:00';
        isPlaying = false; // Reset isPlaying khi load bài mới
        updatePlayPauseUI(); // Reset nút về Play
    }

    // --- HÀM: Phát nhạc ---
    function playSong() {
        // Chỉ play nếu chưa phát và audio đã có dữ liệu hoặc đang tải
        if (!isPlaying && audio.readyState >= 1) { // HAVE_METADATA or more
            console.log("Attempting audio.play()");
            audio.play().then(() => {
                isPlaying = true;
                updatePlayPauseUI();
                console.log("Playing:", audio.src);
            }).catch(error => {
                console.error("Error playing audio:", error);
                isPlaying = false;
                updatePlayPauseUI();
            });
        } else if (!isPlaying && audio.readyState === 0) { // HAVE_NOTHING
             console.log("Audio not ready, waiting for 'canplay'...");
             // Tự động play khi audio sẵn sàng (chỉ 1 lần)
             audio.addEventListener('canplay', playSong, { once: true });
        } else {
             console.warn("Cannot play, isPlaying:", isPlaying, "readyState:", audio.readyState);
        }
    }

    // --- HÀM: Tạm dừng nhạc ---
    function pauseSong() {
        if (isPlaying) {
            audio.pause();
            isPlaying = false;
            updatePlayPauseUI();
            console.log("Paused");
        }
    }

    // --- HÀM: Chuyển đổi Play/Pause ---
    function togglePlayPause() {
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
        loadSong(songs[currentSongIndex]);
        if (wasPlaying) playSong();
    }

    // --- HÀM: Chuyển bài sau ---
    function nextSong() {
        const wasPlaying = isPlaying;
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        loadSong(songs[currentSongIndex]);
        if (wasPlaying) playSong();
    }

    // --- HÀM: Định dạng giây thành MM:SS ---
    function formatTime(seconds) {
        if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) return '0:00'; // Kiểm tra kỹ hơn
        const minutes = Math.floor(seconds / 60);
        let secs = Math.floor(seconds % 60);
        secs = secs < 10 ? `0${secs}` : secs;
        return `${minutes}:${secs}`;
    }

    // --- HÀM: Cập nhật thanh tiến trình và thời gian ---
    function updateProgress() {
        const duration = audio.duration;
        const currentTime = audio.currentTime;

        // Chỉ cập nhật nếu duration hợp lệ
        if (duration && isFinite(duration) && duration > 0) {
            const progressPercent = (currentTime / duration) * 100;
            if(progressBar) progressBar.style.width = `${progressPercent}%`;
            if (currentTimeEl) currentTimeEl.textContent = formatTime(currentTime);
        } else {
             // Reset nếu duration không hợp lệ (ví dụ: khi đang load)
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
                 // Cập nhật thanh ngay lập tức (không chờ timeupdate)
                 updateProgress();
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
        audio.addEventListener('timeupdate', updateProgress); // Cập nhật liên tục
        audio.addEventListener('loadedmetadata', () => { // Cập nhật tổng thời gian
            const duration = audio.duration;
            console.log("loadedmetadata - duration:", duration);
            if (durationEl && duration && isFinite(duration) && duration > 0) {
                durationEl.textContent = formatTime(duration);
            } else if (durationEl) {
                 durationEl.textContent = '--:--'; // Hoặc '0:00' nếu không có duration
            }
        });
        audio.addEventListener('error', (e) => { // Bắt lỗi audio
            console.error("Audio Element Error:", e);
            if(songTitle) songTitle.textContent = "Lỗi nhạc";
            if(songArtist) songArtist.textContent = "-";
            isPlaying = false;
            updatePlayPauseUI();
        });
         // Sự kiện này giúp đảm bảo isPlaying = false nếu audio bị dừng đột ngột
         audio.addEventListener('pause', () => {
             if (!audio.ended) { // Chỉ cập nhật nếu không phải là kết thúc bài
                 isPlaying = false;
                 updatePlayPauseUI();
                 console.log("Paused event triggered");
             }
         });
         // Sự kiện này cập nhật isPlaying = true nếu audio tự play (ví dụ sau khi seek)
         audio.addEventListener('playing', () => {
             isPlaying = true;
             updatePlayPauseUI();
             console.log("Playing event triggered");
         });
    }
    if (progressContainer) progressContainer.addEventListener('click', setProgress);


    // --- KHỞI ĐỘNG ---
    if (songs && songs.length > 0) {
        renderPlaylist();
        loadSong(songs[currentSongIndex]);
    } else {
        console.error("Song list is empty or invalid!");
        if(songTitle) songTitle.textContent = "Không có bài hát";
    }

});