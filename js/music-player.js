document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Lấy các thành phần HTML ---
    const audio = document.getElementById('audio-source');
    const coverArt = document.getElementById('cover-art');
    const songTitle = document.getElementById('song-title');
    const songArtist = document.getElementById('song-artist');
    const playPauseButton = document.getElementById('play-pause-button');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const playPauseIcon = playPauseButton.querySelector('i'); // Lấy icon bên trong nút
    const playlistItemsContainer = document.getElementById('playlist-items'); // Lấy container playlist

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
            title: 'Lộc Hải Vi Đường', // Tên bài thứ 3 (Sửa nếu cần)
            artist: 'Đồng Nhân', // Tên ca sĩ thứ 3 (Sửa nếu cần)
            src: 'music/loc_hai_2.mp3', // File nhạc thứ 3
            cover: 'images/cover-placeholder.png' // Ảnh bìa thứ 3 (Sửa nếu có ảnh riêng)
        },
        {
            title: 'Phép Màu',
            artist: 'MAYDAY ft Minh Tốc',
            src: 'music/phep_mau.mp3',
            cover: 'images/cover-placeholder-3.png'
        }
    ];

    let currentSongIndex = 0; // Bắt đầu với bài hát đầu tiên
    let isPlaying = false; // Trạng thái đang phát hay không

    // --- HÀM: Vẽ danh sách nhạc ra HTML ---
    function renderPlaylist() {
        playlistItemsContainer.innerHTML = ''; // Xóa list cũ
        songs.forEach((song, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = `${index + 1}. ${song.title} - ${song.artist}`;
            listItem.dataset.index = index; // Lưu vị trí bài hát

            // Thêm sự kiện click cho từng bài
            listItem.addEventListener('click', () => {
                currentSongIndex = index;
                loadSong(songs[currentSongIndex]);
                playSong(); // Phát nhạc luôn khi click
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

    // --- HÀM: Tải một Bài hát (ĐÃ GỘP) ---
    function loadSong(song) {
        songTitle.textContent = song.title;
        songArtist.textContent = song.artist;
        audio.src = song.src;
        coverArt.src = song.cover;
        updatePlaylistHighlight(); // Cập nhật highlight
    }

    // --- HÀM: Phát nhạc ---
    function playSong() {
        isPlaying = true;
        playPauseButton.classList.remove('play');
        playPauseIcon.classList.remove('fa-play');
        playPauseIcon.classList.add('fa-pause');
        console.log("Đang cố phát:", audio.src); // Giữ lại dòng debug nếu cần
        audio.play().catch(error => console.error("Lỗi khi phát nhạc:", error)); // Thêm .catch để bắt lỗi rõ hơn
    }

    // --- HÀM: Tạm dừng nhạc ---
    function pauseSong() {
        isPlaying = false;
        playPauseButton.classList.add('play');
        playPauseIcon.classList.remove('fa-pause');
        playPauseIcon.classList.add('fa-play');
        audio.pause();
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

    // --- GÁN SỰ KIỆN CHO CÁC NÚT ---
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

    // --- KHỞI ĐỘNG KHI TẢI TRANG ---
    renderPlaylist(); // Vẽ playlist lần đầu
    loadSong(songs[currentSongIndex]); // Tải bài hát đầu tiên

}); // Kết thúc DOMContentLoaded