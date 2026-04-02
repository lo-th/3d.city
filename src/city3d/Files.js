///https://wicg.github.io/file-system-access/#api-filesystemfilehandle-getfile


export class Files {

    //-----------------------------
    //  FILE TYPE
    //-----------------------------

    static autoTypes( type ) {

        let t = []

        switch( type ){
            case 'svg':
            t = [ { accept: { 'image/svg+xml': '.svg'} }, ]
            break;
            case 'wav':
            t = [ { accept: { 'audio/wav': '.wav'} }, ]
            break;
            case 'mp3':
            t = [ { accept: { 'audio/mpeg': '.mp3'} }, ]
            break;
            case 'mp4':
            t = [ { accept: { 'video/mp4': '.mp4'} }, ]
            break;
            case 'bin': case 'hex':
            t = [ { description: 'Binary Files', accept: { 'application/octet-stream': ['.bin', '.hex'] } }, ]
            break;
            case 'text':
            t = [ { description: 'Text Files', accept: { 'text/plain': ['.txt', '.text'], 'text/html': ['.html', '.htm'] } }, ]
            break;
            case 'json':
            t = [ { description: 'JSON Files', accept: { 'application/json': ['.json'] } }, ]//text/plain
            break;
            case 'js':
            t = [ { description: 'JavaScript Files', accept: { 'text/javascript': ['.js'] } }, ]
            break;
            case 'ktx2':
            t = [ { description: 'ktx2', accept: { 'image/ktx2': ['.ktx2'] } }, ]
            break;
            case 'image':
            t = [ { description: 'Images', accept: { 'image/*': ['.png', '.gif', '.jpeg', '.jpg', '.hdr', '.exr'] } }, ]
            break;
            case 'gif':
            t = [ { description: 'Images', accept: { 'image/*': ['.gif'] } }, ]
            break;
            case 'png':
            t = [ { description: 'Images', accept: { 'image/*': ['.png'] } }, ]
            break;
            case 'exr':
            t = [ { description: 'Images', accept: { 'image/exr': ['.exr'] } }, ]
            break;
            case 'hdr':
            t = [ { description: 'Images', accept: { 'image/hdr': ['.hdr'] } }, ]
            break;
            case 'jpg':
            t = [ { description: 'Images', accept: { 'image/*': ['.jpg', '.jpeg'] } }, ]
            break;
            case 'icon':
            t = [ { description: 'Icons', accept: { 'image/x-ico': ['.ico'] } }, ]
            break;
            case 'lut':
            t = [ { description: 'Lut', accept: { 'text/plain': ['.cube', '.3dl'] } }, ]
            break;

        }

        return t

    }


    //-----------------------------
    //  LOAD
    //-----------------------------

	static async load( o = {} ) {

        if (typeof window.showOpenFilePicker !== 'function') {
            window.showOpenFilePicker = Files.showOpenFilePickerPolyfill
        }

        try {

        	let type = o.type || ''

            const options = {
                excludeAcceptAllOption: type ? true : false,
                multiple: false,
                //startIn:'./assets'
            };

            options.types = Files.autoTypes( type )

            // create a new handle
            const handle = await window.showOpenFilePicker( options )
            const file = await handle[0].getFile()
            //let content = await file.text()

            if( !file ) return null

            let fname = file.name;
            let ftype = fname.substring( fname.lastIndexOf('.')+1, fname.length );
            let realType = ''

            const dataUrl = [ 'png', 'jpg', 'jpeg', 'mp4', 'webm', 'ogg', 'mp3' ];
            const dataBuf = [ 'sea', 'z', 'hex', 'bvh', 'BVH', 'glb', 'gltf', 'exr', 'ktx2', 'hdr' ];
            const reader = new FileReader();

            if(o.forceType === 'ArrayBuffer') {
                reader.readAsArrayBuffer( file );
                type = ''

            } else {
                if( dataUrl.indexOf( ftype ) !== -1 ) reader.readAsDataURL( file )
                else if( dataBuf.indexOf( ftype ) !== -1 ) reader.readAsArrayBuffer( file )
                else reader.readAsText( file )
            }

            
            reader.onload = function(e) {

                let content = e.target.result

                //console.log(type, files)

                switch(type){
                    case 'image':
                        let img = new Image();
                        img.onload = function() {
                            img.width = img.width;
                            img.height = img.height;
                            if( o.callback ) o.callback( img, fname, ftype, [img.width, img.height] )
                        }
                        img.src = content
                    break;
                    case 'json':
                        if( o.callback ) o.callback( JSON.parse( content ), fname, ftype )
                    break;
                    default:
                        
                        if( o.callback ) o.callback( content, fname, ftype )
                        
                        
                    break;
                }

            }

        } catch(e) {

            console.log(e)
            if( o.always && o.callback ) o.callback( null )

        }

    }

	static showOpenFilePickerPolyfill( options ) {
        return new Promise((resolve) => {
            const input = document.createElement("input");
            input.type = "file";
            input.multiple = options.multiple;
            input.accept = options.types
                .map((type) => type.accept)
                .flatMap((inst) => Object.keys(inst).flatMap((key) => inst[key]))
                .join(",");

            input.addEventListener("change", () => {
                resolve(
                    [...input.files].map((file) => {
                        return {
                            getFile: async () =>
                                new Promise((resolve) => {
                                    resolve(file);
                                }),
                        };
                    })
                );
            });

            input.click();
        })
    }


    //-----------------------------
    //  SAVE
    //-----------------------------

    static async save( o = {} ) {

        let usePoly = false;

        if (typeof window.showSaveFilePicker !== 'function') {
            window.showSaveFilePicker = Files.showSaveFilePickerPolyfill
            usePoly = true;
        }

        try {

            let type = o.type || ''

            const options = {
                suggestedName: o.name || 'hello',
                data: o.data || ''
            };

            options.types = Files.autoTypes( type )
            options.finalType = Object.keys( options.types[0].accept )[0]
            options.suggestedName += options.types[0].accept[options.finalType][0]


            // create a new handle
            const handle = await window.showSaveFilePicker( options );

            if( usePoly ) return

            // create a FileSystemWritableFileStream to write to
            const file = await handle.createWritable();

            let blob = new Blob([ options.data ], { type: options.finalType });

            // write our file
            await file.write(blob);

            // close the file and write the contents to disk.
            await file.close();

        } catch(e) {

            console.log(e);

        }

    }

    static showSaveFilePickerPolyfill( options ) {
        return new Promise((resolve) => {
            const a = document.createElement("a");
            a.download = options.suggestedName || "my-file.txt"
            let blob = new Blob([ options.data ], { type:options.finalType });
            a.href = URL.createObjectURL( blob )

            a.addEventListener("click", () => {
                resolve(
                    setTimeout( () => URL.revokeObjectURL(a.href), 1000 )
                )
            })
            a.click()
        })
    }


    //-----------------------------
    //  FOLDER not possible in poly
    //-----------------------------

    static async getFolder() {

        try {
    
            const handle = await window.showDirectoryPicker();
            const files = [];
            for await (const entry of handle.values()) {
                const file = await entry.getFile();
                files.push(file);
            }

            console.log(files)
            return files;

        } catch(e) {

            console.log(e);

        }
    
    }








    

}