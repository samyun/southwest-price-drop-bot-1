const {DISCORD_WEBHOOK} = require('../constants.js');

const enabled = Boolean(DISCORD_WEBHOOK);
const fetch = require('node-fetch');

async function sendDiscordWebhoook(message) {
  if (!enabled) return false;
  try {
    var params = {
      username: "Southwest Tracker",
      avatar_url: "",
      content: message,
      embeds: []
    };
    const response = fetch(DISCORD_WEBHOOK, {
      method: "POST",
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(params)
    }).then(res => {
      console.log(res);
    });
    console.log(response);
    return response;
  } catch (error) {
    console.error(error);
    return false;
  }
}

module.exports = {
  enabled,
  sendDiscordWebhoook
};
