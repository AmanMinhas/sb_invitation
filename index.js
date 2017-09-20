const deepClone = require('./deepclone');
const { getPartnersByDistance } = require('./invitation');
const partners = require('./partners.js');

const dcInput = {name: "Paddy", address: {town: "Lerum", country: "Sweden"}};
console.log('Deep Clone Input', dcInput);
const dcOutput = deepClone(dcInput);
console.log('Deep Clone Output', dcOutput);

console.log();
console.log('****************');
console.log();

const originCoordinates = {
	lat: 51.515419,
	long: -0.141099
};
const maxDistance = 100;
const invitations = getPartnersByDistance( originCoordinates, maxDistance, partners);

console.log('Invitations Count ', invitations.length);
invitations.forEach((invitation) => {
	console.log();
	console.log('Organization : ', invitation.organization);
	invitation.addresses.forEach((address) => {
		console.log('Address : ', address.address);
		console.log('Distance : ', address.distance, 'km');
	});
});
console.log();
