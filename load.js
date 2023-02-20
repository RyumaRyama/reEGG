const glob = require('glob');
const fs = require('fs');
const sizeOf = require('image-size');

// 同じワードは重複させたくないため、setに格納する
const textKeywords = new Set();
const emojiKeywords = new Set();
const giftImageSize = {};
const gifts = {};

glob('./gift/*/', (err, directories) => {
  if (err) {
    console.log(err);
    return;
  }

  directories.forEach(directory => {
    // setting.jsonのないディレクトリは無視
    if (!fs.existsSync(directory + 'setting.json')) return;

    const setting = require(directory + 'setting.json');
    const filePaths = glob.sync(directory + '*.png');

    // 画像の縦横サイズ取得
    filePaths.forEach(path => {
      const dimensions = sizeOf(path);
      const width = dimensions.width;
      const height = dimensions.height;
      giftImageSize[path] = {
        width: width,
        height: height,
      }
    });

    const comments = setting.comments;
    delete setting.comments;
    comments.forEach(comment => {
      if (comment[0] == ":" && comment.slice(-1) == ":")
        emojiKeywords.add(comment);
      else
        textKeywords.add(comment);
    });
    comments.forEach(comment => {
      // 既に登録のあるワードの場合、ファイルパスの追加のみ行う
      if (gifts[comment] === undefined) {
        gifts[comment] = {
          path: [...filePaths],
          ...setting
        };
      }
      else {
        gifts[comment].path.push(...filePaths);
      }
    });
  });

  const emojiHash = Array.from(emojiKeywords).reduce((map, obj) => {
    map[obj] = true;
    return map;
  }, {});

  const outputJson = `
    const textKeywords = ${JSON.stringify(Array.from(textKeywords))};
    const emojiKeywords = ${JSON.stringify(emojiHash)};
    const giftImageSize = ${JSON.stringify(giftImageSize)};
    const giftData = JSON.parse('${JSON.stringify(gifts)}');
  `;

  fs.writeFile('./src/gift_path.js', outputJson, (err, data) => {
    if (err) console.log(err);
    else console.log('write end');
  });
});
