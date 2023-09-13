import { InteractionResponseType, type ApplicationCommandType } from 'discord-api-types/v10';
import type { Command } from '../../http-interactions';
import { getHwAsArray } from '../../util';

export const command: Command<ApplicationCommandType.ChatInput> = {
	name: 'hw',
	description: 'Display the last 7 days of homework',

	exec: async () => {
		const data = await getHwAsArray();

		return {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: { content: data[0] },
		};
	},
};
