require('dotenv').config()
// Require the necessary discord.js classes
const { Client, REST, Routes, Events, Collection, GatewayIntentBits } = require('discord.js');
const { ChatGPTAPIBrowser } = require('chatgpt')
const fs = require('node:fs');
const path = require('node:path');




async function main() {
     var token = process.env.tokenBot
     var clientId = process.env.clientId
    if (typeof localStorage === "undefined" || localStorage === null) {
        var LocalStorage = require('node-localstorage').LocalStorage;
        localStorage = new LocalStorage('./scratch');
    }
    // Create a new client instance
    const client = new Client({ intents: [GatewayIntentBits.Guilds] });

    client.commands = new Collection()
    const commands: any[] = [];

    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        commands.push(command.data.toJSON());
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }

    const rest = new REST({ version: '10' }).setToken(token);

    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(Routes.applicationCommands(clientId), { body: commands });

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);


    // When the client is ready, run this code (only once)
    // We use 'c' for the event parameter to keep it separate from the already defined 'client'
    const api = new ChatGPTAPIBrowser({
        email: process.env.email,
        password: process.env.password,
        nopechaKey: process.env.nopechaKey,
       
    })

    await api.initSession()
    client.once(Events.ClientReady, async c => {
        console.log(`Ready! Logged in as ${c.user.tag}`);
        localStorage.clear()
    });

    client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isChatInputCommand()) return;


        if (interaction.commandName === 'ask') {
            var question = interaction.options.getString('input')
            await interaction.deferReply()
            if (localStorage.getItem(`con${interaction.user.id}`) != null) {
                var res = await api.sendMessage(question, {
                    conversationId: localStorage.getItem(`con${interaction.user.id}`),
                    parentMessageId: localStorage.getItem(`par${interaction.user.id}`)
                })
                console.log(`data ada ${res.response}`);
                await interaction.editReply(res.response);
            } else {
                var res = await api.sendMessage(question)
                localStorage.setItem(`con${interaction.user.id}`, res.conversationId);
                localStorage.setItem(`par${interaction.user.id}`, res.messageId);
                console.log(`data belum ada ${res.response}`);
                await interaction.editReply(res.response);
            }

        }
        // console.log();
    });

    // Log in to Discord with your client's token
    client.login(token);
}
main()