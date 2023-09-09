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
    const commandFiles = readdirSync(this.commandFolder).filter((file) =>
      file.endsWith(".js")
    );

    for (const file of commandFiles) {
      const command = require(path.join(
        process.cwd(),
        this.commandFolder,
        file
      ));
      this.commands.set(command.data.name, command);
    }
  }

  async setupEvents() {
    const eventFiles = readdirSync(this.eventFolder).filter((file) =>
      file.endsWith(".js")
    );

    for (const file of eventFiles) {
      const event = require(path.join(process.cwd(), this.eventFolder, file));
      this.on(event.name, event.run.bind(null, this));
    }

    // Ready event handler
    this.once("ready", () => {
      this.setupCommands(); // Declare the commands
      this.registerCommands(); // Register the commands
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

    const rest = new REST({ version: "10" }).setToken(this.token);

    try {
      console.log("Started refreshing application (/) commands.");

      await rest.put(Routes.applicationCommands(this.user.id), {
        body: commands.map((command) => command.data.toJSON()),
      });

      console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
      throw new Error("Error refreshing application (/) commands:", error);
    }
  }

  async start() {
    await this.login(this.token);
  }
}

module.exports = CommandClient;
