document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Lấy các thành phần HTML ---
    const audio = document.getElementById('audio-source');
    const coverArt = document.getElementById('cover-art');
    const songTitle = document.getElementById('song-title');
    const songArtist = document.getElementById('song-artist');
    const playPauseButton = document.getElementById('play-pause-button');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const playPauseIcon = playPauseButton.querySelector('i');
    const playlistItemsContainer = document.getElementById('playlist-items');
    const musicCoverContainer = document.querySelector('.music-cover');
    // **ĐÃ BỔ SUNG LẤY THANH TIẾN TRÌNH**
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    // --- KẾT THÚC LẤY THANH TIẾN TRÌNH ---

    // --- 2. Định nghĩa Danh sách Bài hát ---
    const songs = [
        {
            title: 'Kho Báu (with Rhymastic)',
            artist: 'Trọng Hiếu',
            src: 'music/kho_bau.mp3',
            cover: 'images/cover-placeholder-2.png'
        },
        {
            title: 'Kỵ Sĩ Và Ánh Sao',
            artist: 'Đông Nhi',
            src: 'music/ky_si_va_anh_sao.mp3',
            cover: 'images/cover-placeholder-4.png'
        },
        {
            title: 'Lộc Hải Vi Đường',
            artist: 'Đồng Nhân',
            src: 'music/loc_hai_2.mp3',
            cover: 'images/cover-placeholder-5.png' // Sửa lại placeholder đúng
        },
        {
            title: 'Phép Màu',
            artist: 'MAYDAY ft Minh Tốc',
            src: 'music/phep_mau.mp3',
            cover: 'images/cover-placeholder-3.png'
        },
        {
            title: 'Giá Như',
            artist: 'Chilly Cover',
            src: 'music/gia_nhu.mp3',
            cover: 'images/cover-placeholder-6.png' // Sửa lại placeholder đúng
        }
    ];

    let currentSongIndex = 0;
    let isPlaying = false;

    // --- HÀM: Vẽ danh sách nhạc ra HTML ---
    function renderPlaylist() {
        playlistItemsContainer.innerHTML = '';
        songs.forEach((song, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = `${index + 1}. ${song.title} - ${song.artist}`;
            listItem.dataset.index = index;

            listItem.addEventListener('click', () => {
                currentSongIndex = index;
                loadSong(songs[currentSongIndex]);
                playSong();
            });

            playlistItemsContainer.appendChild(listItem);
        });
    }

    // --- HÀM: Cập nhật highlight cho bài đang phát ---
    function updatePlaylistHighlight() {
        const listItems = playlistItemsContainer.querySelectorAll('li');
        listItems.forEach((item, index) => {
            if (index === currentSongIndex) {
                item.classList.add('playing');
            } else {
                item.classList.remove('playing');
            }
        });
    }

    // --- HÀM: Tải một Bài hát ---
    function loadSong(song) {
        // Reset đĩa quay
        musicCoverContainer.style.animation = 'none';
        musicCoverContainer.offsetHeight; // Force repaint
        musicCoverContainer.style.animation = null;

        songTitle.textContent = song.title;
        songArtist.textContent = song.artist;
        audio.src = song.src;
        coverArt.src = song.cover;
        updatePlaylistHighlight(); // Cập nhật highlight
        // Reset thanh tiến trình khi load bài mới (quan trọng)
        progressBar.style.width = '0%';
    }

    // --- HÀM: Phát nhạc ---
    function playSong() {
        isPlaying = true;
        playPauseButton.classList.remove('play');
        playPauseIcon.classList.remove('fa-play');
        playPauseIcon.classList.add('fa-pause');
        console.log("Đang cố phát:", audio.src);
        audio.play().catch(error => console.error("Lỗi khi phát nhạc:", error));
        musicCoverContainer.classList.add('rotating'); // Bắt đầu quay
    }

    // --- HÀM: Tạm dừng nhạc ---
    function pauseSong() {
        isPlaying = false;
        playPauseButton.classList.add('play');
        playPauseIcon.classList.remove('fa-pause');
        playPauseIcon.classList.add('fa-play');
        audio.pause();
        musicCoverContainer.classList.remove('rotating'); // Dừng quay
    }

    // --- HÀM: Chuyển bài trước ---
    function prevSong() {
        currentSongIndex--;
        if (currentSongIndex < 0) {
            currentSongIndex = songs.length - 1;
        }
        loadSong(songs[currentSongIndex]);
        if (isPlaying) playSong();
    }

    // --- HÀM: Chuyển bài sau ---
    function nextSong() {
        currentSongIndex++;
        if (currentSongIndex >= songs.length) {
            currentSongIndex = 0;
        }
        loadSong(songs[currentSongIndex]);
        if (isPlaying) playSong();
    }

    // --- HÀM MỚI: Cập nhật thanh tiến trình ---
    function updateProgress(e) {
        // Dùng destructuring để lấy duration và currentTime
        const { duration, currentTime } = e.srcElement;
        // Kiểm tra duration có hợp lệ không (tránh chia cho 0 hoặc NaN)
        if (duration) {
            const progressPercent = (currentTime / duration) * 100;
            progressBar.style.width = `${progressPercent}%`;
        }
         // Optional: Cập nhật hiển thị thời gian (sẽ làm ở bước sau)
        // updateTimerDisplay(currentTime, duration);
    }

    // --- HÀM MỚI: Xử lý khi nhấp vào thanh tiến trình để tua ---
    function setProgress(e) {
        const width = this.clientWidth; // Chiều rộng của progressContainer
        const clickX = e.offsetX; // Vị trí nhấp chuột bên trong container
        const duration = audio.duration; // Tổng thời gian bài hát

        // Chỉ tua nếu duration hợp lệ
        if (duration) {
            audio.currentTime = (clickX / width) * duration;
        }
    }
    // --- KẾT THÚC CÁC HÀM MỚI ---

    // --- GÁN SỰ KIỆN CHO CÁC NÚT VÀ AUDIO ---
    playPauseButton.addEventListener('click', () => {
        if (isPlaying) {
            pauseSong();
        } else {
            playSong();
        }
    });

    prevButton.addEventListener('click', prevSong);
    nextButton.addEventListener('click', nextSong);

    // Tự động chuyển bài tiếp theo khi bài hiện tại kết thúc
    audio.addEventListener('ended', nextSong);

    // **ĐÃ BỔ SUNG SỰ KIỆN CHO THANH TIẾN TRÌNH**
    // Sự kiện khi thời gian nhạc thay đổi -> cập nhật thanh tiến trình
    audio.addEventListener('timeupdate', updateProgress);
    // Sự kiện khi nhấp vào thanh container -> tua nhạc
    if (progressContainer) { // Kiểm tra xem progressContainer có tồn tại không
        progressContainer.addEventListener('click', setProgress);
    }
    // --- KẾT THÚC BỔ SUNG SỰ KIỆN ---


    // --- KHỞI ĐỘNG KHI TẢI TRANG ---
    renderPlaylist(); // Vẽ playlist lần đầu
    loadSong(songs[currentSongIndex]); // Tải bài hát đầu tiên

}); // Kết thúc DOMContentLoaded