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
		input: 'src/Main.js',
		plugins: [
			header()
		],
		preserveEntrySignatures: 'allow-extension',
		external: ['three'],
		output: [
			{
				format: 'esm',
				globals: {
		          three: 'THREE'
		        },
				file: 'build/MainGame.module.js',
				plugins: [terser()]
			}
		]
	}
];