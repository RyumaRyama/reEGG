const glob = require('glob');
const fs = require('fs');
const Canvas = require("canvas");
const Image = Canvas.Image;

const textKeywords = [];
const emojiKeywords = [];
const giftImageSize = {};
const gifts = {};

glob('./gift/*/', (err, directories) => {
  if (err) {
    console.log(err);
    return;
  }
  directories.forEach(directory => {
    const setting = require(directory + 'setting.json');
    const filePaths = glob.sync(directory + '*.png');

    // 画像の縦横サイズ取得
    filePaths.forEach(path => {
      const element = new Image();

      element.onload = () => {
        var width = element.naturalWidth;
        var height = element.naturalHeight;

        giftImageSize[path] = {
          width: width,
          height: height,
        }
      }
      element.src = path;
    });

    const comments = setting.comments;
    delete setting.comments;
    comments.forEach(comment => {
      if (comment[0] == ":" && comment.slice(-1) == ":")
        emojiKeywords.push(comment);
      else
        textKeywords.push(comment);
    });
    comments.forEach(comment => {
      gifts[comment] = {
        path: filePaths,
        ...setting
      };
    });
  });

  const emojiHash = emojiKeywords.reduce((map, obj) => {
    map[obj] = true;
    return map;
  }, {});

  const outputJson = `
    const textKeywords = ${JSON.stringify(textKeywords)};
    const emojiKeywords = ${JSON.stringify(emojiHash)};
    const giftImageSize = ${JSON.stringify(giftImageSize)};
    const giftData = JSON.parse('${JSON.stringify(gifts)}');
  `;

  fs.writeFile('./src/gift_path.js', outputJson, (err, data) => {
    if (err) console.log(err);
    else console.log('write end');
  });
});
