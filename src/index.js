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

  // limitのカウントなどで設定を書き換えたいので、コピーをとる
  const giftSettingsCopy = Object.assign({}, JSON.parse(JSON.stringify(giftSettings)));
  // const giftPathsCopy = Object.assign({}, JSON.parse(JSON.stringify(giftPaths)));
  const giftCommentToDirectoriesCopy = Object.assign({}, JSON.parse(JSON.stringify(giftCommentToDirectories)));

  // チャットに含まれていたギフトを処理
  Object.keys(giftObject).forEach(key => {
    for (let _i of [...Array(giftObject[key])]) {
      // 表示できるギフトがなくなったら終了
      if (giftCommentToDirectoriesCopy[key].length === 0) break;

      // ギフトの設定、パス取得
      // ディレクトリ取得
      const directoryIndex = getRandomInt(giftCommentToDirectoriesCopy[key].length);
      const directoryName = giftCommentToDirectoriesCopy[key][directoryIndex];

      // PNG取得
      const pathIndex = getRandomInt(giftPaths[directoryName].length);

      const path = giftPaths[directoryName][pathIndex];
      const layer = giftSettingsCopy[directoryName].layer;
      const time = giftSettingsCopy[directoryName].time;

      // サイズ情報取得
      const width = giftImageSize[path].width;
      const height = giftImageSize[path].height;

      printGift(path, width, height, layer, time);

      // 表示したギフトはカウントダウン、0になったら表示しないものとして扱う
      // -1設定は無限なので無視することになる
      giftSettingsCopy[directoryName].limit--;

      if (giftSettingsCopy[directoryName].limit !== 0) continue;

      // limit === 0 で来たらランダムから外す
      giftDirectoryToComments[directoryName].forEach(comment => {
        giftCommentToDirectoriesCopy[comment] = giftCommentToDirectoriesCopy[comment].filter(v => {
          return v !== directoryName;
        });
      });
    };
  });
};

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
