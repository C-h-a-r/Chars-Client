<p align="center">
  <img width="250" src="https://cdn.discordapp.com/attachments/1138248259228422204/1145384448293093457/KCMvlKq.png">
</p>
<h1 align="center"> Chars Client </h1>
<p align="center">
  <b >Build Bots Fast With An Easy To Use Package</b>
</p>

<br>


## **Description**
A package that provides you with a structure to make a discord bot with a fully functional event handler and slash commands.


### **Installation**
```
npm i chars-client
```
<br>

### **How To Use**


```javascript
// index.js

const CommandClient = require('chars-client');

const client = new CommandClient({
  token: '', // Enter your bots token
  commandFolder: '', // Enter your command folder name (defults to commands)
  eventFolder: '', // Enter your event folder name (defults to events)
});

client.start();
```

```javascript
// events/ready.js

module.exports = {
  name: 'ready',
  run(client) {
    console.log(`Logged in as ${client.user.tag}`);
  },
};
```

```javascript
// commands/ping.js

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Ping command'),
  async execute(interaction) {
    await interaction.reply('Pong!');
  },
};
```

## Info
<p>You can find your discord bot token <a href="https://discord.com/developers/applications/">here</a></p>

## Changelog
<p>
- Added Event Categories
</p>


### Help
[![](https://dcbadge.vercel.app/api/server/bGy3qtEHtV)](https://discord.gg/bGy3qtEHtV)