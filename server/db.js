var Sequelize = require('sequelize');
const path = require('path');

var sequelize = new Sequelize('database', 'username', 'password', {
  dialect: 'sqlite',
  // SQLite only
  storage: path.join(__dirname, '../db/boogiebox.sqlite')
});

var VideoData = sequelize.define('videodata', {
  videourl: Sequelize.STRING,
  origin: Sequelize.STRING,
  title: Sequelize.STRING,
  upVote: Sequelize.INTEGER,
  downVote: Sequelize.INTEGER
});

//if force: true then each time you start the server/app again the db will be refreshed (zero data). if force: true is not given then you continue with your existing data when you restart your app
// VideoData.sync({force: true});
VideoData.sync();

module.exports = {
  VideoData: VideoData
};
