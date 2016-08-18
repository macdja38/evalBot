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

var Discord = require("discord.js");
var now = require("performance-now");
var exec = require("child_process").exec;

var Configs = require("./lib/config.js");
var config = new Configs("config");

var AuthDetails = require("./auth.json");

// Get the email and password
//var AuthDetails = require("auth.json");

//these are global variables you can use within eval statements for whatever.
var v1;
var v2;
var v3;

var hasConnected = false;

var bot = new Discord.Client({forceFetchUsers: true, autoReconnect: true, bot: false});
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

bot.on('serverNewMember', (server, user)=> {
    console.log(user.username + " joined " + server.name);
    if (config.get("welcome", {enable: false}).enable && config.get("welcome", {servers: []}).servers.indexOf(server.id)>-1) {
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
            setTimeout(()=> {
                console.log("Started Tying");
                bot.startTyping(server.general);
            }, (msgDelay - typingInterval) * 1000);
            setTimeout(()=> {
                console.log("Stopped Typing");
                bot.stopTyping(server.general);
            }, (msgDelay) * 1000);
            //just in case one of the other possible things that stop it don't stop it
            setTimeout(()=> {
                console.log("Stopped Typing just in case");
                bot.stopTyping(server.general);
            }, (msgDelay + 10) * 1000);
        }
        setTimeout(()=> {
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
    /*if (msg.content === "!!wherearewe" && msg.channel.isPrivate && msg.author.id == bot.user.id) {
     var servlist = "";
     for (var serv of bot.servers) {
     console.log(msg.channel.recipient);
     for (var users of serv.members) {
     if (msg.channel.recipient.id == users.id) {
     servlist += serv.name + ", ";
     }
     }
     }
     bot.reply(msg, servlist);
     }*/
    if (msg.author.id === bot.user.id) {
        if (msg.content.indexOf("eval ") == 0) {
            (function () {
                var t0;
                var t1;
                var code = msg.content.slice(5);
                var client = bot;
                //noinspection UnnecessaryLocalVariableJS
                var message = msg;
                //should simplify some commands.
                var server = message.channel.server;
                var channel = msg.channel;
                t0 = now();
                try {
                    var evaled = eval(code);
                    t1 = now();
                    if (evaled) {
                        if (evaled.length >= 2000) {
                            evaled = evaled.substr(evaled.length - 1000, evaled.length)
                        }
                    }
                    bot.updateMessage(msg, "```xl\n" +
                        clean(code) +
                        "\n- - - - - - evaluates-to- - - - - - -\n" +
                        clean(evaled) +
                        "\n- - - - - - - - - - - - - - - - - - -\n" +
                        "In " + (t1 - t0) + " milliseconds!\n```");
                    console.log(evaled);
                }
                catch (error) {
                    t1 = now();
                    bot.updateMessage(msg, "```xl\n" +
                        clean(code) +
                        "\n- - - - - - - errors-in- - - - - - - \n" +
                        clean(error) +
                        "\n- - - - - - - - - - - - - - - - - - -\n" +
                        "In " + (t1 - t0) + " milliseconds!\n```");
                    console.error(error);
                }
            })();
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
                var arg = msg.content.split(" ");
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
        }
    }
});

function clean(text) {
    if (typeof(text) === "string") {
        return text.replace(/``/g, "`" + String.fromCharCode(8203) + "`").replace(/@/g, "@" + String.fromCharCode(8203));
    }
    else {
        return text.toString().replace(/``/g, "`" + String.fromCharCode(8203) + "`").replace(/@/g, "@" + String.fromCharCode(8203))
    }
}

bot.loginWithToken(AuthDetails.jake.token, (error)=> {
    if (error !== null) {
        console.error(error);
    }
});
