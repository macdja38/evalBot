"use strict";

var fs = require("fs");

var DiscordHacks = function (path, file) {
    this.ammodrop = path;
    this.ammo = file;
};

DiscordHacks.prototype.test = function () {
    console.log(this.ammodrop);
    return(this.ammodrop);
};

DiscordHacks.prototype.get = function (key) {
    var test = key.slice(1, key.length - 1);
    if (this.ammo[test]) {
        return (this.ammo[test].mention)
    }
    return key;
};

DiscordHacks.prototype.getFix = function (key) {
    this.ammo[key.match(/<:(\w+):\d+>/)[1]].sub = false;
    this.ammo[key.match(/<:(\w+):\d+>/)[1]].mention = key.match(/<:\w+:\d+>/)[0];
    fs.writeFile(this.ammodrop, JSON.stringify(this.ammo, null, 2), (error) => {
        console.error(error);
    });
    return key.match(/<:\w+:\d+>/);
};

DiscordHacks.prototype.msgHax = function (msg, bot) {
    if (msg.author.id === bot.user.id && /:\w+:/g.test(msg.content)) {
        this.hax(msg, bot)
    }
    else if (msg.author.id !== bot.user.id && /<:(\w+):\d+>/g.test(msg.content)) {
        console.log("Adding from " + msg.content);
        this.add(msg.content);
    }
};

DiscordHacks.prototype.add = function (msg) {
    var parts = msg.match(/(<:\w+:\d+>)/g);
    console.log(parts);
    for (var part of parts) {
        console.log(part);
        if((/<:\w+:\d+>/g.test(part))) {
            console.log(true);
            if((this.ammo[part.match(/<:(\w+):\d+>/)[1]] == null)) {
                console.log("found part and adding");
                var key = part.match(/<:(\w+):(\d+)>/);
                this.ammo[key[1]] = {};
                this.ammo[key[1]].name = key[1];
                this.ammo[key[1]].id = key[2];
                this.ammo[key[1]].sub = true;
                this.ammo[key[1]].mention = "<<:" + key[1] + ":" + key[2] + ">" + key[2] +">";
                fs.writeFile(this.ammodrop, JSON.stringify(this.ammo, null, 2), (error) => {
                    console.error(error);
                });
            }
        }
    }
};

DiscordHacks.prototype.hax = function (msg, bot) {
    var parts = msg.content.split(/(:\w+:)/g);
    for (var i in parts) {
        if (/:\w+:/.test(parts[i]) && (parts[i-1]).slice(-1) !== "<") {
            parts[i] = this.get(parts[i]);
        }
    }
    parts = parts.join("");
    if (msg.content != parts) {
        bot.updateMessage(msg, parts, (error, changedMessageMaybe)=> {
                var parts = changedMessageMaybe.content.split(/(<<:\w+:\d+>\d+>)/g);
                for (var i in parts) {
                    if (/<<:\w+:\d+>\d+>/.test(parts[i])) {
                        parts[i] = this.getFix(parts[i]);
                    }
                    else {
                        if (/:\w+:/.test(parts[i]) && (parts[i-1]).slice(-1) !== "<") {
                            console.log("did convert" + parts[i]);
                            parts[i] = this.get(parts[i]);
                            console.log("used to be" + parts[i])
                        }
                    }
                }
                parts = parts.join("");
            console.log("parts:" + parts);
            if(changedMessageMaybe.content != parts) {
                bot.updateMessage(msg, parts);
            }
        });
    }
};

module.exports = DiscordHacks;