import {
	ApplicationCommandOptionType,
	InteractionResponseType,
	RouteBases,
	type APIApplicationCommandInteractionDataBasicOption,
	type APIApplicationCommandInteractionDataOption,
	type APIApplicationCommandInteractionDataSubcommandOption,
	type APIInteractionResponse,
	type APIModalSubmission,
} from 'discord-api-types/v10';

export const mapFiles = <T>(context: __WebpackModuleApi.RequireContext) =>
	context.keys().map<T>((path) => context(path).command);

export const request = (route: string, method: string, body: FormData | unknown) => {
	const requestOptions =
		body instanceof FormData
			? { method, body }
			: {
					method,
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body),
			  };

	fetch(RouteBases.api + route, requestOptions);
};

export const deferUpdate = (): APIInteractionResponse => ({
	type: InteractionResponseType.DeferredMessageUpdate,
});

export const getOption = <
	T extends
		| string
		| number
		| boolean
		| APIApplicationCommandInteractionDataBasicOption[]
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
	return text.split(/(?:^|\n)(?=\d+\/)/).map((b) => b.trim());
};

export const getHwImageArray = async () => {
	const url = `https://docs.google.com/document/d/${DOCUMENT_ID}/export?format=html`;
	const text = await fetch(url).then((res) => res.text());
	const chunks = text.split(/(?=>\d+\/\d+)/).slice(1);

	return chunks.map((b) => [...b.matchAll(/src="(https:\/\/.+?)"/g)].map((match) => match[1]));
};
