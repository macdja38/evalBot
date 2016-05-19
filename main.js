/**
 *
 * Created by macdja38 on 2016-01-01.
 */
/*
 this bot is a permissions bot and is currently working
 with the experimental additions. Some functions may
 change in the future.
 */

var Discord = require("discord.js");
var now = require("performance-now");
var exec = require("child_process").exec;

var DiscordHacks = require("../../discordHacks.js");
var dh = new DiscordHacks("../../ammo.json", require("../../ammo.json"));

var updateCraft = "/Bots/PvPCraft/./fetch.sh";

var AuthDetails = require("../../../auth.json");

// Get the email and password
//var AuthDetails = require("auth.json");

var hasConnected = false;

var bot = new Discord.Client({forceFetchUsers: true, autoReconnect: true});

bot.on("ready", function () {
    bot.setStatusIdle();
    if(!hasConnected) {
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

bot.on("message", function (msg) {
    if (msg.content === "!!wherearewe" && msg.channel.isPrivate) {
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
    }
    if (msg.author.id === bot.user.id && msg.content.indexOf("eval ") == 0) {
        var code = msg.content.slice(5);
        var t0 = now();
        try {
            var evaled = eval(code);
            var t1 = now();
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
            var t1 = now();
            bot.updateMessage(msg, "```xl\n" +
                clean(code) +
                "\n- - - - - - - errors-in- - - - - - - \n" +
                clean(error) +
                "\n- - - - - - - - - - - - - - - - - - -\n" +
                "In " + (t1 - t0) + " milliseconds!\n```");
            console.error(error);
        }
    }
    else if (msg.author.id === bot.user.id && msg.content.indexOf("exec ") == 0) {
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
    }
    else {
        dh.msgHax(msg, bot);
    }
});

function clean(text) {
    if (typeof(text) === "string") {
        return text.replace("``", "`" + String.fromCharCode(8203) + "`");
    }
    else {
        return text;
    }
}

bot.loginWithToken(AuthDetails.jake.token, (error)=>{
    if(error !== null) {
        console.error(error);
    }
});
