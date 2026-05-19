# Irasse Phase 1 — 実装開始指示文（Week 1）

**宛先**: Cursor / Codex (実装担当)
**作成日**: 2026年5月19日
**フェーズ**: Phase 1 Week 1
**仕様書**: `Irasse_Phase1_Spec_v6.md`（必読）

---

## 📌 このドキュメントについて

このドキュメントは、Irasse Phase 1 の実装を着手するための指示文です。
仕様書 v6 を読んだ上で、Week 1 の作業を実行してください。

**読む順番**:
1. このドキュメント（全体把握）
2. `Irasse_Phase1_Spec_v6.md`（詳細仕様）
3. 既存コード（`src/app/demo-doobie/`）

---

## 🎯 Phase 1 の目的

Irasse を、特定店舗に依存しない普遍的な飲食店向け SaaS として実装する。
ターゲットは「外国人客が多い、カジュアル〜中級店」。

**Phase 1 で実装する6機能**:
1. 多言語注文（既存維持、5言語）
2. Google Login で顧客識別
3. 履歴表示（客側・店側）
4. データ分析 Core（売れ筋ランキング + 月次サマリー）
5. 顧客メモ機能
6. ゲスト注文の扱い（連携拒否客の注文も記録）

**Phase 1 で絶対やらないこと**:
- ❌ 多OAuth対応（LINE/Apple/Zalo 等）
- ❌ 決済連携
- ❌ 物理QRカード
- ❌ Master ID 統合
- ❌ LINE LIFF
- ❌ 送客手数料モデル
- ❌ 特定店舗専用のカスタム機能
- ❌ 時間帯別グラフ、売上推移グラフ（Phase 1.5 で）

---

## 🛠️ プロジェクト構成

**既存スタック**:
- Next.js 16.2.1 (Turbopack)
- TypeScript
- Firebase (Firestore + Auth)
- Vercel デプロイ
- リポジトリ: https://github.com/Keigokiriu/irasse
- ローカル: `~/Desktop/irasse/app`
- 本番URL: `https://irasse.vercel.app/demo-doobie`

**既存の主要ファイル**:
```
src/
├── app/
│   ├── demo-doobie/
│   │   ├── page.tsx                    # ランディング
│   │   ├── qr/                          # QR Manager
│   │   ├── order/[table]/page.tsx      # 注文画面（5言語対応済）
│   │   └── admin/                       # 管理画面（パスコード保護）
│   ├── api/predict-exit/route.ts       # AI退席予測（既存）
│   └── ...
├── data/
│   └── doobieMenu.ts                   # メニューデータ
└── lib/
    └── firebase.ts                      # Firebase設定
```

---

## 📅 Week 1 の作業範囲

### Week 1 のゴール
- データモデル確定（Firestoreコレクション設計）
- Google OAuth 設定と認証フローの実装
- 既存 `demo-doobie` への統合

---

## 🗄️ Week 1 タスク 1: データモデル設計

### Firestore コレクション設計

仕様書 v6 の「重要な定義: Visit / Session」セクション参照。

**新規追加コレクション**:

#### `users` コレクション
```typescript
type User = {
  id: string;                          // Firestore document ID (UUID)
  google_id: string;                   // Google User ID (必須、識別子)
  name: string;                        // Google から取得
  email: string;                       // Google から取得（プライバシー要考慮）
  preferred_lang?: 'en' | 'ja' | 'ko' | 'zh' | 'vi';
  created_at: Timestamp;
  last_seen_at: Timestamp;
  // Phase 2+ で追加予定（今は実装しない）:
  // line_id?: string;
  // apple_id?: string;
  // zalo_id?: string;
}
```

**インデックス**:
- `google_id` (検索用、ユニーク扱い)

#### `sessions` コレクション
```typescript
type Session = {
  id: string;                          // Firestore document ID
  user_id: string | null;              // User.id（連携客のみ、ゲストはnull）
  shop_id: string;                     // 将来の多店舗対応用
  table_number: number;
  started_at: Timestamp;
  ended_at: Timestamp | null;          // 会計完了時に設定
  total: number;                       // 累計（会計時確定）
  status: 'active' | 'completed' | 'cancelled';
  // orders は別コレクション、session_id で紐付け
}
```

**インデックス**:
- `user_id` + `shop_id` + `status` (履歴集計用)
- `shop_id` + `started_at` (店側ダッシュボード用)
- `status` (アクティブセッション検索用)

#### `orders` コレクション拡張
既存の orders コレクションがあれば拡張、なければ新規:
```typescript
type Order = {
  id: string;                          // Firestore document ID
  session_id: string;                  // 紐付け（必須）
  shop_id: string;
  user_id: string | null;              // 連携客のみ
  table_number: number;
  items: OrderItem[];
  subtotal: number;
  status: 'pending' | 'preparing' | 'served' | 'cancelled';
  payment_method?: string;              // 会計時に設定
  created_at: Timestamp;
}

type OrderItem = {
  menu_id: string;
  name: string;                        // スナップショット
  price: number;                       // スナップショット
  quantity: number;
  note?: string;
}
```

**マイグレーション**:
- 既存の orders に `session_id` フィールドを追加する必要あり
- 既存データは後方互換のため `session_id: 'legacy'` 等で対応
- または、Phase 1 から完全に新しいフローで動かす（推奨）

#### `shops` コレクション（新規 or 拡張）
```typescript
type Shop = {
  id: string;                          // 'doobie' など
  name: string;                        // 'Doobie Doo Bar'
  country: string;                     // 'VN' 等
  default_lang: 'en' | 'ja' | 'ko' | 'zh' | 'vi';
  supported_langs: Array<'en' | 'ja' | 'ko' | 'zh' | 'vi'>;
  created_at: Timestamp;
}
```

---

### データモデル設計のタスク

**やること**:
1. 上記の型定義を `src/types/` に作成（`user.ts`, `session.ts`, `order.ts`, `shop.ts`）
2. Firestore のセキュリティルール更新（誰が読み書きできるか）
3. インデックス設定（Firestore コンソール or `firestore.indexes.json`）
4. マイグレーション戦略を決定（既存 orders をどうするか）

**確認が必要なポイント**:
- 既存の Firestore コレクション名と衝突しないか
- 既存の `demo-doobie` の注文フローを壊さないか
- セキュリティルールで適切なアクセス制御ができているか

---

## 🔐 Week 1 タスク 2: Google OAuth 設定

### Google Cloud Console 設定

**前提**: Firebase プロジェクトは既に存在する想定

**やること**:
1. Google Cloud Console で OAuth 2.0 クライアント ID を作成
   - アプリケーションの種類: ウェブアプリケーション
   - 承認済みのリダイレクト URI:
     - `https://irasse.vercel.app/__/auth/handler`
     - `http://localhost:3000/__/auth/handler` (開発用)
2. Client ID と Client Secret を取得
3. Firebase Authentication で Google プロバイダーを有効化
4. 環境変数に追加（`.env.local`）:
   ```
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
   ```

⚠️ **桐生さんの作業が必要**: Google Cloud Console の設定は人間が手動で行う必要がある。設定後、Client ID を共有してください。

### Firebase Auth 実装

**新規ファイル**: `src/lib/auth.ts`

```typescript
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { app } from './firebase';

export const auth = getAuth(app);

export async function signInWithGoogle(): Promise<FirebaseUser> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export { onAuthStateChanged };
```

### User 作成 / 取得ロジック

**新規ファイル**: `src/lib/users.ts`

```typescript
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import type { User } from '@/types/user';

export async function findOrCreateUser(firebaseUser: {
  uid: string;
  email: string | null;
  displayName: string | null;
}): Promise<User> {
  // google_id で既存 User を検索
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('google_id', '==', firebaseUser.uid));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    // 既存ユーザー: last_seen_at を更新
    const userDoc = snapshot.docs[0];
    await updateDoc(userDoc.ref, {
      last_seen_at: serverTimestamp(),
    });
    return { id: userDoc.id, ...userDoc.data() } as User;
  }

  // 新規ユーザー作成
  const newUserRef = doc(collection(db, 'users'));
  const newUser: Omit<User, 'id'> = {
    google_id: firebaseUser.uid,
    name: firebaseUser.displayName || 'Guest',
    email: firebaseUser.email || '',
    created_at: serverTimestamp() as any,
    last_seen_at: serverTimestamp() as any,
  };
  await setDoc(newUserRef, newUser);
  return { id: newUserRef.id, ...newUser } as User;
}

export async function getUserById(userId: string): Promise<User | null> {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) return null;
  return { id: userDoc.id, ...userDoc.data() } as User;
}
```

---

## 🎨 Week 1 タスク 3: 既存 demo-doobie への統合

### 注文画面に Google Login ボタンを追加

**ファイル**: `src/app/demo-doobie/order/[table]/page.tsx`

**追加する UI**:
```
画面の適切な位置（メニューの上 or 下、控えめに）:

「Save your visit?
 Next time, we'll remember your favorites and language.」

[Continue with Google]   ← 連携ボタン
[Save later]              ← 後で（スキップ）
```

**ロジック**:
1. ページロード時に Firebase Auth の状態を確認
2. 未ログイン: 「Save your visit?」を表示
3. ログイン済み: 「Welcome back, {name}」を表示 + 履歴データ取得
4. [Continue with Google] タップ:
   - `signInWithGoogle()` を呼ぶ
   - 成功したら `findOrCreateUser()` で User 作成 or 取得
   - localStorage に user_id を保存（次回も同じ端末でログイン状態を維持）

**注意点**:
- 既存の5言語切替機能を壊さないこと
- 既存の注文フローを壊さないこと
- Google Login は「任意」、スキップしても注文できること
- ログインしない客の注文は user_id = null として記録（ゲスト注文）

---

## 📋 Week 1 完了の判定基準

以下が全部できていれば Week 1 完了:

```
☐ 型定義（User, Session, Order, Shop）が src/types/ に作成された
☐ Firestore コレクションの設計が決定し、ドキュメント化された
☐ Firestore セキュリティルールが更新された
☐ Firestore インデックスが設定された
☐ Google Cloud Console で OAuth クライアント ID が作成された
☐ Firebase Authentication で Google プロバイダーが有効化された
☐ `src/lib/auth.ts` が実装された
☐ `src/lib/users.ts` が実装された
☐ 既存の注文画面に「Continue with Google」ボタンが追加された
☐ ログイン → User作成/取得 → localStorage保存 のフローが動作する
☐ ログインしてもしなくても、既存の注文フローが正常に動く
☐ npm run build が成功する（TypeScript エラーなし）
☐ ローカル（localhost:3000）で動作確認済み
☐ 本番（Vercel）へのデプロイは Week 1 では行わない（テスト後 Week 2 で）
```

---

## ⚠️ 重要な制約

### コーディング規約（既存コードとの統一）
- TypeScript strict モード遵守
- 既存の Firebase 呼び出しパターンに合わせる
- 既存の型定義スタイルに合わせる
- 既存の言語切替機能（TR辞書方式）を維持

### セキュリティ
- Google Login の Client Secret は絶対にフロントエンドに含めない
- Firestore セキュリティルールで適切に制御
- ユーザーのメールアドレスは管理画面でも基本的に表示しない（プライバシー）

### 後方互換性
- 既存の `demo-doobie` の動作を壊さない
- 既存の admin 画面を壊さない
- 既存の QR Manager を壊さない

### 桐生さんが手動でやる必要があるもの
- Google Cloud Console での OAuth クライアント ID 作成
- Firebase Authentication で Google プロバイダー有効化
- 環境変数 `.env.local` の設定
- Vercel 環境変数の設定（Week 2 のデプロイ時）

---

## 🚀 着手の流れ

### Step 1: 仕様書を読む
1. `Irasse_Phase1_Spec_v6.md` を最後まで読む
2. このドキュメントを最後まで読む
3. 既存の `src/app/demo-doobie/` の構造を把握する

### Step 2: 桐生さんに確認
1. Google Cloud Console の設定方法を相談
2. 環境変数の取り扱いを確認
3. マイグレーション戦略（既存 orders をどうするか）を確認

### Step 3: データモデル先行
1. 型定義を作成
2. Firestore のコレクション設計を文書化
3. セキュリティルールとインデックス設定

### Step 4: 認証実装
1. Firebase Auth で Google プロバイダー設定
2. `src/lib/auth.ts` 作成
3. `src/lib/users.ts` 作成
4. ローカルでテスト

### Step 5: UI 統合
1. 注文画面に Google Login ボタン追加
2. ログイン状態に応じた表示分岐
3. 既存フローへの影響確認

### Step 6: 動作確認
1. `npm run build` 成功
2. ローカルで一連のフロー確認
3. 桐生さんに動作確認してもらう

### Step 7: Week 1 完了報告
1. 完了判定基準を全部チェック
2. 桐生さんに報告
3. Week 2（顧客識別の客側UI実装）に進む

---

## 🔗 関連ドキュメント

- **必読**: `Irasse_Phase1_Spec_v6.md` (仕様書)
- 参考: `Irasse_Strategy_Review_for_GiGi.md` (戦略背景)
- 参考: 既存コード `src/app/demo-doobie/`
- 参考: ジジ（ChatGPT）のレビュー履歴（チャット内）

---

## 💬 質問・相談したい時

実装中に判断が必要なことが出てきたら、以下のいずれかで:

1. **小さな判断**: そのまま実装してOK（後で見直し可能）
2. **中程度の判断**: チャットで桐生さんに確認
3. **大きな判断**: 仕様書 v6 を見直し、必要なら桐生さん+ジジに相談

「迷ったら、よりシンプルな方を選ぶ」を原則とする。

---

## 🎯 Week 2 以降の予告

Week 1 が完了したら、次は:

### Week 2-3: 認証層完成
- セッション管理の実装
- localStorage との連携
- 端末記憶機能

### Week 4: 客側履歴表示
- 連携客への履歴表示
- お気に入り表示
- 言語自動切替

### Week 5: 店側ダッシュボード
- 顧客一覧
- 顧客詳細
- 顧客メモ

### Week 6: データ分析（Core）
- 売れ筋ランキング
- 月次サマリー

### Week 7: テスト + 実証店舗で運用開始
### Week 8 以降: 実証店舗で運用 + フィードバック収集

---

## ✨ 最後に

このフェーズは、Irasse が「単なる注文SaaS」から
「顧客の接客価値を生み出す SaaS」に進化する重要な段階です。

仕様書 v6 で固めた DNA を守りながら実装してください:

- ✅ 外部の信頼されたサービスを活用する
- ✅ Irasse は現場価値に集中する
- ✅ 識別は目的ではなく、接客価値を生む手段
- ✅ 店側UIはシンプルを最優先
- ✅ 外国人客が多いカジュアル〜中級店に寄せる
- ✅ グローバル設計

迷ったら、これらに立ち戻ってください。

実装開始 GO 🚀
