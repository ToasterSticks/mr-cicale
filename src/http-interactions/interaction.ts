import {
	InteractionType,
	type APIInteraction,
	type APIApplicationCommandInteraction,
	type APIMessageComponentInteraction,
	type APIModalSubmitInteraction,
	type RESTPostAPIInteractionFollowupJSONBody,
	type APIApplicationCommandAutocompleteInteraction,
} from 'discord-api-types/v10';
import nacl from 'tweetnacl';
import { Buffer } from 'buffer';
import type { File, InteractionHandler, InteractionHandlerReturn } from './types';
import type { CommandStore } from './handler';
import type { APIApplicationCommandInteractionDataAutocompleteOption } from '../types';

const makeValidator =
	({ publicKey }: { publicKey: string }) =>
	async (request: Request) => {
		const headers = Object.fromEntries(request.headers);
		const signature = String(headers['x-signature-ed25519']);
		const timestamp = String(headers['x-signature-timestamp']);
		const body = await request.json();
		const isValid = nacl.sign.detached.verify(
			Buffer.from(timestamp + JSON.stringify(body)),
			Buffer.from(signature, 'hex'),
			Buffer.from(publicKey, 'hex')
		);

		if (!isValid) throw new Error('Invalid request');
	};

const isFileUpload = (data: InteractionHandlerReturn) => data.files && data.files.length > 0;

export const formDataResponse = (
	data: InteractionHandlerReturn | (RESTPostAPIInteractionFollowupJSONBody & { files?: File[] })
) => {
	const formData = new FormData();

	if (data.files) {
		for (const file of data.files) formData.append(file.name, new Blob([file.data]), file.name);
		delete data.files;
	}

	formData.append('payload_json', JSON.stringify(data));

	return formData;
};

const createResponse = (data: InteractionHandlerReturn) =>
	isFileUpload(data)
		? new Response(formDataResponse(data))
		: new Response(JSON.stringify(data), {
				headers: { 'Content-Type': 'application/json' },
		  });

export const interaction = ({
	publicKey,
	commands,
}: {
	publicKey: string;
	commands: CommandStore;
}) => {
	return async (request: Request): Promise<Response> => {
		const validateRequest = makeValidator({ publicKey });

		try {
			await validateRequest(request.clone());
			try {
				const interaction = (await request.json()) as APIInteraction;

				let handler:
					| InteractionHandler<APIApplicationCommandInteraction>
					| InteractionHandler<APIApplicationCommandAutocompleteInteraction>
					| InteractionHandler<APIMessageComponentInteraction>
					| InteractionHandler<APIModalSubmitInteraction>
					| undefined;

				const restArgs: any[] = [];

				switch (interaction.type) {
					case InteractionType.Ping: {
						return createResponse({ type: 1 });
					}

					case InteractionType.ApplicationCommand: {
						if (!interaction.data?.name) break;

						const command = commands.get(interaction.data.name);
						if (command) handler = command.exec;
						break;
					}

					case InteractionType.ApplicationCommandAutocomplete: {
						if (!interaction.data?.name) break;

						const command = commands.get(interaction.data.name);
						if (command?.autocomplete) {
							const option = interaction.data.options
								.filter(
									(option): option is APIApplicationCommandInteractionDataAutocompleteOption =>
										'focused' in option
								)
								.find(({ focused }) => focused == true);

							if (option) handler = command.autocomplete[option.name];
							restArgs.push(option);
						}
						break;
					}

					case InteractionType.MessageComponent: {
						const commandInteraction = interaction.message.interaction;
						if (!commandInteraction) break;

						const command = commands.get(commandInteraction.name.split(' ')[0]);
						if (command?.components) {
							const [name, ...args] = interaction.data.custom_id.split(':');
							restArgs.push(args);
							handler = command.components[name];
						}
						break;
					}

					case InteractionType.ModalSubmit: {
						const [name, ...args] = interaction.data.custom_id.split(':');
						restArgs.push(args);
						const command = commands.get(name);
						if (command?.modal) handler = command.modal;
						break;
					}
				}

				if (!handler) return new Response(null, { status: 500 });

				if (interaction.member) interaction.user = interaction.member.user;

				const response = await (handler as InteractionHandler<APIApplicationCommandInteraction>)(
					interaction as APIApplicationCommandInteraction,
					...restArgs
				);

				return createResponse(response);
			} catch {
				return new Response(null, { status: 400 });
			}
		} catch {
			return new Response(null, { status: 401 });
		}
	};
};
