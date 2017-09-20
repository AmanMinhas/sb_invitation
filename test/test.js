const assert = require('assert');
const deepClone = require('../deepclone');
const {
	toRadians,
	getDistance,
	getPartnersByDistance
} = require('../invitation');

const defaultOriginCoordinates = {
	lat: 51.515419,
	long: -0.141099
};
const defaultMaxDistance = 100;
const defaultPartners = [
	{
		"organization": "Balance at Work",
		"offices": [
			{
				"address": "Suite 1308, 109 Pitt St \nSydney 2000",
				"coordinates": "-33.8934219,151.20404600000006"
			}
		]
	},
	{
		"organization": "Spring Development",
		"offices": [
			{
				"address": "Banbury, Oxfordshire",
				"coordinates": "52.0629009,-1.3397750000000315"
			}
		]
	},
	{
		"organization": "Blue Square 360",
		"offices": [
			{
				"address": "Ocean Financial Centre, Level 40, 10 Collyer Quay, Singapore, 049315",
				"coordinates": "1.28304,103.85199319999992"
			},
			{
				"address": "St Saviours Wharf, London SE1 2BE",
				"coordinates": "51.5014767,-0.0713608999999451"
			}
		]
	},
]

console.log('defaultOriginCoordinates ',defaultOriginCoordinates);

describe('#deepClone()', () => {

	it('it should clone string', () => {
		const input = 'Some string';
		const output = deepClone(input);
		assert.equal(input, output);
	})

	it('it should clone bool', () => {
		const input = [ true, false ];
		let output;
		input.forEach((boolInput) => {
			output = deepClone(boolInput);
			assert.equal(boolInput, output);
		})
	})

	it('it should clone number', () => {
		const input = 1.2;
		const output = deepClone(input);
		assert.equal(input, output);
	})

	it('it should clone null', () => {
		const input = null;
		const output = deepClone(input);
		assert.equal(input, output);
	})

	it('it should clone arrays', () => {
		const input = [1,2,3];
		const output = deepClone(input);
		assert.deepEqual(input, output);
		assert.equal(input === output, false); // Ensure both are not pointing to the same memory location.
	})

	it('it should clone nested arrays', () => {
		const input = [ [1,2], 3 ];
		const output = deepClone(input);
		assert.deepEqual(input, output);
		assert.equal(input[0] === output[0], false); // Ensure both are not pointing to the same memory location.
	})

	it('it should clone objects', () => {
		const input = {a: 1, b: 2};
		const output = deepClone(input);
		assert.deepEqual(input, output);
		assert.equal(input === output, false); // Ensure both are not pointing to the same memory location.
	})

	it('it should clone nested objects', () => {
		const input = { a: 1, b: { a: 1, b: 2}};
		const output = deepClone(input);
		assert.deepEqual(input, output);
		assert.equal(input.b === output.b, false); // Ensure both are not pointing to the same memory location.
	})

	it('it should clone methods', () => {
		const input = () => {};
		const output = deepClone(input);
		assert.equal(input === output, false);
	})
});

describe('Invitation', () => {
	describe('#toRadians()', () => {
		it('it converts degs to radians correctly', () => {
			const input = 10;
			const expectedOutput = 0.17453292519943295;
			const output = toRadians(input);
			assert.equal(output, expectedOutput);
		})
	})

	describe('#getDistance()', () => {

		context('when p1 or p2 is not an object', () => {
			it('it should throw an error', () => {
				assert.throws(() => getDistance('',''), Error);
			})
		})

		context('when p1 or p2 do not have keys lat and long', () => {
			it('it should throw an error', () => {
				assert.throws(() => getDistance({},{}), Error);
			})
		})

		it('it should return correct distance between two points', () => {
			const originCoordinates = {
				lat: toRadians(51.515419),
				long: toRadians(-0.141099)
			};

			const destinationCoordinates = {
				lat: toRadians(52.0629009),
				long: toRadians(-1.3397750000000315)
			};

			const expectedDistance = 102.48330298950076;
			const distance = getDistance(originCoordinates, destinationCoordinates);

			assert.equal(distance, expectedDistance);
		})

	})

	describe('#getPartnersByDistance()', () => {
		context('when originCoordinates is not on object', () => {
			it ('it should throw an error', () => {
				assert.throws(() => getPartnersByDistance('', defaultMaxDistance, defaultPartners), Error);
			})
		})

		context('when originCoordinates does not have keys "lat" or "long"', () => {
			it ('it should throw an error', () => {
				assert.throws(() => getPartnersByDistance({}, defaultMaxDistance, defaultPartners), Error);
			})
		})

		context('when maxDistance is not a number', () => {
			it ('it should throw an error', () => {
				assert.throws(() => getPartnersByDistance(defaultOriginCoordinates, '', defaultPartners), Error);
			})
		})

		context('when partners is not an array', () => {
			it ('it should throw an error', () => {
				assert.throws(() => getPartnersByDistance(defaultOriginCoordinates, defaultMaxDistance, ''), Error);
			})
		})

		context('when partner object does not have organization key', () => {
			it ('it should throw an error', () => {
				const partners = [ { office: [] } ];
				assert.throws(() => getPartnersByDistance(defaultOriginCoordinates, defaultMaxDistance, partners), Error);
			})
		})

		context('when partner object does not have offices array', () => {
			it ('it should throw an error', () => {
				const partners = [ { organization: 'Test organization' } ];
				assert.throws(() => getPartnersByDistance(defaultOriginCoordinates, defaultMaxDistance, partners), Error);
			})
		})

		it('it should return an array', () => {
			assert.equal( Array.isArray(getPartnersByDistance(defaultOriginCoordinates, defaultMaxDistance, defaultPartners)), true);
		})

		it('it should return partners within a given distance', () => {
			const originCoordinates = { lat: 51.515419, long: -0.141099 };
			const distance = 100;
			const partners = [
				{
					"organization": "Blue Square 360",
					"offices": [
						{
							"address": "St Saviours Wharf, London SE1 2BE",
							"coordinates": "51.515419,-0.141099"
						}
					]
				}
			];

			const matchedPartners = getPartnersByDistance(originCoordinates, distance, partners);
			assert.equal(matchedPartners.length, 1);
			assert.equal(matchedPartners[0].organization, partners[0].organization);
		})

		it('it should ignore partners not within the given distance', () => {
			const distance = 100;
			const partners = [
				{
					"organization": "Balance at Work",
					"offices": [
						{
							"address": "Suite 1308, 109 Pitt St \nSydney 2000",
							"coordinates": "-33.8934219,151.20404600000006"
						}
					]
				},
			];

			console.log('defaultOriginCoordinates, distance, partners ', defaultOriginCoordinates, distance, partners);
			const matchedPartners = getPartnersByDistance(defaultOriginCoordinates, distance, partners);
			assert.equal(matchedPartners.length, 0);
		})
	})
});
