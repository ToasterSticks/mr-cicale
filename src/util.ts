import {
	ApplicationCommandOptionType,
	InteractionResponseType,
	RouteBases,
	ComponentType,
	ButtonStyle,
	type APIApplicationCommandInteractionDataBasicOption,
	type APIApplicationCommandInteractionDataOption,
	type APIApplicationCommandInteractionDataSubcommandOption,
	type APIInteractionResponse,
	type APIModalSubmission,
	type APIActionRowComponent,
	type APIMessageActionRowComponent,
} from 'discord-api-types/v10';

export const mapFiles = <T>(context: __WebpackModuleApi.RequireContext) =>
	context.keys().map<T>((path) => context(path).command);

export const noop = () => null;

export const restApiRequest = <T = null>(
	route: string,
	method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
	body?: FormData | unknown
): Promise<T | null> => {
	const requestOptions =
		body instanceof FormData
			? { method, body }
			: {
					method,
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bot ${BOT_TOKEN}`,
					},
					body: JSON.stringify(body),
			  };

	return fetch(RouteBases.api + route, requestOptions)
		.then((res) => (res.ok ? (res.json() as T) : null))
		.catch(noop);
};

export const deferUpdate = (): APIInteractionResponse => ({
	type: InteractionResponseType.DeferredMessageUpdate,
});

export const getOption = <
	T extends
		| APIApplicationCommandInteractionDataBasicOption['value']
		| APIApplicationCommandInteractionDataSubcommandOption[],
	R extends boolean = false
>(
	options: APIApplicationCommandInteractionDataOption[] | undefined,
	name: string,
	hoist = false
): R extends true ? T : T | null => {
	let hoisted = options;

	if (hoist && hoisted) {
		if (hoisted[0]?.type === ApplicationCommandOptionType.SubcommandGroup)
			hoisted = hoisted[0].options ?? [];

		if (hoisted[0]?.type === ApplicationCommandOptionType.Subcommand)
			hoisted = hoisted[0].options ?? [];
	}

	const option = hoisted?.find((option) => option.name === name);

	return ((option && ('value' in option ? option.value : option.options)) ?? null) as R extends true
		? T
		: T | null;
};

export const getModalValue = (data: APIModalSubmission, name: string) => {
	const row = data.components.find(({ components }) => components[0].custom_id === name)!;

	return row.components[0].value;
};

export const getHwAsArray = async () => {
	const url = `https://docs.google.com/document/d/${DOCUMENT_ID}/export?format=txt`;
	const text = await fetch(url).then((res) => res.text());
	return text.split(/(?:^|\n)(?=\d+\/)/).map((b) => b.trim().replaceAll(/\n\s*\n+/g, '\n\n'));
};

export const getHwImageArray = async () => {
	const url = `https://docs.google.com/document/d/${DOCUMENT_ID}/export?format=html`;
	const text = await fetch(url).then((res) => res.text());
	const chunks = text.split(/(?=>\d+\/\d+)/).slice(1);

	return chunks.map((b) => [...b.matchAll(/src="(https:\/\/.+?)"/g)].map((match) => match[1]));
};

export const canvasFetch = <T>(route: string, options?: Parameters<typeof fetch>[1]): Promise<T> =>
	fetch(CANVAS_API_DOMAIN + route, {
		...options,
		headers: { Authorization: `Bearer ${CANVAS_API_TOKEN}` },
	}).then((res) => res.json());

export const compareCaseInsensitive = (str1: string, str2: string) =>
	str1.toLowerCase().includes(str2.toLowerCase());

export const ONENOTE_BUTTON_AR: APIActionRowComponent<APIMessageActionRowComponent> = {
	type: ComponentType.ActionRow,
	components: [
		{
			type: ComponentType.Button,
			style: ButtonStyle.Link,
			label: 'OneNote',
			url: ONENOTE_URL,
			emoji: {
				name: 'OneNote',
				id: '569891378276990987',
				animated: false,
			},
		},
	],
};
