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

	const [texts, urls] = await Promise.all([getHwAsArray(), getHwImageArray()]);

	const content =
		texts[0] +
		'\n\n' +
		(urls[0].length ? urls[0].map((url, i) => `[[IMG ${i + 1}]](${url})`).join(' ') : '');

	const date = new Date(event.scheduledTime);
	const dd = String(date.getDate()).padStart(2, '0');
	const mm = String(date.getMonth() + 1).padStart(2, '0');
	const yy = String(date.getFullYear() % 100).padStart(2, '0');

	restApiRequest(Routes.threads(FORUM_CHANNEL), 'POST', {
		name: `${dd}/${mm}/${yy} Homework`,
		auto_archive_duration: 10080,
		applied_tags: ['1152408970577850408'],
		message: { content },
	});
});
