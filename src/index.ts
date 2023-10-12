import { type APIThreadChannel, Routes } from 'discord-api-types/v10';
import { createApplicationCommandHandler, type Command } from './http-interactions';
import { ONENOTE_BUTTON_AR, getHwAsArray, getHwImageArray, mapFiles, restApiRequest } from './util';

const commands = mapFiles<Command>(require.context('./cmds', true, /\.ts$/));

const applicationCommandHandler = createApplicationCommandHandler({
	applicationId: CLIENT_ID,
	applicationSecret: CLIENT_SECRET,
	publicKey: PUBLIC_KEY,
	commands,
});

addEventListener('fetch', (event) => {
	event.waitUntil(new Promise(() => null));
	event.respondWith(applicationCommandHandler(event.request));
});

addEventListener('scheduled', async (event) => {
	event.waitUntil(new Promise(() => null));

	const date = new Date(event.scheduledTime - 14400000);
	const mmdd =
		String(date.getMonth() + 1).padStart(2, '0') + '/' + String(date.getDate()).padStart(2, '0');

	const promises = await Promise.all([
		CACHE.get('edited_at'),
		CACHE.get('latest_post'),
		CACHE.get('content'),
		getHwAsArray(),
		getHwImageArray(),
	]);

	let lastEdited = new Date(promises[0]!).getTime();
	const [, latestPost, latestContent, texts, urls] = promises;

	const latest = texts[0];

	if (latest.match(/\d+\/\d+/)?.[0] !== mmdd) return;

	if (latestContent !== latest) {
		await Promise.all([CACHE.put('edited_at', date.toString()), CACHE.put('content', latest)]);
		lastEdited = date.getTime();
	}

	const elapsedTime = date.getTime() - lastEdited;
	if (360000 > elapsedTime || elapsedTime > 840000) return;

	const content =
		`<@&${ALL_ROLE_ID}> ` +
		latest +
		(urls[0].length ? '\n\n' + urls[0].map((url, i) => `[[IMG ${i + 1}]](${url})`).join(' ') : '');

	if (latestPost === mmdd) {
		const threads = await restApiRequest<APIThreadChannel[]>(
			Routes.channelThreads(FORUM_CHANNEL, 'public'),
			'GET'
		);

		const id = threads?.find((thread) => thread.name?.startsWith(mmdd))?.id;
		if (id) await restApiRequest(Routes.channelMessage(id, id), 'PATCH', { message: { content } });
	} else {
		await CACHE.put('latest_post', mmdd);
		const thread = await restApiRequest<APIThreadChannel>(Routes.threads(FORUM_CHANNEL), 'POST', {
			name: `${mmdd} Homework`,
			applied_tags: [HOMEWORK_FORUM_TAG],
			auto_archive_duration: 1440,
			message: {
				content,
				components: [ONENOTE_BUTTON_AR],
			},
		});

		if (thread) restApiRequest(Routes.channelPin(thread.id, thread.id), 'PUT');
	}
});
