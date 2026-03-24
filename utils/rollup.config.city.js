import terser from '@rollup/plugin-terser';
import MagicString from 'magic-string';

function header() {

	return {

		renderChunk( code ) {

			code = new MagicString( code );

			code.prepend( `/**
 * @license
 * Copyright 2010-2025 3d.city.js Authors
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
		input: 'src/micro/CityGame.js',
		plugins: [
			header()
		],
		preserveEntrySignatures: 'allow-extension',
		output: [
			{
				format: 'umd',
				name: 'city',
				file: 'build/citygame.min.js',
				plugins: [terser()]
			},
			{
				format: 'esm',
				file: 'build/citygame.module.js',
				plugins: [terser()]
			}
		]
	}
];