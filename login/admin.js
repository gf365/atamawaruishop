const SUPABASE_URL = 'https://qmnsrzmpfylycqmmtqfq.supabase.co'; // あなたのProject URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtbnNyem1wZnlseWNxbW10cWZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExNjM0OTMsImV4cCI6MjA1NjczOTQ5M30.2MBxBT6hGqEF81SdBa6X_iGdbN2hdjrL1RztQFHqBPI'; // あなたのSupabase anon key

const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY); // ここを修正

const userListDiv = document.getElementById('user-list');
const logoutButton = document.getElementById('logout-button');

// 認証状態の確認と管理者権限のチェック
async function checkAdminStatus() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        alert('ログインしていません。');
        window.location.href = 'index.html'; // ログインページにリダイレクト
        return;
    }

    // ユーザーのロールを取得して確認
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profileError || !profile || profile.role !== 'admin') {
        alert('管理者権限がありません。');
        window.location.href = 'dashboard.html'; // 一般ユーザーページにリダイレクト (このファイルはまだ作成していません)
        return;
    }

    // 管理者であればユーザーリストを読み込む
    fetchUsers();
}

// すべてのユーザープロフィールを取得
async function fetchUsers() {
    userListDiv.innerHTML = '<p>ユーザーを読み込み中...</p>';
    const { data, error } = await supabase
        .from('profiles')
        .select('id, username, role'); // idも取得して更新時に使用

    if (error) {
        console.error('ユーザーの取得エラー:', error.message);
        userListDiv.innerHTML = `<p class="error">ユーザーの読み込みに失敗しました: ${error.message}</p>`;
        return;
    }

    if (data && data.length > 0) {
        displayUsers(data);
    } else {
        userListDiv.innerHTML = '<p>ユーザーがいません。</p>';
    }
}

// ユーザー情報を表示
function displayUsers(users) {
    userListDiv.innerHTML = '';
    users.forEach(user => {
        const userCard = document.createElement('div');
        userCard.classList.add('user-card');
        userCard.innerHTML = `
            <h3>${user.username}</h3>
            <p>ID: ${user.id}</p>
            <form class="update-role-form" data-user-id="${user.id}">
                <label for="role-${user.id}">役割:</label>
                <select id="role-${user.id}" name="role">
                    <option value="user" ${user.role === 'user' ? 'selected' : ''}>一般ユーザー</option>
                    <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>管理者</option>
                </select>
                <button type="submit">更新</button>
                <span class="status-message" id="status-${user.id}"></span>
            </form>
        `;
        userListDiv.appendChild(userCard);
    });

    // 各フォームにイベントリスナーを追加
    document.querySelectorAll('.update-role-form').forEach(form => {
        form.addEventListener('submit', handleRoleUpdate);
    });
}

// 役割更新の処理
async function handleRoleUpdate(event) {
    event.preventDefault();
    const userId = event.target.dataset.userId;
    const newRole = event.target.querySelector('select[name="role"]').value;
    const statusMessageElement = event.target.querySelector(`#status-${userId}`);

    statusMessageElement.textContent = '更新中...';
    statusMessageElement.classList.remove('error', 'success');

    const { data, error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

    if (error) {
        console.error('役割の更新エラー:', error.message);
        statusMessageElement.textContent = `更新失敗: ${error.message}`;
        statusMessageElement.classList.add('error');
    } else {
        console.log('役割更新成功:', data);
        statusMessageElement.textContent = '更新完了！';
        statusMessageElement.classList.add('success');
        // 必要に応じて、数秒後にメッセージをクリアする
        setTimeout(() => { statusMessageElement.textContent = ''; }, 3000);
    }
}

// ログアウト処理
logoutButton.addEventListener('click', async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('ログアウトエラー:', error.message);
        alert('ログアウトに失敗しました。');
    } else {
        window.location.href = 'index.html'; // ログインページにリダイレクト
    }
});

// ページ読み込み時に実行
checkAdminStatus();