const { Client, Collection, GatewayIntentBits } = require("discord.js");
const { readdirSync } = require("fs");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { SlashCommandBuilder } = require("@discordjs/builders");
const path = require("path");

class CommandClient extends Client {
  constructor(options) {
    super({
      intents: Object.keys(GatewayIntentBits).map((a) => {
        return GatewayIntentBits[a];
      }),
    });

    this.token = options.token;
    this.commandFolder = options.commandFolder || "commands";
    this.eventFolder = options.eventFolder || "events";
    this.commands = new Collection();
    if (!this.token) throw new Error("No Token Provided");

    // Event handler
    this.setupEvents();
  }

  async setupCommands() {
    const commandFiles = readdirSync(this.commandFolder);

    for (const file of commandFiles) {
      if (file.includes('js')) {
        const command = require(path.join(
          process.cwd(),
          this.commandFolder,
          file
        ));
        this.commands.set(command.data.name, command);

      } else {
        const category = readdirSync(`${this.commandFolderFolder}/${file}`);

        for (const commands of category) {
          const command = require(path.join(
            process.cwd(),
            this.commandFolder,
            file,
            commands
          ));
          this.commands.set(command.data.name, command);
        }
      }
     
    }
  }

  async setupEvents() {
    const eventFiles = readdirSync(this.eventFolder);

    for (const file of eventFiles) {
      if (file.includes(".js")) {
        const event = require(path.join(process.cwd(), this.eventFolder, file));
        this.on(event.name, event.run.bind(null, this));
      } else {
        const category = readdirSync(`${this.eventFolder}/${file}`);

        for (const events of category) {
          const event = require(path.join(
            process.cwd(),
            this.eventFolder,
            file,
            events
          ));
          this.on(event.name, event.run.bind(null, this));
        }
      }
    }

    // Ready event handler
    this.once("ready", () => {
      this.setupCommands(); // Declare the commands
    });

    // Interaction (slash command) event handler
    this.on("interactionCreate", async (interaction) => {
      if (!interaction.isCommand()) return;

      const command = this.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: "An error occurred while executing this command.",
          ephemeral: true,
        });
      }
    });
  }

  async registerCommands() {
    const commands = this.commands.filter(
      (command) => command.data instanceof SlashCommandBuilder
    );

    const rest = new REST({ version: "9" }).setToken(this.token);

    try {
      console.log("Started refreshing application (/) commands.");

     const x = await rest.put(Routes.applicationCommands(this.user.id), {
        body: commands.map((command) => command.data.toJSON()),
      });
await console.log(x)
      console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
      console.log("Error refreshing application (/) commands:", error);
    }
  }

  async start() {
    await this.login(this.token);
    await this.registerCommands()
  }
}

module.exports = CommandClient;
