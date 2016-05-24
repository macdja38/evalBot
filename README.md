# evalBot
simple bot to eval and execute things for it's master

# installation instructions
 Requires **node.js** greater than v4 and npm. **pm2** is optional but highly recomended.

 - `git clone`
 - open that directory.
 - `npm install --no-optional`
 - duplicate `ammo.example.json` to `ammo.json` and `auth.example.json` to `auth.json`
 - edit the `auth.json` file and enter your token.
 - if you have pm2 run the bot with `pm2 start pm2.json` if not run it using `node main.js`

# Token
If you are new to discord bot's you may not know how to find your token. Don't worry it's not too bad.
 - open discord in your browser or in the client.
 - Press `Ctrl` + `Shift` + `I`
 - open the `resources` or `storage` tab depending on your thing.
 - Open `Local storage`.
 - Open `discordapp.com`
 - copy the value for token. (the long random thing between the "")
