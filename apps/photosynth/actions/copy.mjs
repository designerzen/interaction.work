/**
 * Copy files to dist/ and dist-electron/ from static/
 * 
 * NB. There is already a Parcel Plugin that handles
 * copying from static/ to dist/ so this is more for server
 * specific stuff such as downloading API data, copying
 * files from 
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, lstatSync, copyFileSync, constants } from 'node:fs'
import * as path from 'path'

const PATH_PUBLIC_FOLDER = './public'

const copyFolderSync = (from, to, overwrite=false ) => {

	if (existsSync(to))
	{ 
		console.log("Copying Folder directly", from, "to", to )
	}else{
		console.log("Creating destination Folder first", to )
		mkdirSync( to,  { recursive: true } )   
	}

	readdirSync(from).forEach(element => {
		if (lstatSync(path.join(from, element)).isFile()) {

			// FILES!

			// ensure that the destination folders are craeted

			//console.log("Copying File...", path.join(from, element), path.join(to, element) )
			try{
				copyFileSync(path.join(from, element), path.join(to, element), overwrite ? constants.COPYFILE_FICLONE_FORCE : constants.COPYFILE_EXCL)
				console.info("Copied ", from, to, element )
			}catch(error){
				console.info("Skipped ", from, element )
			}
			
		} else {
			copyFolderSync(path.join(from, element), path.join(to, element))
		}
	})
}
  
// copy Tensflow static wasm files and WAM files from node_modules into
// the public/ folder... this is because there is no way to specify the hash name
// in the google library - only the domain to load from!

// No longer has WASM backend due to conflicts
// copyFolderSync('./node_modules/@tensorflow/tfjs-backend-wasm/dist', PATH_PUBLIC_FOLDER + '/tf') 

copyFolderSync('./node_modules/@mediapipe/face_mesh/', PATH_PUBLIC_FOLDER + '/@mediapipe/face_mesh/') 

// POSE IS 26MB! Larger than the cloudflare limit of 25MB!
// copyFolderSync('./node_modules/@mediapipe/pose/', PATH_PUBLIC_FOLDER + '/@mediapipe/pose/') 

copyFolderSync('./node_modules/@mediapipe/tasks-vision/', PATH_PUBLIC_FOLDER + '/@mediapipe/tasks-vision/') 
// copyFolderSync('./node_modules/@mediapipe/', PATH_PUBLIC_FOLDER + '/@mediapipe/', true ) 
// copyFolderSync('./node_modules/@mediapipe/', PATH_PUBLIC_FOLDER + '/@mediapipe/', true ) 

// WebGPU tasks
copyFolderSync('./node_modules/@litertjs/core/wasm/', PATH_PUBLIC_FOLDER + '/@litertjs/'  ) 

// handled by static-copy-plugin
// copyFolderSync(PATH_PUBLIC_FOLDER + '/', './dist/') 
// copyFolderSync(PATH_PUBLIC_FOLDER + '/', './dist-electron/main/') 