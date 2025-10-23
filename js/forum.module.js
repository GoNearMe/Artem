const posts = [
    {
        id: 'p1',
        title: 'Розумні розклади з урахуванням інтересів учнів',
        body: 'Запропонувати систему, яка автоматично формує гуртки та факультативи згідно з інтересами та доступністю учнів, аби уникнути конфліктів у розкладі.',
        author: 'Олена Поворозник',
        role: 'Учениця 10-Б',
        tags: ['технології', 'гуртки'],
        status: 'progress',
        score: 126,
        comments: 34,
        trend: 0.86,
        createdAt: Date.now() - 1000 * 60 * 60 * 2,
        voteState: 0
    },
    {
        id: 'p2',
        title: 'Щотижневі демо-дні проєктів',
        body: 'Увести короткі демонстрації проєктів перед уроками у пʼятницю для прокачки софт-скілів та взаємного навчання.',
        author: 'Маркіян Коваль',
        role: 'Учень 9-А',
        tags: ['співпраця', 'презентації'],
        status: 'new',
        score: 98,
        comments: 12,
        trend: 0.72,
        createdAt: Date.now() - 1000 * 60 * 35,
        voteState: 0
    },
    {
        id: 'p3',
        title: 'Наставництво від випускників',
        body: 'Запросити випускників для онлайн-наставництва: короткі 20-хв сесії для підготовки до ЗНО та вступу до університетів.',
        author: 'Ганна Румʼянцева',
        role: 'Куратор',
        tags: ['менторство', 'випускники'],
        status: 'completed',
        score: 182,
        comments: 45,
        trend: 0.94,
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
        voteState: 0
    },
    {
        id: 'p4',
        title: 'Гейміфікація добрих справ',
        body: 'Щоб мотивувати допомагати школі, додати рівні та бейджі за волонтерство, модерацію форуму та участь у заходах.',
        author: 'Тарас Шрамко',
        role: 'Учень 11-В',
        tags: ['волонтерство', 'гейміфікація'],
        status: 'progress',
        score: 156,
        comments: 41,
        trend: 0.81,
        createdAt: Date.now() - 1000 * 60 * 60 * 6,
        voteState: 0
    },
    {
        id: 'p5',
        title: 'VR-екскурсії історичними місцями Львова',
        body: 'Придбати VR-гарнітури й створити інтерактивні екскурсії по історичних місцях міста для уроків історії та права.',
        author: 'Лілія Костіва',
        role: 'Вчителька історії',
        tags: ['історія', 'інновації'],
        status: 'new',
        score: 74,
        comments: 22,
        trend: 0.67,
        createdAt: Date.now() - 1000 * 60 * 60 * 1.5,
        voteState: 0
    }
];

const quickTags = ['гуртки', 'інновації', 'спорт', 'мобільність', 'збір коштів', 'менторство', 'події'];

const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');
const dialog = document.getElementById('custom-dialog');
const dialogTitle = document.getElementById('dialog-title');
const dialogMessage = document.getElementById('dialog-message');
const dialogActions = document.getElementById('dialog-actions');
const postsList = document.getElementById('posts-list');
const quickTagsContainer = document.getElementById('quick-tags');
const searchInput = document.getElementById('search');
const sortSelect = document.getElementById('sort');

const statUsers = document.getElementById('stat-users');
const statToday = document.getElementById('stat-today');
const statRating = document.getElementById('stat-rating');
const statActive = document.getElementById('stat-active');
const statIdeas = document.getElementById('stat-ideas');
const statVotes = document.getElementById('stat-votes');
const statComments = document.getElementById('stat-comments');
const progressActivity = document.getElementById('progress-activity');

const loginBtn = document.getElementById('btn-login');
const logoutBtn = document.getElementById('btn-logout');
const userProfileSection = document.getElementById('user-profile-section');
const userAvatar = document.getElementById('user-avatar');
const userNameEl = document.getElementById('user-name');
const userRoleEl = document.getElementById('user-role');

const template = document.getElementById('post-card-template');

let currentUser = null;
let activeTagFilter = null;

const formatTimeAgo = timestamp => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 1) return 'щойно';
    if (minutes < 60) return `${minutes} хв тому`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} год тому`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} дн тому`;
    const weeks = Math.floor(days / 7);
    return `${weeks} тиж тому`;
};

const createTagElement = (tag) => {
    const span = document.createElement('button');
    span.type = 'button';
    span.className = 'tag-chip';
    span.textContent = `#${tag}`;
    span.addEventListener('click', () => toggleTagFilter(tag));
    return span;
};

const toggleTagFilter = (tag) => {
    activeTagFilter = activeTagFilter === tag ? null : tag;
    renderQuickTags();
    renderPosts();
};

const filterPosts = () => {
    let filtered = [...posts];
    const query = searchInput.value.trim().toLowerCase();

    if (query) {
        filtered = filtered.filter(post =>
            post.title.toLowerCase().includes(query) ||
            post.body.toLowerCase().includes(query) ||
            post.tags.some(tag => tag.includes(query))
        );
    }

    if (activeTagFilter) {
        filtered = filtered.filter(post => post.tags.includes(activeTagFilter));
    }

    switch (sortSelect.value) {
        case 'top':
            filtered.sort((a, b) => b.score - a.score);
            break;
        case 'hot':
            filtered.sort((a, b) => b.comments - a.comments);
            break;
        case 'trending':
            filtered.sort((a, b) => b.trend - a.trend);
            break;
        default:
            filtered.sort((a, b) => b.createdAt - a.createdAt);
    }

    return filtered;
};

const renderPosts = () => {
    postsList.innerHTML = '';

    const fragment = document.createDocumentFragment();
    const filtered = filterPosts();

    filtered.forEach((post, index) => {
        const node = template.content.cloneNode(true);
        const article = node.querySelector('.post');
        article.dataset.id = post.id;
        article.style.transitionDelay = `${index * 60}ms`;

        const upBtn = node.querySelector('.arrow.up');
        const downBtn = node.querySelector('.arrow.down');
        const scoreEl = node.querySelector('.score');
        const statusEl = node.querySelector('.status');
        const timeEl = node.querySelector('.time');
        const authorEl = node.querySelector('.author');
        const titleEl = node.querySelector('.post-title');
        const bodyEl = node.querySelector('.post-text');
        const tagsEl = node.querySelector('.post-tags');
        const commentsBtn = node.querySelector('.comments');

        scoreEl.textContent = post.score;
        statusEl.textContent = post.status === 'completed' ? 'Завершено' : post.status === 'progress' ? 'У процесі' : 'Нова ідея';
        statusEl.classList.add(post.status);
        timeEl.textContent = formatTimeAgo(post.createdAt);
        authorEl.textContent = `${post.author} • ${post.role}`;
        titleEl.textContent = post.title;
        bodyEl.textContent = post.body;
        commentsBtn.textContent = `${post.comments}`;

        post.tags.forEach(tag => tagsEl.append(createTagElement(tag)));

        upBtn.addEventListener('click', () => handleVote(post.id, 1, upBtn, downBtn, scoreEl));
        downBtn.addEventListener('click', () => handleVote(post.id, -1, upBtn, downBtn, scoreEl));
        article.addEventListener('click', (event) => {
            if (event.target.closest('.post-votes') || event.target.closest('.post-actions button')) return;
            openPostDetails(post);
        });

        fragment.appendChild(node);
    });

    postsList.appendChild(fragment);
    revealPosts();
    updateStats(filtered);
};

const revealPosts = () => {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    postsList.querySelectorAll('.post').forEach(post => observer.observe(post));
};

const renderQuickTags = () => {
    quickTagsContainer.innerHTML = '';
    quickTags.forEach(tag => {
        const chip = createTagElement(tag);
        if (tag === activeTagFilter) chip.classList.add('active');
        quickTagsContainer.appendChild(chip);
    });
};

const updateStats = (filtered) => {
    const votes = filtered.reduce((acc, post) => acc + post.score, 0);
    const comments = filtered.reduce((acc, post) => acc + post.comments, 0);
    const ideas = filtered.filter(post => post.status === 'new').length;
    const inProgress = filtered.filter(post => post.status === 'progress').length;

    statVotes.textContent = votes;
    statComments.textContent = comments;
    statIdeas.textContent = ideas;
    statActive.textContent = inProgress;
    statUsers.textContent = 287 + Math.floor(Math.random() * 12);
    statToday.textContent = 4 + Math.floor(Math.random() * 4);
    const averageTrend = filtered.length ? (filtered.reduce((acc, post) => acc + post.trend, 0) / filtered.length) : 0;
    statRating.textContent = averageTrend.toFixed(2);
    const activity = filtered.length ? votes / (filtered.length * 2) * 10 : 0;
    progressActivity.style.width = `${Math.min(100, Math.max(12, activity))}%`;
};

const openModal = (title, content) => {
    modalTitle.textContent = title;
    modalBody.innerHTML = '';
    modalBody.appendChild(content);
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
};

const closeModal = () => {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
};

const openDialog = ({ title, message, actions }) => {
    dialogTitle.textContent = title;
    dialogMessage.innerHTML = message;
    dialogActions.innerHTML = '';

    actions.forEach(({ label, variant = 'ghost', handler }) => {
        const button = document.createElement('button');
        button.textContent = label;
        button.className = variant === 'primary' ? 'btn-primary' : 'btn-ghost';
        button.addEventListener('click', () => {
            handler?.();
            closeDialog();
        });
        dialogActions.appendChild(button);
    });

    dialog.classList.add('active');
    dialog.setAttribute('aria-hidden', 'false');
};

const closeDialog = () => {
    dialog.classList.remove('active');
    dialog.setAttribute('aria-hidden', 'true');
};

const handleVote = (postId, delta, upBtn, downBtn, scoreEl) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (typeof post.voteState !== 'number') {
        post.voteState = 0;
    }

    if (post.voteState === delta) {
        post.score -= delta;
        post.voteState = 0;
        upBtn.classList.remove('active');
        downBtn.classList.remove('active');
    } else {
        post.score += delta - post.voteState;
        post.voteState = delta;
        if (delta === 1) {
            upBtn.classList.add('active');
            downBtn.classList.remove('active');
        } else {
            downBtn.classList.add('active');
            upBtn.classList.remove('active');
        }
    }

    scoreEl.textContent = post.score;
    updateStats(filterPosts());
};

const openPostDetails = (post) => {
    const container = document.createElement('div');
    container.className = 'space-y-4';

    const header = document.createElement('div');
    header.className = 'flex flex-col gap-2';
    header.innerHTML = `
        <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg font-semibold">${post.author.split(' ').map(part => part[0]).join('')}</div>
            <div>
                <div class="text-lg font-semibold text-slate-800">${post.author}</div>
                <div class="text-sm text-slate-500">${post.role}</div>
            </div>
        </div>
        <div class="flex flex-wrap gap-2">${post.tags.map(tag => `<span class="tag-chip">#${tag}</span>`).join('')}</div>
    `;

    const description = document.createElement('p');
    description.className = 'text-slate-600 leading-relaxed';
    description.textContent = post.body;

    const insight = document.createElement('div');
    insight.className = 'grid grid-cols-1 sm:grid-cols-3 gap-4';
    insight.innerHTML = `
        <div class="metric-card"><span class="label">Оцінка</span><strong>${post.score}</strong></div>
        <div class="metric-card"><span class="label">Коментарів</span><strong>${post.comments}</strong></div>
        <div class="metric-card"><span class="label">Тренд</span><strong>${Math.round(post.trend * 100)}%</strong></div>
    `;

    container.append(header, description, insight);

    const actions = document.createElement('div');
    actions.className = 'flex flex-wrap justify-end gap-3 pt-2';

    const follow = document.createElement('button');
    follow.className = 'btn-primary';
    follow.innerHTML = '<i class="fa-regular fa-bell"></i> Стежити за оновленнями';

    const share = document.createElement('button');
    share.className = 'btn-ghost';
    share.innerHTML = '<i class="fa-solid fa-share-nodes"></i> Поділитися';
    share.addEventListener('click', () => navigator.clipboard?.writeText(window.location.href + `#${post.id}`));

    actions.append(follow, share);
    container.append(actions);

    openModal(post.title, container);
};

const openNewPostModal = () => {
    const container = document.createElement('div');
    container.className = 'space-y-6';

    container.innerHTML = `
        <div>
            <label class="block text-sm font-medium text-slate-500 mb-2">Тема</label>
            <input type="text" id="new-post-title" class="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-400 focus:ring focus:ring-blue-100 transition" placeholder="Наприклад, Кураторський клуб дебатів" />
        </div>
        <div>
            <label class="block text-sm font-medium text-slate-500 mb-2">Опис</label>
            <div class="editor-toolbar">
                <button class="btn-ghost" type="button"><i class="fa-solid fa-bold"></i></button>
                <button class="btn-ghost" type="button"><i class="fa-solid fa-italic"></i></button>
                <button class="btn-ghost" type="button"><i class="fa-solid fa-list-ul"></i></button>
                <button class="btn-ghost" type="button"><i class="fa-solid fa-link"></i></button>
            </div>
            <textarea id="new-post-content" rows="5" placeholder="Опишіть ідею, додайте необхідні ресурси та бажану команду"></textarea>
        </div>
        <div>
            <label class="block text-sm font-medium text-slate-500 mb-2">Теги</label>
            <input type="text" id="new-post-tags" class="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-400 focus:ring focus:ring-blue-100 transition" placeholder="через кому: інновації, події" />
        </div>
        <div class="flex justify-end gap-3">
            <button class="btn-ghost" type="button" id="cancel-post">Скасувати</button>
            <button class="btn-primary" type="button" id="submit-post">Опублікувати</button>
        </div>
    `;

    openModal('Створити новий пост', container);

    container.querySelector('#cancel-post').addEventListener('click', closeModal);
    container.querySelector('#submit-post').addEventListener('click', () => {
        const title = container.querySelector('#new-post-title').value.trim();
        const body = container.querySelector('#new-post-content').value.trim();
        const tagsValue = container.querySelector('#new-post-tags').value.trim();

        if (!title || !body) {
            openDialog({
                title: 'Заповніть поля',
                message: 'Будь ласка, додайте тему та опис ідеї.',
                actions: [{ label: 'Зрозуміло', variant: 'primary' }]
            });
            return;
        }

        const newPost = {
            id: crypto.randomUUID(),
            title,
            body,
            author: currentUser?.name ?? 'Анонім',
            role: currentUser?.role ?? 'Гість',
            tags: tagsValue ? tagsValue.split(',').map(tag => tag.trim()).filter(Boolean) : ['ідея'],
            status: 'new',
            score: 0,
            comments: 0,
            trend: 0.5,
            createdAt: Date.now(),
            voteState: 0
        };

        posts.unshift(newPost);
        renderPosts();
        closeModal();
        openDialog({
            title: 'Успішно!',
            message: 'Пост додано в загальну стрічку. Модерація відбудеться автоматично протягом 15 хвилин.',
            actions: [{ label: 'Добре', variant: 'primary' }]
        });
    });
};

const openAdminPanel = () => {
    const container = document.createElement('div');
    container.className = 'space-y-6';

    container.innerHTML = `
        <div class="grid sm:grid-cols-2 gap-4">
            <div class="metric-card">
                <span class="label">Запити на модерацію</span>
                <strong>${Math.floor(Math.random() * 6) + 2}</strong>
            </div>
            <div class="metric-card">
                <span class="label">Рівень довіри</span>
                <strong>${(Math.random() * 10 + 90).toFixed(1)}%</strong>
            </div>
        </div>
        <div class="timeline">
            <h4>Останні дії</h4>
            <ul>
                <li><span>08:45</span> Погоджено пост «Форум-чат з директорами»</li>
                <li><span>08:12</span> Користувача Марію Г. підвищено до модератора</li>
                <li><span>07:50</span> Відхилено дубльований пост у категорії «події»</li>
            </ul>
        </div>
        <div class="flex justify-end">
            <button class="btn-primary" type="button"><i class="fa-solid fa-plus"></i> Додати модератора</button>
        </div>
    `;

    openModal('Адмін-панель', container);
};

const openAnalytics = () => {
    const container = document.createElement('div');
    container.className = 'space-y-6';
    container.innerHTML = `
        <div class="grid md:grid-cols-3 gap-5">
            <div class="metric-card"><span class="label">Активність</span><strong>+28%</strong><p>За останні 7 днів</p></div>
            <div class="metric-card"><span class="label">Середній час відповіді</span><strong>1г 12хв</strong><p>Модератори</p></div>
            <div class="metric-card"><span class="label">Нові учасники</span><strong>42</strong><p>Учні та вчителі</p></div>
        </div>
        <div class="chart-preview">
            <div class="chart-grid"></div>
            <div class="chart-line"></div>
            <div class="chart-spotlight"></div>
            <div class="chart-meta">
                <span>Пікове навантаження: 19:00</span>
                <span>Середній рейтинг: 4.6</span>
            </div>
        </div>
    `;

    openModal('Аналітика спільноти', container);
};

const openRoadmap = () => {
    const container = document.createElement('div');
    container.className = 'space-y-4';
    container.innerHTML = `
        <div class="roadmap">
            <div class="roadmap-item">
                <div class="roadmap-dot"></div>
                <div>
                    <h4>Лютий 2025</h4>
                    <p>Запуск push-нотифікацій та персональних дайджестів.</p>
                </div>
            </div>
            <div class="roadmap-item">
                <div class="roadmap-dot"></div>
                <div>
                    <h4>Березень 2025</h4>
                    <p>Впровадження автоматичної модерації на базі штучного інтелекту.</p>
                </div>
            </div>
            <div class="roadmap-item">
                <div class="roadmap-dot"></div>
                <div>
                    <h4>Квітень 2025</h4>
                    <p>Мобільний застосунок з офлайн-режимом.</p>
                </div>
            </div>
        </div>
    `;

    openModal('Дорожня карта', container);
};

const openFeedback = () => {
    const container = document.createElement('div');
    container.className = 'space-y-6';
    container.innerHTML = `
        <div>
            <label class="block text-sm font-medium text-slate-500 mb-2">Як ми можемо покращитись?</label>
            <textarea rows="4" class="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-400 focus:ring focus:ring-blue-100 transition" placeholder="Залиште відгук або побажання"></textarea>
        </div>
        <div class="flex justify-end gap-3">
            <button class="btn-ghost" type="button">Скасувати</button>
            <button class="btn-primary" type="button">Надіслати</button>
        </div>
    `;

    openModal('Зворотній звʼязок', container);
};

const fakeUsers = [
    {
        name: 'Марія Чорній',
        role: 'Учениця 11-Б',
        avatar: 'https://i.pravatar.cc/100?img=47'
    },
    {
        name: 'Володимир Іващенко',
        role: 'Викладач правознавства',
        avatar: 'https://i.pravatar.cc/100?img=12'
    },
    {
        name: 'Катерина Гринюк',
        role: 'Модераторка спільноти',
        avatar: 'https://i.pravatar.cc/100?img=30'
    }
];

const signIn = () => {
    currentUser = fakeUsers[Math.floor(Math.random() * fakeUsers.length)];
    loginBtn.classList.add('hidden');
    userProfileSection.classList.remove('hidden');
    userAvatar.src = currentUser.avatar;
    userNameEl.textContent = currentUser.name;
    userRoleEl.textContent = currentUser.role;
};

const signOut = () => {
    currentUser = null;
    loginBtn.classList.remove('hidden');
    userProfileSection.classList.add('hidden');
    userAvatar.src = '';
};

window.signOut = signOut;

const initEventListeners = () => {
    loginBtn.addEventListener('click', () => {
        signIn();
        openDialog({
            title: 'Вітаємо!',
            message: 'Вхід виконано через Google акаунт. Дані синхронізовано.',
            actions: [{ label: 'Продовжити', variant: 'primary' }]
        });
    });

    logoutBtn.addEventListener('click', () => {
        signOut();
        openDialog({
            title: 'Вихід виконано',
            message: 'Очікуємо на ваші ідеї знову!',
            actions: [{ label: 'Повернутись', variant: 'primary' }]
        });
    });

    document.getElementById('btn-new-post').addEventListener('click', openNewPostModal);
    document.getElementById('btn-admin').addEventListener('click', openAdminPanel);
    document.getElementById('btn-analytics').addEventListener('click', openAnalytics);
    document.getElementById('btn-feedback').addEventListener('click', openFeedback);
    document.getElementById('btn-roadmap').addEventListener('click', openRoadmap);

    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });

    modalClose.addEventListener('click', closeModal);

    dialog.addEventListener('click', (event) => {
        if (event.target === dialog) closeDialog();
    });

    searchInput.addEventListener('input', () => {
        renderPosts();
    });

    sortSelect.addEventListener('change', () => {
        renderPosts();
    });
};

const enhanceButtons = () => {
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('mousemove', (event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            event.currentTarget.style.setProperty('--mouse-x', `${x}px`);
            event.currentTarget.style.setProperty('--mouse-y', `${y}px`);
        });
    });
};

const injectDynamicStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        button.btn-primary::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.45), transparent 55%);
            opacity: 0;
            transition: opacity 0.3s;
        }
        button.btn-primary { position: relative; overflow: hidden; }
        button.btn-primary:hover::after { opacity: 1; }
        .tag-chip {
            padding: 8px 14px;
            border-radius: 999px;
            border: 1px solid rgba(56, 103, 214, 0.2);
            background: rgba(56, 103, 214, 0.08);
            color: #1d4ed8;
            font-weight: 600;
            transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }
        .tag-chip.active, .tag-chip:hover {
            background: rgba(56, 103, 214, 0.18);
            transform: translateY(-2px);
            box-shadow: 0 12px 24px -20px rgba(56, 103, 214, 0.6);
        }
        .metric-card {
            padding: 18px;
            border-radius: 22px;
            background: rgba(248, 250, 252, 0.92);
            border: 1px solid rgba(226, 232, 240, 0.8);
            display: grid;
            gap: 6px;
        }
        .metric-card .label {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #64748b;
        }
        .metric-card strong {
            font-size: 1.5rem;
            color: #1f2937;
        }
        .metric-card p {
            font-size: 0.85rem;
            color: #94a3b8;
        }
        .timeline {
            background: rgba(248, 250, 252, 0.92);
            border-radius: 22px;
            border: 1px solid rgba(226, 232, 240, 0.9);
            padding: 20px;
        }
        .timeline h4 {
            font-size: 1rem;
            font-weight: 700;
            margin-bottom: 12px;
            color: #1e293b;
        }
        .timeline ul {
            list-style: none;
            margin: 0;
            padding: 0;
            display: grid;
            gap: 10px;
        }
        .timeline li {
            display: flex;
            gap: 12px;
            align-items: baseline;
            font-size: 0.9rem;
            color: #475569;
        }
        .timeline li span {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.8rem;
            color: #94a3b8;
        }
        .chart-preview {
            position: relative;
            height: 220px;
            border-radius: 24px;
            overflow: hidden;
            background: linear-gradient(145deg, rgba(226, 232, 240, 0.7), rgba(226, 232, 240, 0.4));
            border: 1px solid rgba(255, 255, 255, 0.8);
        }
        .chart-grid::before,
        .chart-grid::after {
            content: '';
            position: absolute;
            inset: 0;
            background-image: linear-gradient(to right, rgba(148, 163, 184, 0.12) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(148, 163, 184, 0.12) 1px, transparent 1px);
            background-size: 24px 24px;
            opacity: 0.6;
        }
        .chart-line {
            position: absolute;
            inset: 20px 12px;
            border-radius: 999px;
            background: linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(56, 103, 214, 0.8));
            mask: linear-gradient(90deg, transparent 0%, black 20%, black 80%, transparent 100%);
            animation: pulseLine 3s ease-in-out infinite;
        }
        @keyframes pulseLine {
            0%, 100% { transform: scaleY(0.85); opacity: 0.8; }
            50% { transform: scaleY(1); opacity: 1; }
        }
        .chart-spotlight {
            position: absolute;
            right: 12%;
            bottom: 18%;
            width: 120px;
            height: 120px;
            background: radial-gradient(circle, rgba(59, 130, 246, 0.35), transparent 60%);
            animation: moveSpot 8s ease-in-out infinite;
        }
        @keyframes moveSpot {
            0%, 100% { transform: translate3d(0, 0, 0); }
            50% { transform: translate3d(-16px, -18px, 0); }
        }
        .chart-meta {
            position: absolute;
            inset-inline-end: 20px;
            inset-block-start: 20px;
            display: flex;
            flex-direction: column;
            gap: 6px;
            font-size: 0.75rem;
            color: #334155;
        }
        .roadmap {
            display: grid;
            gap: 20px;
        }
        .roadmap-item {
            display: flex;
            gap: 16px;
            align-items: center;
        }
        .roadmap-dot {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: linear-gradient(135deg, #38bdf8, var(--accent));
            box-shadow: 0 0 0 6px rgba(56, 103, 214, 0.16);
            animation: dotPulse 2.4s ease-in-out infinite;
        }
        @keyframes dotPulse {
            0%, 100% { transform: scale(1); box-shadow: 0 0 0 6px rgba(56, 103, 214, 0.16); }
            50% { transform: scale(1.08); box-shadow: 0 0 0 10px rgba(56, 103, 214, 0.08); }
        }
    `;
    document.head.appendChild(style);
};

const init = () => {
    renderPosts();
    renderQuickTags();
    initEventListeners();
    enhanceButtons();
    injectDynamicStyles();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
