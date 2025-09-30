const axios = require('axios');
const fs = require('fs').promises;

async function makeApiRequest() {
  try {
    // 認証情報（ドキュメントに基づく例）
    const clientId = '319e1527d0be4457a1067829fc0ad86e'; // ドキュメントの例を使用
    const clientSecret = ''; // ドキュメントの例を使用
    const authCode = 'REPLACE_THIS'; // OAuthフローで取得した実際のコードに置き換えてください
    const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    // 1. アクセストークンを取得
    const tokenResponse = await axios.post(
      'https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token',
      `grant_type=authorization_code`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${authString}`,
        },
      }
    );

    // 2. レスポンスからaccountIdを抽出
    const accessToken = tokenResponse.data.access_token;
    const accountId = tokenResponse.data.account_id; // レスポンスにaccount_idが含まれていると仮定
    if (!accountId) {
      throw new Error('accountIdが見つかりませんでした');
    }
    console.log(`抽出されたaccountId: ${accountId}`);

    // 3. 指定されたエンドポイントにGETリクエストを送信
    const apiUrl = `https://events-public-service-live.ol.epicgames.com/api/v1/events/Fortnite/download/${accountId}`;
    const apiResponse = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // 4. レスポンスをJSONファイルに保存
    const outputFile = 'response.json';
    await fs.writeFile(outputFile, JSON.stringify(apiResponse.data, null, 2));
    console.log(`レスポンスが ${outputFile} に保存されました`);

  } catch (error) {
    console.error('エラーが発生しました:', error.response ? error.response.data : error.message);
  }
}

makeApiRequest();