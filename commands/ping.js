const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pingping')
		.setDescription('Replies with PongPong!'),
	async execute(interaction) {
		await interaction.reply('PongPong!');
	},
};