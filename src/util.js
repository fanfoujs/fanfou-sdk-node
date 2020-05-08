'use strict';

const isJson = string => {
	try {
		JSON.parse(string);
		return true;
	} catch (_) {
		return false;
	}
};

module.exports = {isJson};
