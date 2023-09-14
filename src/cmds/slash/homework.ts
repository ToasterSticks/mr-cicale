import {
	InteractionResponseType,
	type ApplicationCommandType,
	ApplicationCommandOptionType,
} from 'discord-api-types/v10';
import type { Command } from '../../http-interactions';
import { getHwAsArray, getHwImageArray, getOption } from '../../util';

export const command: Command<ApplicationCommandType.ChatInput> = {
	name: 'hw',
	description: 'Display the last 7 days of homework',
	options: [
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'date',
			description: 'The date to send homework info for',
			autocomplete: true,
		},
	],

	exec: async ({ data: { options } }) => {
		const [texts, urls] = await Promise.all([getHwAsArray(), getHwImageArray()]);
		const dateIdx = getOption<number>(options, 'date') ?? 0;

		const content =
			texts[dateIdx] +
			'\n\n' +
			(urls[dateIdx].length
				? urls[dateIdx].map((url, i) => `[[IMG ${i + 1}]](${url})`).join(' ')
				: '');

		return {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: { content },
		};
	},

	autocomplete: {
		date: async (_, a) => {
			const data = await getHwAsArray();
			const dates = data
				.map((block) => block.match(/\d+\/\d+/)?.[0])
				.filter((date): date is string =>
					date !== undefined && a
						? stripDateZeroes(date).startsWith(stripDateZeroes(a.value.toString()))
						: true
				)
				.slice(0, 25);

			return {
				type: InteractionResponseType.ApplicationCommandAutocompleteResult,
				data: { choices: dates.slice(0, 25).map((name, value) => ({ name, value })) },
			};
		},
	},
};

const stripDateZeroes = (str: string) => str.replaceAll(/0(\d)/g, '$1');
