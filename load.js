const glob = require('glob');
const fs = require('fs');
const sizeOf = require('image-size');

// 同じワードは重複させたくないため、setに格納する
const textKeywords = new Set();
const emojiKeywords = new Set();
const giftImageSize = {};
const giftSettings = {};
const giftPaths = {};
const giftCommentToDirectories = {};
const giftDirectoryToComments = {};

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

    filePaths.forEach(path => {
      // 画像の縦横サイズ取得
      const dimensions = sizeOf(path);
      const width = dimensions.width;
      const height = dimensions.height;
      giftImageSize[path] = {
        width: width,
        height: height,
      };
    });

    // ディレクトリにあるギフト全体に対する設定
    giftSettings[directory] = {
      limit: setting.limit ? setting.limit : -1,
      time: setting.time ? setting.time : -1,
      layer: setting.layer ? setting.layer : 0,
    };

    // ディレクトリにあるギフトのpath
    giftPaths[directory] = filePaths;

    const comments = setting.comments;
    delete setting.comments;
    comments.forEach(comment => {
      if (comment[0] == ":" && comment.slice(-1) == ":")
        emojiKeywords.add(comment);
      else
        textKeywords.add(comment);
    });
    comments.forEach(comment => {
      if (giftCommentToDirectories[comment] === undefined) {
        giftCommentToDirectories[comment] = [];
      }

      giftCommentToDirectories[comment].push(directory);
    });
    giftDirectoryToComments[directory] = comments;
  });

  const emojiHash = Array.from(emojiKeywords).reduce((map, obj) => {
    map[obj] = true;
    return map;
  }, {});

  const outputJson = `
    const textKeywords = ${JSON.stringify(Array.from(textKeywords))};
    const emojiKeywords = ${JSON.stringify(emojiHash)};
    const giftImageSize = ${JSON.stringify(giftImageSize)};
    const giftSettings = ${JSON.stringify(giftSettings)};
    const giftPaths = ${JSON.stringify(giftPaths)};
    const giftCommentToDirectories = ${JSON.stringify(giftCommentToDirectories)};
    const giftDirectoryToComments = ${JSON.stringify(giftDirectoryToComments)};
  `;

  fs.writeFile('./src/gift_path.js', outputJson, (err, data) => {
    if (err) console.log(err);
    else console.log('write end');
  });
});
