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
            console.log("Is a valid emote");
            if((this.ammo[part.match(/<:(\w+):\d+>/)[1]] == null)) {
                console.log("Is not already in the database and is being added.");
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
    //break appart the message into sections based on potential emote locations.
    var parts = msg.content.split(/(:\w+:)/g);
    for (var i in parts) {
        //if each part is of the form :emote: and is not also a proper emote already try to replace it with one.
        if (/:\w+:/.test(parts[i]) && (parts[i-1]).slice(-1) !== "<") {
            //get the emote and replace the keyword with it.
            parts[i] = this.get(parts[i]);
        }
    }
    //recombire into one message
    parts = parts.join("");
    if (msg.content != parts) {
        //if the message is different update the message
        bot.updateMessage(msg, parts, (error, changedMessageMaybe)=> {
            //the message should now contain all the twitch emotes it needs to, but their's a chance
            //some of the emotes don't need to be injected but have never been tested. this will check for those.
            
            //break the message appart centering around injected emotes that did not get filtered to normal emotes by discord.
                var parts = changedMessageMaybe.content.split(/(<<:\w+:\d+>\d+>)/g);
                
                for (var i in parts) {
                    if (/<<:\w+:\d+>\d+>/.test(parts[i])) {
                        //if this part is a injected emote and needs to be fixed call getFix on it, which will get the 
                        //proper emote and record that it did not need to be injeceted to the config file.
                        parts[i] = this.getFix(parts[i]);
                    }
                    else {
                        //if it's an emote that needed to be injected it will now be in a state that would get filtered out by
                        //discord, so re-inject.
                        if (/:\w+:/.test(parts[i]) && (parts[i-1]).slice(-1) !== "<") {
                            console.log("did convert" + parts[i]);
                            parts[i] = this.get(parts[i]);
                            console.log("used to be" + parts[i])
                        }
                    }
                }
                //recombine into a single message
                parts = parts.join("");
            console.log("parts:" + parts);
            //if the new message changed update the message.
            if(changedMessageMaybe.content != parts) {
                bot.updateMessage(msg, parts);
            }
        });
    }
};

module.exports = DiscordHacks;
