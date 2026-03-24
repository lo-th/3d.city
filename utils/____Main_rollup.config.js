import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

/*export default [
	{
		input: 'src/Uil.js',
		plugins: [
			buble( {
				transforms: {
					arrow: false,
					classes: true
				}
			} )
		],
		output: [
			{
				format: 'umd',
				name: 'UIL',
				file: 'build/uil.js',
				indent: '\t'
			}
		]
	},
	{
		input: 'src/Uil.js',
		plugins: [
		],
		output: [
			{
				format: 'esm',
				file: 'build/uil.module.js',
				indent: '\t'
			}
		]
	}
];*/

function babelCleanup() {

	const doubleSpaces = / {2}/g;

	return {

		transform( code ) {

			code = code.replace( doubleSpaces, '\t' );

			return {
				code: code,
				map: null
			};

		}

	};

}


function header() {

	return {

		renderChunk( code ) {

			return `/**
 * @license
 * Copyright 2010-2022 3d.City.js Authors
 * SPDX-License-Identifier: MIT
 */
${ code }`;

		}

	};

}



const babelrc = {
	presets: [
		[
			'@babel/preset-env',
			{
				modules: false,
				// the supported browsers of the three.js browser bundle
				// https://browsersl.ist/?q=%3E0.3%25%2C+not+dead
				targets: '>1%',
				loose: true,
				bugfixes: true,
			}
		]
	],
	plugins: [
	    [
	        "@babel/plugin-proposal-class-properties",
	        {
	        	"loose": true
	        }
	    ]
	]
};

export default [
    {
		input: 'src/Main.js',
		plugins: [
			header()
		],
		output: [
			{
				format: 'esm',
				file: 'build/MainGame.module.js'
			}
		]
	}
	
];