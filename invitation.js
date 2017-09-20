const toRadians = (deg) => {
	return deg * (Math.PI/180);
}

const validateCoordinate = (coordinate) => {
	if ( typeof(coordinate) !=='object' ) {
		throw new Error(`Expected coordinate to be an object but found ${typeof(coordinate)}`);
	}

	if ( !coordinate.hasOwnProperty('lat') || !coordinate.hasOwnProperty('long') ) {
		throw new Error('coordinate should have keys "lat" and "long"');
	}
}

/* pass input in radians */
const getDistance = (p1, p2) => {
	validateCoordinate(p1);
	validateCoordinate(p2);

	const R = 6371;
	const dlong = Math.abs(p2.long - p1.long);
	const centralAngle = Math.acos( Math.sin(p1.lat) * Math.sin(p2.lat) + Math.cos(p1.lat) * Math.cos(p2.lat) * Math.cos(dlong) );
	const distance = R * centralAngle;
	return distance;
}

const getPartnersByDistance = (originCoordinates, maxDistance, partners) => {

	validateCoordinate(originCoordinates);

	const originCoordinatesRad = {
		lat: toRadians(originCoordinates.lat),
		long: toRadians(originCoordinates.long)
	};

	if ( typeof(maxDistance) !== "number" ) {
		throw new Error(`maxDistance should be of type "number" but found ${typeof(maxDistance)}`);
	}

	if ( !Array.isArray(partners) ) {
		throw new Error(`Expected partners to be an array but found ${typeof(partners)}`);
	}

	let matchingPartners = [];

	partners.forEach((partner) => {
		let addresses = [];
		if ( !partner.organization ) {
			throw new Error(`Expected partner.organization to be a string but found ${typeof(partner.office)}`);
		}

		if ( !Array.isArray(partner.offices) ) {
			throw new Error(`Expected partner.office to be an array but found ${typeof(partner.office)}`);
		}		

		partner.offices.forEach((office) => {
			if(office.coordinates) {
				const arrOfficeCoordinates = office.coordinates.split(',');
				const officeCoordinates = {
					lat: toRadians(arrOfficeCoordinates[0]),
					long: toRadians(arrOfficeCoordinates[1])
				};

				try {
					const distance = getDistance(originCoordinatesRad, officeCoordinates)
					
					if (distance <= maxDistance) {
						addresses.push({
							address: office.address,
							distance: distance
						});
					}
				} catch (e) {
					console.error('Caught Error', e);
				}
			}
		});
		
		if (addresses.length > 0) {
			matchingPartners.push({
				organization: partner.organization,
				addresses	
			});
		}
	});

	matchingPartners = matchingPartners.sort((a,b) => a.organization.localeCompare(b.organization) );
	return matchingPartners;
}

module.exports = {
	toRadians,
	getDistance,
	getPartnersByDistance
};