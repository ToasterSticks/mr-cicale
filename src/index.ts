import { Routes } from 'discord-api-types/v10';
import { createApplicationCommandHandler, type Command } from './http-interactions';
import { getHwAsArray, getHwImageArray, mapFiles, restApiRequest } from './util';

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

	const date = new Date(event.scheduledTime - 14400000); // Subtract 4 hours for UTC → EST
	const dd = String(date.getDate()).padStart(2, '0');
	const mm = String(date.getMonth() + 1).padStart(2, '0');
	const yy = String(date.getFullYear() % 100).padStart(2, '0');

	const latestPost = (await CACHE.get('latest_post'))!;

	if (latestPost === `${mm}/${dd}/${yy}`) return;

	const [texts, urls] = await Promise.all([getHwAsArray(), getHwImageArray()]);
	const latest = texts[0];

	if (latest.match(/\d+\/\d+/)?.[0] !== `${mm}/${dd}`) return;

	if ((await CACHE.get('content')) !== latest)
		await Promise.all([CACHE.put('edited_at', date.toString()), CACHE.put('content', latest)]);

	const lastEdited = (await CACHE.get('edited_at'))!;

	if (date.getTime() - new Date(lastEdited).getTime() < 600000) return;

	CACHE.put('latest_post', `${mm}/${dd}/${yy}`);

	const content =
		`<@&${ALL_ROLE_ID}> ` +
		latest +
		'\n\n' +
		(urls[0].length ? urls[0].map((url, i) => `[[IMG ${i + 1}]](${url})`).join(' ') : '');

	restApiRequest(Routes.threads(FORUM_CHANNEL), 'POST', {
		name: `${mm}/${dd}/${yy} Homework`,
		applied_tags: [HOMEWORK_FORUM_TAG],
		auto_archive_duration: 1440,
		message: { content },
	});
});
