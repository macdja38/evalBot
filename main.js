/**
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

var updateCraft = "/Bots/PvPCraft/./fetch.sh";

var AuthDetails = require("../../../auth.json");

// Get the email and password
//var AuthDetails = require("auth.json");

var bot = new Discord.Client({forceFetchUsers: true});

bot.on("ready", function () {
    console.log("Ready to begin! Serving in " + bot.channels.length + " channels");
    console.log("users: " + bot.users.length);
});

bot.on("disconnected", function () {

    console.error("Disconnected!");
    process.exit(1); //exit node.js with an error

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
    if (msg.content.indexOf("eval ") == 0 && msg.author.id === bot.user.id) {
        var code = msg.content.slice(5);
        var t0 = now();
        try {
            var evaled = eval(code);
            var t1 = now();
            if(evaled.length > 2000) {
                evaled.substr(evaled.length-1000, evaled.length)
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
    else if (msg.content.indexOf("exec ") == 0 && msg.author.id === bot.user.id) {
        var code = msg.content.slice(5);
        var t0 = now();
        exec(code, (error, stdout, stderr) => {
            var t1 = now();
            if(stdout.length > 1000) {
                stdout = stdout.substr(evaled.length-1000, evaled.length)
            }
            if(!error) {
                bot.updateMessage(msg, "```xl\n" +
                    clean(code) +
                    "\n- - - - - - evaluates-to- - - - - - -\n" +
                    clean(stdout) +
                    "- - - - - - - - - - - - - - - - - - -\n" +
                    "In " + (t1 - t0) + " milliseconds!\n```");
                console.log(evaled);
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
});

function clean(text) {
    if (typeof(text) === "string") {
        return text.replace("``", "`" + String.fromCharCode(8203) + "`");
    }
    else {
        return text;
    }
}

bot.loginWithToken(AuthDetails.jake.token);