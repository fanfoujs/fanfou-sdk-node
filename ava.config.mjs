const ava = {
	typescript: {
		compile: false,
		rewritePaths: {
			'source/': 'distribution/',
			'test/': 'distribution/test/',
		},
	},
};

export default ava;
