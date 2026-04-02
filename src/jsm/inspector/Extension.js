import { Tab } from './ui/Tab.js';

export class Extension extends Tab {

	constructor( name, options = {} ) {

		super( name, options );

		this.isExtension = true;

	}

}
