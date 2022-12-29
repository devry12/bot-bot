const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ask')
        .setDescription('Replies  your question!')
        .addStringOption(option =>
            option.setName('input')
                .setDescription('The input to echo back')),
    async execute(interaction) {
        await interaction.reply('PongPong!');
    },


};