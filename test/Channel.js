const assert = require('assert');

const redis = require('../lib/redis');
const Channel = require('../lib/Channel');

describe('Channel', () => {
	before(async () => {
		const keys = await redis.keys('test:*');

		if(keys.length >= 1)
			await redis.del(...keys);
	});

	let channel;

	it('should be retrievable after saving', async () => {
		channel = new Channel('test', 'general');

		await channel.save();

		const retrievedChannel = await Channel.get('test', channel.id);
		delete retrievedChannel.messages;

		assert.deepEqual(channel, retrievedChannel);
	});

	it('should be findable', async () => {
		const retrievedChannels = await Channel.find('test');
		delete retrievedChannels[0].messages;

		assert.deepEqual(retrievedChannels, [ channel ]);
	});

	it('should save all arbitrary keys', async () => {
		channel._arbitrary_key = 'hello!';
		await channel.save();

		const retrievedChannel = await Channel.get('test', channel.id);

		assert.strictEqual(retrievedChannel._arbitrary_key, 'hello!');
	});

	it('should destroy, leaving no extraneous keys', async () => {
		await channel.destroy();

		assert.deepEqual(await redis.keys('test:*'), [
			'test:channel-counter'
		]);
	});
});
