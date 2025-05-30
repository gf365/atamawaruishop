// ★★★ ここにあなたのSupabaseプロジェクトの情報を入力してください ★★★
const SUPABASE_URL = 'https://qmnsrzmpfylycqmmtqfq.supabase.co'; // 例: https://abcdefghijklmn.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtbnNyem1wZnlseWNxbW10cWZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExNjM0OTMsImV4cCI6MjA1NjczOTQ5M30.2MBxBT6hGqEF81SdBa6X_iGdbN2hdjrL1RztQFHqBPI'; // 例: eyJhbGciOiJIUzI1Ni...

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const postUsernameInput = document.getElementById('post-username');
const postContentInput = document.getElementById('post-content');
const submitPostButton = document.getElementById('submit-post');
const postsList = document.getElementById('posts-list');

// 投稿をロードする関数
async function loadPosts() {
    postsList.innerHTML = '<p>投稿を読み込み中...</p>';
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false }); // 新しい投稿が上にくるように並べ替え

    if (error) {
        console.error('投稿の読み込み中にエラーが発生しました:', error.message);
        postsList.innerHTML = '<p style="color: red;">投稿の読み込みに失敗しました。</p>';
        return;
    }

    if (data.length === 0) {
        postsList.innerHTML = '<p>まだ投稿がありません。</p>';
        return;
    }

    postsList.innerHTML = ''; // 既存のメッセージをクリア
    data.forEach(post => {
        const postItem = document.createElement('div');
        postItem.className = 'post-item';

        const username = post.username || '匿名'; // 名前がなければ「匿名」と表示
        const date = new Date(post.created_at).toLocaleString('ja-JP');

        postItem.innerHTML = `
            <div class="post-meta">
                <strong>${username}</strong> <span class="timestamp">${date}</span>
            </div>
            <div class="post-content">${post.content}</div>
        `;
        postsList.appendChild(postItem);
    });
}

// 投稿を送信する関数
submitPostButton.addEventListener('click', async () => {
    const username = postUsernameInput.value.trim();
    const content = postContentInput.value.trim();

    if (!content) {
        alert('メッセージを入力してください！');
        return;
    }

    submitPostButton.disabled = true; // 二重投稿防止
    submitPostButton.textContent = '投稿中...';

    const { data, error } = await supabase
        .from('posts')
        .insert([
            { username: username || null, content: content } // 名前が空ならnullを送信
        ]);

    if (error) {
        console.error('投稿中にエラーが発生しました:', error.message);
        alert('投稿に失敗しました。');
    } else {
        postContentInput.value = ''; // 投稿フォームをクリア
        postUsernameInput.value = ''; // 名前フォームもクリア
        console.log('投稿成功:', data);
        loadPosts(); // 投稿後、リストを再読み込み
    }

    submitPostButton.disabled = false;
    submitPostButton.textContent = '投稿する';
});

// 初期ロード
loadPosts();

// リアルタイム更新の購読 (オプション)
// これを有効にすると、他のユーザーが投稿した際に自動で画面が更新されます。
supabase
    .channel('public:posts') // 'public'スキーマの'posts'テーブルを購読
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, payload => {
        console.log('新しい投稿を検知しました:', payload);
        loadPosts(); // 新しい投稿があったら再読み込み
    })
    .subscribe();

// Supabaseクライアントの初期化関数
function createClient(supabaseUrl, supabaseKey) {
    // グローバルにSupabaseが利用可能かチェック
    if (typeof supabase === 'undefined') {
        console.error("Supabaseライブラリが読み込まれていません。index.htmlで<script src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'></script>が正しく設定されているか確認してください。");
        return null;
    }
    return supabase.createClient(supabaseUrl, supabaseKey);
}