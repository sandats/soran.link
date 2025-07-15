document.addEventListener('DOMContentLoaded', function() {
    // --- コンテンツ全体のフェードイン ---
    const contentWrapper = document.getElementById('content-wrapper');
    if (contentWrapper) {
        contentWrapper.classList.add('is-loaded');
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
        threshold: 0.1
    });
    sections.forEach(section => observer.observe(section));

    // --- 月別の写真ギャラリー生成（photo.htmlのみで実行） ---
    const photoGalleryContainer = document.getElementById('photo-gallery-container');
    const photoDataSource = document.getElementById('photo-data-source');

    if (photoGalleryContainer && photoDataSource) {
        const photos = Array.from(photoDataSource.querySelectorAll('img'));
        const groupedPhotos = photos.reduce((groups, photo) => {
            const date = photo.dataset.date;
            if (date && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const yearMonth = date.substring(0, 7); // "2025-07"
                if (!groups[yearMonth]) {
                    groups[yearMonth] = [];
                }
                groups[yearMonth].push(photo);
            }
            return groups;
        }, {});

        const sortedMonths = Object.keys(groupedPhotos).sort().reverse();

        sortedMonths.forEach(month => {
            const [year, monthNum] = month.split('-');
            const monthHeader = document.createElement('h2');
            monthHeader.textContent = `${year}年${parseInt(monthNum, 10)}月`;
            monthHeader.className = 'text-2xl font-bold text-slate-800 mt-12 mb-6 pl-2 border-l-4 border-blue-500';
            photoGalleryContainer.appendChild(monthHeader);

            const gridContainer = document.createElement('div');
            gridContainer.className = 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4';
            photoGalleryContainer.appendChild(gridContainer);

            groupedPhotos[month].forEach(photo => {
                gridContainer.appendChild(photo);
            });
        });
    }

    // --- すべてのページでモーダルと遅延読み込みを初期化 ---
    initializeModal();
    initializeLazyLoading();


    // --- 写真拡大モーダルのための処理を関数化 ---
    function initializeModal() {
        const photoThumbnails = document.querySelectorAll('.photo-thumbnail');
        const modal = document.getElementById('modal');
        const modalImg = document.getElementById('modal-img');
        const modalClose = document.getElementById('modal-close');

        // キャプション関連の要素は、存在する場合のみ取得
        const modalCaption = document.getElementById('modal-caption');
        const modalTitle = document.getElementById('modal-title');
        const modalDate = document.getElementById('modal-date');
        const modalWorld = document.getElementById('modal-world');

        if (modal && photoThumbnails.length > 0) {
            photoThumbnails.forEach(thumbnail => {
                thumbnail.addEventListener('click', () => {
                    const highResSrc = thumbnail.dataset.src || thumbnail.src;
                    modalImg.src = highResSrc;
                    modalImg.alt = thumbnail.alt || '';

                    // キャプション要素が存在する場合のみ、テキストを設定
                    if (modalCaption && modalTitle && modalDate && modalWorld) {
                        const title = thumbnail.alt || '';
                        const date = thumbnail.dataset.date || '';
                        const worldName = thumbnail.dataset.worldName || '';
                        const worldLink = thumbnail.dataset.worldLink || '';

                        modalTitle.textContent = title;
                        modalDate.textContent = date;

                        modalWorld.innerHTML = '';
                        if (worldName) {
                            if (worldLink && worldLink !== '#') {
                                const link = document.createElement('a');
                                link.href = worldLink;
                                link.target = '_blank';
                                link.rel = 'noopener noreferrer';
                                link.className = 'text-blue-400 hover:underline';
                                link.textContent = `World: ${worldName}`;
                                modalWorld.appendChild(link);
                            } else {
                                modalWorld.textContent = `World: ${worldName}`;
                            }
                        }

                        setTimeout(() => {
                            modalCaption.classList.remove('opacity-0');
                        }, 100);
                    }

                    modal.classList.remove('hidden');
                });
            });

            const closeModal = () => {
                modal.classList.add('hidden');
                if(modalCaption) {
                    modalCaption.classList.add('opacity-0');
                }
            };

            if(modalClose) modalClose.addEventListener('click', closeModal);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
        }
    }

    // --- 画像の遅延読み込み処理を関数化 ---
    function initializeLazyLoading() {
        const lazyImages = document.querySelectorAll('img.lazy');
        if ('IntersectionObserver' in window && lazyImages.length > 0) {
            let lazyImageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        let lazyImage = entry.target;

                        // 画像が読み込み終わったら is-loaded クラスを追加
                        lazyImage.onload = () => {
                            lazyImage.classList.add('is-loaded');
                        };

                        // srcに実際のパスを設定して読み込みを開始
                        lazyImage.src = lazyImage.dataset.src;
                        lazyImage.classList.remove('lazy');
                        observer.unobserve(lazyImage);
                    }
                });
            });
            lazyImages.forEach((lazyImage) => lazyImageObserver.observe(lazyImage));
        } else if (lazyImages.length > 0) {
            // IntersectionObserver非対応ブラウザ向けのフォールバック
            lazyImages.forEach((lazyImage) => {
                lazyImage.src = lazyImage.dataset.src;
                lazyImage.classList.remove('lazy');
            });
        }
    }

    // --- ページ遷移のアニメーション処理 ---
    const pageTransitionLinks = document.querySelectorAll('.page-transition-link');
    pageTransitionLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const destination = this.href;
            if (contentWrapper) {
                contentWrapper.classList.remove('is-loaded');
            }
            setTimeout(() => window.location.href = destination, 800);
        });
    });
});

// ▼▼▼ bfcache対策：ブラウザの「戻る」で表示が復元された際の処理を追加 ▼▼▼
window.addEventListener('pageshow', function(event) {
    const contentWrapper = document.getElementById('content-wrapper');
    // event.persistedがtrueの場合、ページはbfcacheから復元されたことを示す
    if (event.persisted && contentWrapper) {
        // フェードアウトしたままになっているコンテンツを再度表示させる
        contentWrapper.classList.add('is-loaded');
    }
});
