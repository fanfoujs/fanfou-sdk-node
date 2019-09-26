'use strict';

const isJson = str => {
	try {
		JSON.parse(str);
		return true;
	} catch (_) {
		return false;
	}
};

module.exports = {isJson};
