/**
 *
 * Created by macdja38 on 2016-01-01.
 */
"use strict";
/*
 this bot is a permissions bot and is currently working
 with the experimental additions. Some functions may
 change in the future.
 */

let Discord = require("discord.js");
let now = require("performance-now");
let exec = require("child_process").exec;

let Configs = require("./lib/config.js");
let config = new Configs("config");

let AuthDetails = require("./auth.json");

let request = require("request");

let openpgp = require('openpgp');

let publicKeys = false, privateKeys = false;

try {
  let {privateKey, pubKey, secretKey} = require("./keys");

  openpgp.config.aead_protect = true; // activate fast AES-GCM mode (not yet OpenPGP standard)

  publicKeys = openpgp.key.readArmored(pubKey).keys;
  privateKeys = openpgp.key.readArmored(privateKey).keys[0];
  privateKeys.decrypt(secretKey);
} catch (error) {
  console.log("Keys.js could not be loaded, message verification disabled");
}

// Get the email and password
//var AuthDetails = require("auth.json");

//these are global variables you can use within eval statements for whatever.
var v1;
var v2;
var v3;

var hasConnected = false;

var bot = new Discord.Client({forceFetchUsers: false, autoReconnect: true, bot: false});
//increase compatibility with other users code when using eval.
var client = bot;

bot.on("ready", function () {
  bot.setStatusIdle();
  if (!hasConnected) {
    console.log("Ready to begin! Serving in " + bot.channels.length + " channels");
    console.log("users: " + bot.users.length);
    hasConnected = true;
  } else {
    console.error("Reconnected Successfully")
  }
});

bot.on("disconnected", function () {
  console.error("Disconnected!");
});

bot.on('serverNewMember', (server, user) => {
  console.log(user.username + " joined " + server.name);
  if (config.get("welcome", {enable: false}).enable && config.get("welcome", {servers: []}).servers.indexOf(server.id) > -1) {
    console.log("Welcoming is enabled and this server is on the list");
    /* this won't work because the bot can't tell if it's online.
     if(config.get("welcome", {onlyWhenOnline:true}).onlyWhenOnline) {
     console.log("Master is" + bot.user.status);
     if(bot.user.status != "online") {
     return;
     }
     }
     console.log("Bots master is online");
     */
    var messages = config.get("welcome", {
      messages: ["Welcome **$user**!"]
    }).messages;
    var min = config.get("welcome", {minDelay: 3}).minDelay;
    var max = config.get("welcome", {maxDelay: 20}).maxDelay;
    var typingInterval = config.get("welcome", {typingInterval: 3}).typingInterval;
    var msgDelay = Math.floor(Math.random() * (max - min)) + min;
    console.log("Welcoming in " + msgDelay + "s");
    if (msgDelay > typingInterval + 2) {
      console.log("Will pretend to type.");
      setTimeout(() => {
        console.log("Started Tying");
        bot.startTyping(server.general);
      }, (msgDelay - typingInterval) * 1000);
      setTimeout(() => {
        console.log("Stopped Typing");
        bot.stopTyping(server.general);
      }, (msgDelay) * 1000);
      //just in case one of the other possible things that stop it don't stop it
      setTimeout(() => {
        console.log("Stopped Typing just in case");
        bot.stopTyping(server.general);
      }, (msgDelay + 10) * 1000);
    }
    setTimeout(() => {
      bot.sendMessage(
        server.general,
        clean(messages[Math.floor(Math.random() * messages.length)]
          .replace(/\$server/g, server.name).replace(/\$user/g, user.username))
      );
    }, msgDelay * 1000
    )
  }
});

bot.on("message", function (msg) {
  if (msg.author.id !== bot.user.id) return;
  if (msg.content.indexOf("eval ") == 0) {
    if (msg.embeds.length > 0) return;
    let code = msg.content.slice(5);
    //noinspection JSUnusedLocalSymbols
    let client = bot;
    //noinspection JSUnusedLocalSymbols
    let message = msg;
    //noinspection JSUnusedLocalSymbols
    let server = msg.channel.server;
    //noinspection JSUnusedLocalSymbols
    let channel = msg.channel;
    let t0 = now();
    let t1;
    try {
      let t1, evaluated;
      evaluated = eval(code);
      t1 = now();
      let embedText = "```xl\n" +
        "\n- - - - - - evaluates-to- - - - - - -\n" +
        clean(evaluated) +
        "\n- - - - - - - - - - - - - - - - - - -\n" +
        "In " + (t1 - t0) + " milliseconds!\n```";
      if (evaluated && evaluated.catch) evaluated.catch(() => {
      });
      msg.edit(msg.content, {embed: {description: embedText, color: 0x00FF00}}).then(() => {
        if (evaluated && evaluated.then) {
          return evaluated.then((result) => {
            embedText = embedText.substring(0, embedText.length - 4);
            embedText += "\n- - - - -Promise resolves to- - - - -\n";
            embedText += clean(result);
            embedText += "\n- - - - - - - - - - - - - - - - - - -\n";
            embedText += "In " + (now() - t0) + " milliseconds!\n```";
            msg.edit(msg.content, {
              embed: {
                description: embedText,
                color: 0x00FF00
              }
            })
          }).catch((error) => {
            embedText = embedText.substring(0, embedText.length - 4);
            embedText += "\n- - - - - Promise throws- - - - - - -\n";
            embedText += clean(error);
            embedText += "\n- - - - - - - - - - - - - - - - - - -\n";
            embedText += "In " + (now() - t0) + " milliseconds!\n```";
            msg.edit(msg.content, {
              embed: {
                description: embedText,
                color: 0xFF0000
              }
            })
          }).catch(error => console.error(error));
        }
      });
      console.log(evaluated);
    }
    catch (error) {
      t1 = now();
      msg.edit(msg.content, {
        embed: {
          description: "```xl\n" +
          "\n- - - - - - - errors-in- - - - - - - \n" +
          clean(error) +
          "\n- - - - - - - - - - - - - - - - - - -\n" +
          "In " + (t1 - t0) + " milliseconds!\n```",
          color: 0xFF0000
        }
      });
      console.error(error);
    }
    return;
  }
  if (msg.content.indexOf("exec ") == 0) {
    (function () {
      var code = msg.content.slice(5);
      var t0 = now();
      exec(code, (error, stdout, stderr) => {
        var t1 = now();
        if (!error) {
          if (stdout) {
            if (stdout.length > 1300) {
              stdout = stdout.substr(stdout.length - 1299, stdout.length)
            }
          }
          bot.updateMessage(msg, "```xl\n" +
            clean(code) +
            "\n- - - - - - evaluates-to- - - - - - -\n" +
            clean(stdout) +
            "- - - - - - - - - - - - - - - - - - -\n" +
            "In " + (t1 - t0) + " milliseconds!\n```");
          console.log(stdout);
        }
        else {
          bot.updateMessage(msg, "```xl\n" +
            clean(code) +
            "\n- - - - - - - errors-in- - - - - - - \n" +
            clean(stderr) +
            "- - - - - - - - - - - - - - - - - - -\n" +
            "In " + (t1 - t0) + " milliseconds!\n```");
          console.error(stderr);
        }
      });
    })();
    return;
  }
  if (msg.content.toLowerCase().indexOf("setwelcome ") == 0) {
    try {
      console.log("Changing welcome state.");
      let arg = msg.content.split(" ");
      if (arg.length > 1) {
        arg = arg[1];
        if (arg == "true" || arg == "false") {
          if (config.data && config.data.welcome) {
            config.data.welcome.enable = arg == "true";
            config.save();
            bot.updateMessage(msg, "Success");
            console.log("Saved config.")
          } else {
            msg.reply("config entry found");
          }
        }
        else {
          msg.reply("`setWelcome <true|false>`")
        }
      } else {
        msg.reply("`setWelcome <true|false>`")
      }
    } catch (error) {
      console.error(error);
      bot.updateMessage(msg, error + "Check logs for a detailed explanation");
    }
    return;
  }

  if (msg.content.toLowerCase().indexOf("setavatar ") == 0) {
    try {
      console.log("Changing avatar");
      let arg = msg.content.split(" ");
      if (arg.length < 1) return msg.reply("setavatar <url>");
      arg = arg[1];
      request({
        method: 'GET',
        url: arg,
        encoding: null
      }, (err, res, image) => {
        if (err) {
          client.sendMessage(msg.channel, "Failed to get a valid image.");
          return true;
        }
        client.setAvatar(image)
          .then(() => {
            client.sendMessage(msg.channel, "Changed avatar.");
          })
          .catch((err) => {
            client.sendMessage(msg.channel, `Failed setting avatar with error ${err.response.body}`);
            console.log(err);
            console.log("request thingy", err.response.body);
            return true;
          });
      });

    } catch (error) {
      msg.reply(error);
      console.log(error);
    }
    return
  }

  if (msg.content.toLowerCase().indexOf("setusername ") == 0) {
    try {
      console.log("Changing username");
      let arg = msg.content.split(" ");
      if (arg.length < 1) return msg.reply("setusername <name>");
      arg = arg[1];
      arg = "``\u0007`";
      client.setUsername(arg)
        .then(() => {
          client.sendMessage(msg.channel, `Changed username to ${arg}`);
        })
        .catch((err) => {
          client.sendMessage(msg.channel, `Failed setting username with error ${JSON.stringify(err.response.body)}`);
          console.log("request thingy", err.response.body);
          return true;
        });

    } catch (error) {
      msg.reply(error);
      console.log(error);
    }
  }


  if (msg.content.endsWith("-s") && publicKeys) {
    let text = msg.content.slice(0, msg.content.length - 3);

    let options = {
      data: `IDENTITY
      ID: ${bot.user.id}
      USERNAME: ${bot.user.username}
      DISCRIMINATOR: ${bot.user.discriminator}
      DATE: ${new Date()}\nMESSAGE:\n
${text}\n`,
      publicKeys: publicKeys,
      privateKeys: privateKeys,
    };

    openpgp.sign(options).then(function (cipherText) {
      uploadFile(cipherText.data).then((link) => {
        msg.edit("", {
          embed: {
            description: text,
            footer: {
              text: link,
              icon_url: "https://pvpcraft.ca/i/lock.png",
              proxy_icon_url: "https://pvpcraft.ca/i/lock.png"
            }
          }
        });
      }).catch(() => {
        msg.edit("", {embed: {description: text + "\n" + cipherText.data}});
      })
    });
  }
});

function uploadFile(data) {
  return new Promise((resolve, reject) => {
    request.post(AuthDetails.sharex.address, {
      formData: {
        secret: AuthDetails.sharex.secret,
        sharex: {
          value: data,
          options: {
            filename: "file.txt",
            contentType: "application/pgp-signature"
          }
        }
      }
    }, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res.body);
      }
    })
  })
}

function clean(text) {
  if (typeof(text) === "string") {
    return text.replace(/``/g, "`" + String.fromCharCode(8203) + "`").replace(/@/g, "@" + String.fromCharCode(8203));
  } else if (text !== null && text !== undefined) {
    return text.toString().replace(/``/g, "`" + String.fromCharCode(8203) + "`").replace(/@/g, "@" + String.fromCharCode(8203))
  } else {
    return text;
  }
}

bot.on("error", console.error);

bot.loginWithToken(AuthDetails.jake.token, AuthDetails.jake.email, AuthDetails.jake.password, (error) => {
  if (error !== null) {
    console.error(error);
  }
});