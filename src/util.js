'use strict';

const isJson = string => {
	try {
		JSON.parse(string);
		return true;
	} catch {
		return false;
	}
};

module.exports = {isJson};
