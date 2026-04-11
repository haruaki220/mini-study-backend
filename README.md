# Mini-Study-App(back-end)

## 概要
学習記録アプリのバックエンドAPIです。

## 使用技術

- Node.js
- Hono
- Supabase
- PostgreSQL

## セットアップ

#### インストール
npm install

#### 開発サーバー起動
npm run dev

## 環境変数
ルートディレクトリに`.env`ファイルを作成し、以下の環境変数を設定して下さい
```
SUPABASE_URL=https://imhaozsadvuxbztsjwzk.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaGFvenNhZHZ1eGJ6dHNqd3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNzI0NzksImV4cCI6MjA4Njc0ODQ3OX0.B1nDPOP7ZIpd0pC01XauiyntnW-G_Al5VAivt3DXhdQ
```

## 認証
全てのエンドポイントへのアクセスには認証が必要です。  
Supabase Authで取得したJWTをリクエスト時にAuthorizationヘッダーに付与してください。

例：
Authorization: Bearer <your_access_token>


## Base URL
https://mini-study-backend.onrender.com

## エンドポイント

### GET /api/study  

学習記録一覧を取得 

#### レスポンス例

```json
[
  {
    "id": "0123456789",
    "subject": "英語",
    "minutes": 30,
    "memo": "単語",
    "created_at": "2026-03-08 07:28:14.627241+00"
  },
  {
    "id": "9876543210",
    "subject": "国語",
    "minutes": 20,
    "memo": "漢字練習",
    "created_at": "2026-03-10 02:30:48.546784+00"
  }
  
]
```

#### レスポンス説明
| フィールド | 型 | 説明 |
|-------|--------|-----|
| id | string | 記録の識別ID |
| subject | string | 教科 |
| minutes | number | 学習時間（分）|
| memo | string | メモ |
| created_at | string | 作成日時（ISO形式） |

---

### POST /api/study  

学習記録を追加

---

### PUT /api/study/:id  

学習記録を編集  

---

### DELETE /api/study/:id   
学習記録を削除  

---

### GET /api/study/summary

指定した期間単位で学習時間の合計を集計したデータを取得

#### クエリパラメータ

| パラメータ | 必須 | 説明 | 値 |
|------------|------|------|----|
| span | 必須 | 集計単位を指定 | day / week / month / year |

#### リクエスト例
```
GET /api/study/summary?span=day
```

#### レスポンス例

```json
[
  {
    "date": "2026-04-01",
    "total_minutes": 120
  },
  {
    "date": "2026-04-02",
    "total_minutes": 90
  }
]
```

#### レスポンス説明
| フィールド | 型 | 説明 |
|-------|--------|-----|
| date | string | 集計対象の日付、または週・月・年の開始日（YYYY-MM-DD形式）|
| total_minutes | number | その期間の合計学習時間（分）|

---

### GET /api/study/subject_summary  

指定した期間の教科別学習時間を取得

#### クエリパラメータ

| パラメータ | 必須 | 説明 |
|------------|------|------|
| start_date | 必須 | 期間の開始日を指定（YYYY-MM-DD形式） |
| end_date | 必須 | 期間の終了日を指定（YYYY-MM-DD形式） |

#### リクエスト例
```
GET /api/study/subject_summary?start_date=2026-03-12&end_date=2026-03-19
```

#### レスポンス例

```json
[
  {
    "subject": "数学",
    "total_minutes": 90
  },
  {
    "subject": "物理",
    "total_minutes": 60
  }
]
```

#### レスポンス説明
| フィールド | 型 | 説明 |
|-------|--------|-----|
| subject | string | 集計対象の教科 |
| total_minutes | number | その教科の合計学習時間（分）|
