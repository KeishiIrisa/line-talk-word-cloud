/**
 * フロントとバックエンドを同じオリジンで扱うためのプロキシ。
 * POST /api/wordcloud → バックエンドの /wordcloud に転送し、JSON を返す。
 *
 * バックエンド URL:
 * - 本番: Vercel の環境変数 BACKEND_URL または NEXT_PUBLIC_API_URL で設定
 * - 開発: .env.dev の BACKEND_URL から読み込む（next dev 起動時に dotenv で読み込み）
 */
const BACKEND_URL =
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ detail: "txt ファイルをアップロードしてください。" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const proxyForm = new FormData();
    proxyForm.append("file", file);

    const res = await fetch(`${BACKEND_URL}/wordcloud`, {
      method: "POST",
      body: proxyForm,
    });

    const body = await res.json().catch(() => ({ detail: res.statusText }));

    return new Response(JSON.stringify(body), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({
        detail: e instanceof Error ? e.message : "リクエストの転送に失敗しました。",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
