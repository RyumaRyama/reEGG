const glob = require('glob');
const fs = require('fs');

const textKeywords = [];
const emojiKeywords = [];
const gifts = {};

glob('./gift/*/', (err, directories) => {
  if (err) {
    console.log(err);
    return;
  }
  directories.forEach(directory => {
    const setting = require(directory + 'setting.json');
    const file_paths = glob.sync(directory + '*.png');

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
        path: file_paths,
        ...setting
      };
    });
  });

  // const outputJson = `
  //   const superChatList = ${JSON.stringify(superChatList)};
  //   const giftPath = JSON.parse('${JSON.stringify(giftPath)}');
  const emojiHash = emojiKeywords.reduce((map, obj) => {
    map[obj] = true;
    return map;
  }, {});

  const outputJson = `
    const textKeywords = ${JSON.stringify(textKeywords)};
    const emojiKeywords = ${JSON.stringify(emojiHash)};
    const giftPath = JSON.parse('${JSON.stringify(gifts)}');
  `;

  fs.writeFile('./src/gift_path.js', outputJson, (err, data) => {
    if (err) console.log(err);
    else console.log('write end');
  });
});
