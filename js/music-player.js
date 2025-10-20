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
    const musicCoverContainer = document.querySelector('.music-cover'); // Lấy container ảnh bìa (ĐÃ THÊM)

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
        // THÊM 3 DÒNG NÀY VÀO ĐẦU HÀM (Đĩa quay):
        musicCoverContainer.style.animation = 'none'; // Tắt animation tạm thời
        musicCoverContainer.offsetHeight; // Ép trình duyệt vẽ lại để reset
        musicCoverContainer.style.animation = null; // Bật lại animation

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
        console.log("Đang cố phát:", audio.src);
        audio.play().catch(error => console.error("Lỗi khi phát nhạc:", error));
        musicCoverContainer.classList.add('rotating'); // <-- THÊM DÒNG NÀY (Đĩa quay)
    }

    // --- HÀM: Tạm dừng nhạc ---
    function pauseSong() {
        isPlaying = false;
        playPauseButton.classList.add('play');
        playPauseIcon.classList.remove('fa-pause');
        playPauseIcon.classList.add('fa-play');
        audio.pause();
        musicCoverContainer.classList.remove('rotating'); // <-- THÊM DÒNG NÀY (Đĩa quay)
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