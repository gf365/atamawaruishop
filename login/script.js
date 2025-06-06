// SupabaseプロジェクトのURLとAnonキーをここに設定
// これらはあなたのSupabaseプロジェクトのSettings -> API Keysで確認できます
const SUPABASE_URL = 'https://qmnsrzmpfylycqmmtqfq.supabase.co'; // あなたのProject URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtbnNyem1wZnlseWNxbW10cWZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExNjM0OTMsImV4cCI6MjA1NjczOTQ5M30.2MBxBT6hGqEF81SdBa6X_iGdbN2hdjrL1RztQFHqBPI'; // あなたのSupabase anon key

// Superbaseクライアントの初期化
// @supabase/supabase-js SDKを使用する場合、createClientメソッドはSupabaseオブジェクトから呼び出されます
const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY); // ここを修正

// DOM要素の取得
const authForm = document.getElementById('auth-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const messageElement = document.getElementById('message');
const signupLink = document.getElementById('signup-link');

/**
 * メッセージ表示エリアをクリアするヘルパー関数
 */
function clearMessage() {
    if (messageElement) {
        messageElement.textContent = '';
    }
}

/**
 * 指定されたユーザーIDの役割を取得し、それに基づいてリダイレクトします。
 * @param {string} userId - リダイレクトするユーザーのUUID
 */
async function checkUserRoleAndRedirect(userId) {
    clearMessage(); // メッセージをクリア

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single(); // 単一の結果を期待

        if (error) {
            console.error('役割の取得エラー:', error.message);
            messageElement.textContent = `役割の取得エラー: ${error.message}`;
            return;
        }

        if (data && data.role) {
            if (data.role === 'admin') {
                window.location.href = 'admin.html'; // 管理者用ページへリダイレクト
            } else {
                window.location.href = 'dashboard.html'; // 一般ユーザー用ページへリダイレクト
            }
        } else {
            // 役割が設定されていない場合のデフォルトリダイレクト
            console.warn('ユーザーの役割が見つかりませんでした。デフォルトページにリダイレクトします。');
            window.location.href = 'dashboard.html';
        }
    } catch (err) {
        console.error('リダイレクト処理中の予期せぬエラー:', err.message);
        messageElement.textContent = `リダイレクトエラー: ${err.message}`;
    }
}

// ユーザーセッションの監視
// 認証状態の変化（ログイン/ログアウト）と、ページロード時の初期セッションチェックを処理します
supabase.auth.onAuthStateChange(async (event, session) => {
    // ログイン状態であれば、役割に基づいてリダイレクト
    if (session) {
        console.log('ユーザーがログインしています:', session.user);
        await checkUserRoleAndRedirect(session.user.id);
    } else {
        console.log('ユーザーはログアウトしています。');
        // ログアウト後の処理 (例: ログインページに留まる、ホームページへリダイレクトなど)
        // 必要に応じて、ログインページにいることを確認するロジックを追加
        if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
             // 現在のページがログインページでなければリダイレクト
             // window.location.href = '/index.html'; // 例: ログインページにリダイレクト
        }
    }
});

// ログインフォームの送信イベントリスナー
if (authForm) {
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // デフォルトのフォーム送信を防止
        clearMessage();     // メッセージをクリア

        const email = emailInput.value;
        const password = passwordInput.value;

        // 入力値の基本的なバリデーション
        if (!email || !password) {
            messageElement.textContent = 'メールアドレスとパスワードを入力してください。';
            return;
        }

        try {
            // ログイン処理を実行
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                // エラータイプに応じてメッセージを調整
                if (error.message.includes('Invalid login credentials')) {
                    messageElement.textContent = '無効なメールアドレスまたはパスワードです。';
                } else {
                    messageElement.textContent = `ログインエラー: ${error.message}`;
                }
                console.error('ログインエラー:', error.message);
                return; // エラーがあればここで処理を終了
            }

            console.log('ログイン成功:', data);
            // ログイン成功後のリダイレクトはonAuthStateChangeで処理されるため、ここでは特別な処理は不要
            messageElement.textContent = 'ログインしました。'; // 成功メッセージを一時的に表示
        } catch (error) {
            // 予期せぬエラー
            messageElement.textContent = `予期せぬログインエラー: ${error.message}`;
            console.error('予期せぬログインエラー:', error.message);
        }
    });
}

// 新規登録リンクのクリックイベントリスナー
if (signupLink) {
    signupLink.addEventListener('click', async (e) => {
        e.preventDefault(); // デフォルトのリンク動作を防止
        clearMessage();     // メッセージをクリア

        const email = emailInput.value;
        const password = passwordInput.value;

        // 入力値の基本的なバリデーション
        if (!email || !password) {
            messageElement.textContent = 'メールアドレスとパスワードを入力してください。';
            return;
        }

        try {
            // 新規登録処理を実行
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
            });

            if (error) {
                messageElement.textContent = `新規登録エラー: ${error.message}`;
                console.error('新規登録エラー:', error.message);
                return; // エラーがあればここで処理を終了
            }

            console.log('新規登録成功:', data);

            // ユーザーが正常に登録されたら、profilesテーブルにエントリを追加
            if (data.user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([
                        // usernameはメールの@より前の部分をデフォルトとして使用
                        { id: data.user.id, username: email.split('@')[0], role: 'user' }
                    ]);

                if (profileError) {
                    console.error('プロフィール作成エラー:', profileError.message);
                    messageElement.textContent = `プロフィール作成エラー: ${profileError.message} (ただし、ユーザー登録は成功しています)`;
                } else {
                    messageElement.textContent = '新規登録が完了しました。メールを確認し、ログインしてください。';
                }
            } else {
                // メール確認が必要な場合など、data.userがすぐに利用できないケース
                messageElement.textContent = '登録は完了しましたが、メールアドレスの確認が必要な場合があります。受信トレイをご確認ください。';
            }
        } catch (error) {
            // 予期せぬエラー
            messageElement.textContent = `予期せぬ新規登録エラー: ${error.message}`;
            console.error('予期せぬ新規登録エラー:', error.message);
        }
    });
}

// ページロード時に現在のセッションをチェックし、存在すればリダイレクト
// onAuthStateChangeが初回ロード時にも発火するため、この関数は基本的には不要ですが、
// 明示的なセッションチェックの例として残しておきます。
// ただし、onAuthStateChangeのロジックと重複しないように注意が必要です。
// 通常は onAuthStateChange だけで十分です。
/*
async function getInitialSessionAndRedirect() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session) {
            console.log('既存セッションを検出:', session.user);
            await checkUserRoleAndRedirect(session.user.id);
        } else if (error) {
            console.error('セッション取得エラー:', error.message);
        }
    } catch (err) {
        console.error('初期セッションチェック中の予期せぬエラー:', err.message);
    }
}
getInitialSessionAndRedirect();
*/