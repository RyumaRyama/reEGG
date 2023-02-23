const ws = new ReconnectingWebSocket(
  'ws://localhost:19960',
  null,
  {
    debug: true,
    reconnectInterval: 3000
  }
);

ws.onmessage = (chatItemResponse) => {
  const chatItemResponseBody = JSON.parse(chatItemResponse.data);
  const chatItem = chatItemResponseBody.body;
  if (!chatItem?.message) return;

  // 絵文字とテキストを分離
  const message = chatItem.message;
  const textElements = [];
  const emojiElements = [];
  message.forEach(item => {
    if (item.text)
      textElements.push(item.text);
    else
      emojiElements.push(item.alt);
  });

  // チャットに含まれるギフトのオブジェクト
  const giftObject = {};

  // ワード検索用にテキストを結合
  const joinedText = textElements.join(' ')

  // テキストキーワード検索
  textKeywords.forEach(textKeyword => {
    const reg = new RegExp(textKeyword, 'g');
    const count = (joinedText.match(reg) || []).length;
    if (count <= 0) return;
    giftObject[textKeyword] = count;
  });

  // 絵文字検索
  emojiElements.forEach(emoji => {
    if (!emojiKeywords[emoji]) return;
    if (giftObject[emoji])
      giftObject[emoji]++;
    else
      giftObject[emoji] = 1;
  });

  // ギフトがなければ終了
  if (Object.keys(giftObject).length <= 0) return;

  // チャットに含まれていたギフトを処理
  Object.keys(giftObject).forEach(key => {
    // 設定された数を上限に表示
    // 設定がなければ無限
    const gift = parseGiftSetting(giftData[key]);

    let printGiftCount = giftObject[key];
    if (giftData[key].limit !== undefined)
        printGiftCount = Math.min(giftObject[key], giftData[key].limit);

    [...Array(printGiftCount)].map(() => {
      // ギフトの設定、パス取得
      const path = gift.path[getRandomInt(gift.path.length)];
      const layer = gift.layer;
      const time = gift.time;

      // サイズ情報取得
      const width = giftImageSize[path].width;
      const height = giftImageSize[path].height;

      printGift(path, width, height, layer, time);
    });
  });
};

// 各種パラメータが空の場合に値を入れておく処理
const parseGiftSetting = gift => {
  const parsedGift = Object.assign({}, JSON.parse(JSON.stringify(gift)));

  // limitがない場合、-1としていくつでも無限に表示
  parsedGift.limit = parsedGift.limit ? parsedGift.limit : -1;

  // timeがない場合、-1として無限時間表示
  parsedGift.time = parsedGift.time ? parsedGift.time : -1;

  // layerがない場合、0として標準表示
  parsedGift.layer = parsedGift.layer ? parsedGift.layer : 0;

  return parsedGift;
}

const printGift = (path, width, height, layer, time) => {
  // ギフト要素作成
  const gift = document.createElement('img');
  gift.classList.add('gift');

  // 同一素材で複数アニメーションを再生したいため、パスの後ろに固有の文字列を追加する。
  const currentTime = new Date().getTime();
  const rand = getRandomInt(10000);
  gift.src = path + '?' + currentTime + rand;

  // 表示位置設定
  const top = (document.documentElement.clientHeight - height);
  const left = (document.documentElement.clientWidth - width);
  gift.style.top = getRandomInt(top + 1) + 'px';
  gift.style.left = getRandomInt(left + 1) + 'px';
  gift.style.zIndex = layer;

  // ギフト表示
  const gift_viewer = document.getElementById('gift-viewer');
  gift_viewer.appendChild(gift);

  // 表示時間制御
  if (time < 0) return;
  setTimeout(() => {
    gift.remove();
  }, time*1000);
};

const getRandomInt = max => {
  return Math.floor(Math.random() * max);
}
