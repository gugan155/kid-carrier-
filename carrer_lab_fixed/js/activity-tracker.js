// Logs page visits to Firebase activity collection.
// Called once per page load from pages that import it.
// Requires Firebase to be initialized (firebase.js / firebase.config.js).

const PAGE_LABELS = {
  'index.html':           'Главная',
  'learn.html':           'Обучение',
  'play.html':            'Симуляции',
  'quiz.html':            'Тест',
  'explorer.html':        'Профессии',
  'books.html':           'Книги',
  'career-path.html':     'Найди путь',
  'my-path.html':         'Мой путь',
  'dream-wall.html':      'Стена мечты',
  'problems.html':        'Проблемы',
  'roadmap.html':         'Мой маршрут',
  'stories.html':         'Истории',
  'leaderboard.html':     'Рейтинг',
  'live-quiz.html':       'Живая викторина',
};

export async function trackPageVisit() {
  try {
    const uid  = localStorage.getItem('kl_uid');
    const name = localStorage.getItem('kl_name');
    if (!uid || !name) return; // not onboarded yet

    const page = location.pathname.split('/').pop() || 'index.html';
    const label = PAGE_LABELS[page] || page;

    const { initializeApp, getApps } = await import(
      'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js'
    );
    const { getFirestore, collection, addDoc, serverTimestamp } = await import(
      'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js'
    );
    const { FIREBASE_CONFIG } = await import('../firebase.config.js');

    const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
    const db  = getFirestore(app);

    await addDoc(collection(db, 'activity'), {
      uid,
      name,
      page,
      label,
      ts: serverTimestamp(),
    });
  } catch {
    // silently ignore — tracking should never break the page
  }
}
