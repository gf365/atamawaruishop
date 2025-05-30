// ====================================================================
// ★★★ ここからが修正点: グローバル定数と関数定義の順序を整理しました ★★★
// ====================================================================

// Supabaseプロジェクトの情報をここに反映済み
const SUPABASE_URL = 'https://qmnsrzmpfylycqmmtqfq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtbnNyem1wZnlseWNxbW10cWZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExNjM0OTMsImV4cCI6MjA1NjczOTQ5M30.2MBxBT6hGqEF81SdBa6X_iGdbN2hdjrL1RztQFHqBPI';

// Supabaseクライアントの初期化関数は、その呼び出しより前に定義される必要がある
function createClient(supabaseUrl, supabaseKey) {
    // グローバルにSupabaseが利用可能かチェック
    if (typeof window.supabase === 'undefined' || !window.supabase.createClient) {
        console.error("Supabaseライブラリが読み込まれていません。index.htmlで<script src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'></script>が正しく設定されているか確認してください。");
        return null;
    }
    return window.supabase.createClient(supabaseUrl, supabaseKey);
}

// createClient関数が定義された後で、その関数を呼び出し、supabaseクライアントを初期化する
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// supabaseクライアントが正しく初期化されていない場合は処理を中断
if (!supabase) {
    console.error("Supabaseクライアントの初期化に失敗しました。処理を中断します。");
    const postsList = document.getElementById('posts-list');
    if (postsList) {
        postsList.innerHTML = '<p style="color: red;">掲示板機能が利用できません。Supabaseの設定を確認してください。</p>';
    }
    const submitPostButton = document.getElementById('submit-post');
    if (submitPostButton) {
        submitPostButton.disabled = true;
    }
    throw new Error("Supabase initialization failed."); // これで以降のスクリプト実行を停止
}

// ====================================================================
// ★★★ 修正点終わり ★★★
// ====================================================================


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

        // ★★★ 修正点: 削除ボタンを追加し、data-id属性に投稿のIDを持たせる ★★★
        postItem.innerHTML = `
            <div class="post-meta">
                <strong>${username}</strong> <span class="timestamp">${date}</span>
                <button class="delete-post-btn" data-id="${post.id}">削除</button>
            </div>
            <div class="post-content">${post.content}</div>
        `;
        postsList.appendChild(postItem);
    });

    // ★★★ 追加点: 削除ボタンにイベントリスナーを設定する ★★★
    document.querySelectorAll('.delete-post-btn').forEach(button => {
        button.addEventListener('click', handleDeletePost);
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
        alert('投稿に失敗しました。エラー: ' + error.message); // エラーメッセージを表示
    } else {
        postContentInput.value = ''; // 投稿フォームをクリア
        postUsernameInput.value = ''; // 名前フォームもクリア
        console.log('投稿成功:', data);
        loadPosts(); // 投稿後、リストを再読み込み
    }

    submitPostButton.disabled = false;
    submitPostButton.textContent = '投稿する';
});

// ★★★ 追加点: 投稿を削除する関数 ★★★
async function handleDeletePost(event) {
    const postId = event.target.dataset.id; // ボタンのdata-id属性から投稿IDを取得

    if (!confirm('本当にこの投稿を削除しますか？')) {
        return; // キャンセルされたら何もしない
    }

    event.target.disabled = true; // ボタンを無効化して二重クリック防止
    event.target.textContent = '削除中...';

    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId); // 指定されたIDの投稿を削除

    if (error) {
        console.error('投稿の削除中にエラーが発生しました:', error.message);
        alert('投稿の削除に失敗しました。エラー: ' + error.message);
    } else {
        console.log('投稿を削除しました:', postId);
        loadPosts(); // 削除後、投稿リストを再読み込み
    }
    event.target.disabled = false;
    event.target.textContent = '削除';
}


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