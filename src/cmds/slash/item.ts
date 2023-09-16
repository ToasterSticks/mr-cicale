import {
	InteractionResponseType,
	type ApplicationCommandType,
	ApplicationCommandOptionType,
	MessageFlags,
} from 'discord-api-types/v10';
import { canvasFetch, compareCaseInsensitive, getOption } from '../../util';
import type { Command, File } from '../../http-interactions';
import type { CanvasFile, Module, ModuleItem } from '../../types';

export const command: Command<ApplicationCommandType.ChatInput> = {
	name: 'item',
	description: 'Get an item from a module',
	options: [
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'module',
			description: 'The module the item is from',
			autocomplete: true,
			required: true,
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'item',
			description: 'The item to display',
			autocomplete: true,
			required: true,
		},
	],

	exec: async ({ data: { options } }) => {
		const items = await canvasFetch<ModuleItem[]>(
			`/courses/${CANVAS_COURSE_ID}/modules/${getOption<number>(options, 'module')}/items`
		);

		const item = items.find(({ id }) => id === getOption<number>(options, 'item'));

		if (!item)
			return {
				type: InteractionResponseType.ChannelMessageWithSource,
				data: {
					content: 'Something went wrong :/',
					flags: MessageFlags.Ephemeral,
				},
			};

		let content = '';
		const files: File[] = [];

		switch (item.type) {
			case 'File': {
				const file = await canvasFetch<CanvasFile>(`/files/${item.content_id}`);
				if (file.size < 2e7) {
					const buffer = await fetch(file.url).then((res) => res.arrayBuffer());
					files.push({ name: file.display_name, data: buffer });
				} else content = `[${file.display_name}](${file.url})`;
				break;
			}
			case 'ExternalUrl': {
				content = `[${item.title}](${item.external_url})`;
				break;
			}
			// case 'Assignment': {
			// 	const assignment = await canvasFetch<Assignment>(
			// 		`/courses/${CANVAS_COURSE_ID}/assignments/${item.content_id}`
			// 	);

			// 	break;
			// }
			default: {
				content = '```json\n' + JSON.stringify(item, null, 2) + '```';
			}
		}

		return {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: { content },
			files,
		};
	},

	autocomplete: {
		module: async (_, a) => {
			const modules = await canvasFetch<Module[]>(`/courses/${CANVAS_COURSE_ID}/modules`);

			const filtered = modules
				.filter(({ name }) => compareCaseInsensitive(name, a.value.toString()))
				.slice(0, 25);

			return {
				type: InteractionResponseType.ApplicationCommandAutocompleteResult,
				data: { choices: filtered.map(({ name, id }) => ({ name, value: id })) },
			};
		},
		item: async ({ data: { options } }, a) => {
			const items = await canvasFetch<ModuleItem[]>(
				`/courses/${CANVAS_COURSE_ID}/modules/${getOption<number>(options, 'module')}/items?` +
					new URLSearchParams({ 'include[]': 'content_details' })
			);

			const filtered = items
				.filter(({ title }) => compareCaseInsensitive(title, a.value.toString()))
				.slice(0, 25);

			return {
				type: InteractionResponseType.ApplicationCommandAutocompleteResult,
				data: { choices: filtered.map(({ title, id }) => ({ name: title, value: id })) },
			};
		},
	},
};
