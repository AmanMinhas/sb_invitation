
const deepClone = (data) => {
	let response;

	const typeOfData = typeof(data);
	const arrTypes = ['string', 'boolean', 'number'];
	if (!data || arrTypes.indexOf(typeOfData) !== -1) { // Handles string, number, bool, null, undefined
		return data;
	}

	// Handle array and object
	if ( Array.isArray(data) || typeOfData === "object" ) {
		response = Array.isArray(data) ? [] : {};
		for ( let key in data ) {
			response[key] = deepClone(data[key]);
		}
	}

	if ( typeOfData == 'function' ) {
		let f = function() {
			return data.apply(this, arguments);
		}

		for( let key in data ) {
			f[key] = deepClone(data[key]);
		}

		response = f;
	}
	return response;
}

module.exports = deepClone;
