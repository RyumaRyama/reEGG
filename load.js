const glob = require('glob');
const fs = require('fs');

let keywords = [];
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
    keywords = keywords.concat(comments);
    comments.forEach(comment => {
      gifts[comment] = {
        path: file_paths,
        ...setting
      };
    });
  });

  console.log(gifts);

  // const outputJson = `
  //   const superChatList = ${JSON.stringify(superChatList)};
  //   const giftPath = JSON.parse('${JSON.stringify(giftPath)}');
  const outputJson = `
    const keyword_list = ${JSON.stringify(keywords)};
    const giftPath = JSON.parse('${JSON.stringify(gifts)}');
  `;

  fs.writeFile('./src/gift_path.js', outputJson, (err, data) => {
    if (err) console.log(err);
    else console.log('write end');
  });
});
