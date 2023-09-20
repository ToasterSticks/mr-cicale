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

	const date = new Date(event.scheduledTime);
	const dd = String(date.getDate()).padStart(2, '0');
	const mm = String(date.getMonth() + 1).padStart(2, '0');
	const yy = String(date.getFullYear() % 100).padStart(2, '0');

	const [texts, urls] = await Promise.all([getHwAsArray(), getHwImageArray()]);

	if (texts[0].match(/\d+\/\d+/)?.[0] !== `${mm}/${dd}`) return;

	const content =
		'@everyone ' +
		texts[0] +
		'\n\n' +
		(urls[0].length ? urls[0].map((url, i) => `[[IMG ${i + 1}]](${url})`).join(' ') : '');

	restApiRequest(Routes.threads(FORUM_CHANNEL), 'POST', {
		name: `${mm}/${dd}/${yy} Homework`,
		applied_tags: ['1152408970577850408'],
		message: { content },
	});
});
