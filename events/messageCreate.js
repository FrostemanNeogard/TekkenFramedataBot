const Discord = require("discord.js");

module.exports = {
  name: "messageCreate",
  run: async function RunAll(bot, msg) {
    // Deconstruct client, prefix, and owner from bot
    const { client, prefix, owner } = bot;
    const clientId = client.application.id;
    let isTag = false;
    const tagString = `<@${clientId}>`;

    // Guard clause to make sure:
    //              message is sent in a guild (server)
    //              message is not a bot message
    //              message starts with the set command prefix
    if (!msg.guild || msg.author.bot) return;
    if (msg.content.startsWith(tagString)) {
      isTag = true;
    } else if (!msg.content.startsWith(prefix)) {
      return;
    }

    // Format message as a command, then make sure the command exists
    let args = msg.content
      .slice(isTag ? tagString.length : prefix.length)
      .trim()
      .split(/ +/g);

    if (isTag) {
      args = ["fd8", ...args];
    }

    const cmdstr = args.shift().toLowerCase();
    let command = client.commands.get(cmdstr);
    if (!command) return;

    // Assign the message author
    let author = msg.member;

    // Guard clause to check for proper permissions
    if (
      (command.devCommand && !owner.includes(author.id)) ||
      (command.permissions &&
        author.permissions.missing(command.permissions).length !== 0)
    ) {
      return msg.reply("You lack the permissions to use this command.");
    }

    try {
      // Log command use
      let date = new Date().toLocaleString();
      console.log(
        `\nDate and time: ${date}` +
          `\nCommand: "${command.name}" was run by "${msg.author.tag}" (${msg.author.id}) in server: "${msg.guild.name}" (${msg.guild.id}) at channel: "${msg.channel.name}" (${msg.channel.id})` +
          `\nFull message: "${msg}"`
      );

      // Execute command
      await command.run({ ...bot, msg, args });
    } catch (err) {
      // Log error(s) if any occured
      let errMsg = err.toString();

      if (errMsg.startsWith("?")) {
        errMsg = errMsg.slice(1);
        await msg.reply(errMsg);
      } else {
        console.error(err);
      }
    }
  },
};
