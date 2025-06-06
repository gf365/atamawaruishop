const SUPABASE_URL = 'https://qmnsrzmpfylycqmmtqfq.supabase.co'; // あなたのProject URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtbnNyem1wZnlseWNxbW10cWZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExNjM0OTMsImV4cCI6MjA1NjczOTQ5M30.2MBxBT6hGqEF81SdBa6X_iGdbN2hdjrL1RztQFHqBPI'; // あなたのProject Settings -> API Keys で確認

const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const authForm = document.getElementById('auth-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const messageElement = document.getElementById('message');
const signupLink = document.getElementById('signup-link');

// ユーザーセッションの監視
supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
        console.log('ユーザーがログインしています:', session.user);
        // ログイン後の処理 (例: ダッシュボードにリダイレクト)
        checkUserRoleAndRedirect(session.user.id);
    } else {
        console.log('ユーザーはログアウトしています。');
        // ログアウト後の処理
    }
});

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        messageElement.textContent = ''; // メッセージをクリア

        // ログイン処理
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            throw error;
        }

        console.log('ログイン成功:', data);
        // ログイン成功後のリダイレクトはonAuthStateChangeで処理される
    } catch (error) {
        messageElement.textContent = `ログインエラー: ${error.message}`;
        console.error('ログインエラー:', error.message);
    }
});

signupLink.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        messageElement.textContent = ''; // メッセージをクリア

        // 新規登録処理
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) {
            throw error;
        }

        console.log('新規登録成功:', data);
        // ユーザーが登録されたら、profilesテーブルにエントリを追加
        if (data.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    { id: data.user.id, username: email.split('@')[0], role: 'user' }
                ]);
            if (profileError) {
                console.error('プロフィール作成エラー:', profileError.message);
                messageElement.textContent = `プロフィール作成エラー: ${profileError.message}`;
            } else {
                messageElement.textContent = '新規登録が完了しました。ログインしてください。';
                // 必要であれば、メール確認の指示をユーザーに表示
            }
        }
    } catch (error) {
        messageElement.textContent = `新規登録エラー: ${error.message}`;
        console.error('新規登録エラー:', error.message);
    }
});

// ユーザーの役割に基づいてリダイレクトする関数
async function checkUserRoleAndRedirect(userId) {
    const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('役割の取得エラー:', error.message);
        messageElement.textContent = `役割の取得エラー: ${error.message}`;
        return;
    }

    if (data && data.role) {
        if (data.role === 'admin') {
            window.location.href = 'admin.html'; // 管理者用ページ
        } else {
            window.location.href = 'dashboard.html'; // 一般ユーザー用ページ (このファイルはまだ作成していません)
        }
    } else {
        // 役割が設定されていない場合のデフォルトリダイレクト
        window.location.href = 'dashboard.html';
    }
}

// ページロード時にセッションを確認
// これにより、既にログインしている場合は自動的にリダイレクトされる
async function getInitialSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (session) {
        console.log('既存セッション:', session.user);
        checkUserRoleAndRedirect(session.user.id);
    }
    if (error) {
        console.error('セッション取得エラー:', error.message);
    }
}
getInitialSession();