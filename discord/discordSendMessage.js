module.exports = (RED) => {
  const discordBotManager = require('./lib/discordBotManager.js');
  
  function discordSendMessage(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    const configNode = RED.nodes.getNode(config.token);
    discordBotManager.getBot(configNode).then((bot) => {
      node.on('input', (msg) => {
        const channel = config.channel || msg.channel;
        if (channel && typeof channel !== 'string') channel = channel.hasOwnProperty('id') ? channel.id : undefined
        if (!!channel) {
          const channelInstance = bot.channels.get(channel);
          if (channelInstance) {
            channelInstance
              .send(msg.payload)
              .then(() => {
                node.status({ fill: "green", shape: "dot", text: "message sent" });
              })
              .catch(err => {
                node.status({ fill: "red", shape: "dot", text: "send error" });
                node.error(err);
              });
          } else {
            node.error(`Couldn't send to channel '${channel}': channel not found.`);
            node.status({ fill: "red", shape: "dot", text: "error" });
          }
        }
      });
      node.on('close', () => {
        discordBotManager.closeBot(bot);
      });
    });
  }
  RED.nodes.registerType("discordSendMessage", discordSendMessage);
};