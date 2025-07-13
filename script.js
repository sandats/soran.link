document.addEventListener('DOMContentLoaded', function() {
    // --- コンテンツ全体のフェードイン ---
    const contentWrapper = document.getElementById('content-wrapper');
    if (contentWrapper) {
        // 500ミリ秒後（0.5秒後）にクラスを付与してアニメーションを開始します
        setTimeout(() => {
            contentWrapper.classList.add('is-loaded');
        }, 500);
    }

    // --- スクロールに応じたセクションごとのフェードイン ---
    const sections = document.querySelectorAll('.fade-in-section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, {
        threshold: 0.1 // 要素が10%見えたら発火
    });

    sections.forEach(section => {
        observer.observe(section);
    });

    // --- 写真拡大モーダルのための処理 ---
    const photoThumbnails = document.querySelectorAll('.photo-thumbnail');
    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modal-img');
    const modalClose = document.getElementById('modal-close');

    if (modal) {
        photoThumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', () => {
                modalImg.src = thumbnail.src; // クリックされた画像のsrcをモーダルに設定
                modal.classList.remove('hidden'); // モーダルを表示
            });
        });

        // 閉じるボタンがクリックされたらモーダルを隠す
        modalClose.addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        // 背景（オーバーレイ）がクリックされたらモーダルを隠す
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }
});
