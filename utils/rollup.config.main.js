import terser from '@rollup/plugin-terser';
import MagicString from 'magic-string';

function header() {

	return {

		renderChunk( code ) {

			code = new MagicString( code );

			code.prepend( `/**
 * @license
 * Copyright 2010-2026 3d.city Authors
 * SPDX-License-Identifier: MIT
 */\n` );

			return {
				code: code.toString(),
				map: code.generateMap()
			};

		}

	};

}


export default [
	{
		input: {
			'MainGame.module.js' : 'src/Main.js'
		},
		plugins: [
			header(),
			terser()
		],
		preserveEntrySignatures: 'allow-extension',
		output: [
			{
				format: 'esm',
				dir: 'build',
				entryFileNames: '[name]'
			}
		]
	}
];