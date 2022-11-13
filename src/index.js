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

  console.log(giftObject);

  // ギフトがなければ終了
  if (Object.keys(giftObject).length <= 0) return;

  const hyo_comment_viewer = document.getElementById('gift-viewer');

  const hyo_comme = document.createElement('div');
  const hyo_comme_p = document.createElement('p');
  hyo_comme_p.append(...messageElement);
  hyo_comme.appendChild(hyo_comme_p);
  hyo_comment_viewer.appendChild(hyo_comme);
  hyo_comme.classList.add('comment');
  hyo_comme.style.left = '0px';

  const position = Math.floor(Math.random() * (window.innerWidth - hyo_comme.offsetWidth));
  hyo_comme.style.left = position + 'px';
};
