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

    // --- 2. Định nghĩa Danh sách Bài hát ---
    // !! QUAN TRỌNG: Thay thế bằng các file thật của bạn !!
    const songs = [
        {
            title: 'Kho Báu (with Rhymastic)',
            artist: 'Trọng Hiếu',
            src: 'Kho Báu (with Rhymastic)', // Đường dẫn đến file MP3 của bạn
            cover: 'cover-placeholder-2' // Đường dẫn đến ảnh bìa của bạn
        },
        {
            title: 'Kỵ Sĩ Và Ánh Sao',
            artist: 'Đông Nhi',
            src: 'C:\Users\phann\OneDrive\Desktop\GCN_Website\music\Kỵ Sĩ Và Ánh Sao',
            cover: 'C:\Users\phann\OneDrive\Desktop\GCN_Website\images\cover-placeholder-4'
        },
        // Thêm các bài hát khác ở đây theo cấu trúc tương tự
        {
            title: 'Phép Màu',
            artist: 'MAYDAY ft Minh Tốc',
            src: 'C:\Users\phann\OneDrive\Desktop\GCN_Website\music\Phép Màu',
            cover: 'C:\Users\phann\OneDrive\Desktop\GCN_Website\images\cover-placeholder-3' // Dùng ảnh placeholder nếu không có bìa riêng
        }
    ];

    let currentSongIndex = 0; // Bắt đầu với bài hát đầu tiên
    let isPlaying = false; // Trạng thái đang phát hay không

    // --- 3. Hàm để Tải một Bài hát ---
    function loadSong(song) {
        songTitle.textContent = song.title;
        songArtist.textContent = song.artist;
        audio.src = song.src; // Đặt nguồn nhạc cho thẻ <audio>
        coverArt.src = song.cover; // Đặt nguồn ảnh cho thẻ <img>
    }

    // --- 4. Hàm Phát/Tạm dừng ---
    function playSong() {
        isPlaying = true;
        playPauseButton.classList.remove('play'); // Có thể dùng để đổi style nút sau này
        playPauseIcon.classList.remove('fa-play'); // Đổi icon thành Pause
        playPauseIcon.classList.add('fa-pause');
        audio.play(); // Lệnh phát nhạc
    }

    function pauseSong() {
        isPlaying = false;
        playPauseButton.classList.add('play');
        playPauseIcon.classList.remove('fa-pause'); // Đổi icon thành Play
        playPauseIcon.classList.add('fa-play');
        audio.pause(); // Lệnh tạm dừng
    }

    // --- 5. Hàm Chuyển bài (Next/Previous) ---
    function prevSong() {
        currentSongIndex--;
        if (currentSongIndex < 0) {
            currentSongIndex = songs.length - 1; // Quay lại bài cuối nếu hết
        }
        loadSong(songs[currentSongIndex]); // Tải bài mới
        if (isPlaying) playSong(); // Nếu đang phát thì tiếp tục phát bài mới
    }

    function nextSong() {
        currentSongIndex++;
        if (currentSongIndex >= songs.length) {
            currentSongIndex = 0; // Quay lại bài đầu nếu hết
        }
        loadSong(songs[currentSongIndex]);
        if (isPlaying) playSong();
    }

    // --- 6. Gán Sự kiện cho các Nút ---
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

    // --- 7. Tải Bài hát Đầu tiên khi Mở trang ---
    loadSong(songs[currentSongIndex]);

});