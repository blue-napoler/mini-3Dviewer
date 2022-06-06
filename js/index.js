import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js'


import Stats from 'three/examples/jsm/libs/stats.module.js'
import { GUI } from 'dat.gui/build/dat.gui.module.js'

import { PROPERTY,BLOOM,FILM } from './statsProperty.js' 


const W_WIDTH  = window.innerWidth 
const W_HEIGHT = window.innerHeight
const W_ASPECT = window.innerWidth / window.innerHeight
const W_RATIO  = window.devicePixelRatio
let ambLight, dirLight
let camera, scene, renderer, composer, renderPass, glitchPass, bloomPass, filmPass, process2Instance, process3Instance, controls, object, dangerFlag = false, gui
const stats = new Stats()


const loadFunc = (file)=>{
	gui = new GUI()

	scene = new THREE.Scene()
	THREE.ColorManagement.legacyMode = false
	
	camera = new THREE.PerspectiveCamera(60, W_ASPECT, 0.01, 1000)
	scene.add(camera)

	let div = document.querySelector('#appCanvas')
	renderer = new THREE.WebGLRenderer({canvas: div,alpha:true})
	renderer.setPixelRatio(W_RATIO)
	renderer.setSize(W_WIDTH, W_HEIGHT)
	renderer.setClearColor(0x000000, 0)

	renderer.outputEncoding = THREE.sRGBEncoding
	//renderer.toneMapping = THREE.ACESFilmicToneMapping
	renderer.physicallyCorrectLights = true
	renderer.shadowMap.enabled = true

	controls = new OrbitControls(camera, div)
	controls.autoRotate = false
	//controls.enableDamping = true

	composer = new EffectComposer( renderer )

	const hemiLight = new THREE.HemisphereLight()
	scene.add(hemiLight)

	dirLight = new THREE.DirectionalLight(0xffffff,2)
	dirLight.position.set(0.5,0,0.866)
	dirLight.castShadow = true
	scene.add(dirLight)

	ambLight = new THREE.AmbientLight(0xaaaaaa,2)
	scene.add(ambLight)

	showStats()
	setParameters()
	animate()

	
   const loader = new GLTFLoader()
   loader.load(
    file,
    function ( gltf ) {

		let text = document.getElementById("text")
		text.remove()
		let list_element = document.getElementsByClassName("sk-swing")
		list_element[0].remove()
		
		object = gltf.scene || gltf.scenes[0]
		object.position.set(0, 0, 0)
	
		object.receiveShadow = true
		object.castShadow = true
		
		setContent()
		scene.add( object ) 

    },
    function ( xhr ) {

		//add loading icon
		let circle = document.getElementsByClassName("sk-swing")

		let d1 = document.createElement("div")
		let d2 = document.createElement("div")

		d1.className = "sk-swing-dot"
		d2.className = "sk-swing-dot"

		circle[0].appendChild(d1)
		circle[0].appendChild(d2)

		//add loading text
		let list_e = document.getElementById("text")
		list_e.textContent = (( xhr.loaded / xhr.total * 100 ) + '%' )
		
		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' )
  
    },
    function ( error ) {
		
		console.log( 'An error happened' )
    })

	
}

const animate = () => {
	stats.begin()
	
	renderer.render(scene, camera)
	stats.end()
	requestAnimationFrame(animate)

	composer.render()
}


const setGlitch = () => {
	if(composer.passes.length == 0){
		renderPass = new RenderPass( scene, camera )
        composer.addPass( renderPass )
		
	}
	glitchPass = new GlitchPass()
	composer.addPass( glitchPass )
	dangerFlag = true
}

const deleteGlitch = () => {
	composer.removePass( glitchPass )
	dangerFlag = false
}

const setBloom = () => {
	if(composer.passes.length == 0){
		renderPass = new RenderPass( scene, camera )
        composer.addPass( renderPass )
		
	}
	bloomPass = new UnrealBloomPass( new THREE.Vector2(W_WIDTH , W_HEIGHT),1.5,0.4,0.75)
	composer.addPass( bloomPass  )
	bloomPass.threshold = BLOOM.bloomThreshold.bloomThreshold
	bloomPass.strength = BLOOM.bloomStrength.bloomStrength
	bloomPass.radius = BLOOM.radius.radius
}

const deleteBloom = () => {
	composer.removePass( bloomPass  )
}

const addBloomParameters = () =>{
	const exposure = BLOOM.exposure
	const stregth = BLOOM.bloomStrength 
	const threshold = BLOOM.bloomThreshold 
	const radius = BLOOM.radius 

	process2Instance = gui.addFolder('bloomFilter')

	const resoInfo = process2Instance.add(exposure,'exposure',0.1,2)
	resoInfo.onChange(function(value){
		if (bloomPass != null){	
			renderer.toneMappingExposure = Math.pow( value, 4.0 )
		}
	})
	if(dangerFlag == false){
		const strengthInfo = process2Instance.add(stregth,'bloomStrength',0.0,3.0)
		strengthInfo.onChange(function(value){
			if (bloomPass != null){	
				bloomPass.strength = Number(value)
			}
		})
	}else{
		const strengthInfo = process2Instance.add(stregth,'bloomStrength',0.0,0.3)
		strengthInfo.onChange(function(value){
			if (bloomPass != null){	
				bloomPass.strength = Number(value)
			}
		})
    }
	const threInfo = process2Instance.add(threshold,'bloomThreshold',0.0,1.0)
	threInfo.onChange(function(value){
		if (bloomPass != null){	
			bloomPass.threshold = Number(value)
		}
	})
	const radiInfo = process2Instance.add(radius,'radius',0.0,1.0,0.01)
	radiInfo.onChange(function(value){
		if (bloomPass != null){	
			bloomPass.radius= Number(value)
		}
	})
}
const deleteBloomParameters = () =>{
	gui.removeFolder(process2Instance)
}


const setFilm = () => {
	if(composer.passes.length == 0){
		renderPass = new RenderPass( scene, camera )
        composer.addPass( renderPass )
	}
	filmPass = new FilmPass(0.4,0.4,256,false)
	composer.addPass( filmPass )
	filmPass.noiseIntensity = FILM.noiseIntensity.noiseIntensity
	filmPass.scanlinesCount = FILM.scanlinesCount.scanlinesCount
	filmPass.scanlinesIntensity = FILM.scanlinesIntensity.scanlinesIntensity
	filmPass.grayscale = FILM.grayscale.grayscale
}

const deleteFilm = () => {
	composer.removePass( filmPass  )
}

const addFilmParameters = () =>{
	const noiseIntensity = FILM.noiseIntensity
	const scanlinesIntensity = FILM.scanlinesIntensity
	const scanlinesCount = FILM.scanlinesCount
	const grayscale = FILM.grayscale

	process3Instance = gui.addFolder('filmFilter')
	
	const noiseInfo = process3Instance.add(noiseIntensity,'noiseIntensity',0.0,1.0)
	noiseInfo.onChange(function(value){
		if (filmPass != null){	
			filmPass.uniforms.nIntensity.value = Number(value)
		}
	})
	const scanIntensityInfo = process3Instance.add(scanlinesIntensity,'scanlinesIntensity',0.0,1.0)
	scanIntensityInfo.onChange(function(value){
		if (filmPass != null){
			filmPass.uniforms.sIntensity.value  = Number(value)
		}
	})
	const scanCountInfo = process3Instance.add(scanlinesCount,'scanlinesCount',0,4096)
	scanCountInfo.onChange(function(value){
		if (filmPass != null){
			filmPass.uniforms.sCount.value  = Number(value)
		}
	})
	const grayInfo = process3Instance.add(grayscale,'grayscale')
	grayInfo.onChange(function(value){
		if (filmPass != null){
			filmPass.uniforms.grayscale.value = value
		}
	})
}

const deleteFilmParameters = () =>{
	gui.removeFolder(process3Instance)
}


const setParameters = () => {
	const ambIntensity = PROPERTY.ambIntensity
    const ambColor = PROPERTY.ambColor
	const dirIntensity = PROPERTY.dirIntensity
	const dirColor = PROPERTY.dirColor
	const glitchFilter = PROPERTY.glitchFilter
	const bloomFilter = PROPERTY.bloomFilter
	const filmFilter = PROPERTY.filmFilter
	
	const param1 = gui.add(ambIntensity,'ambientLightIntensity',0,3,0.1)
	param1.onChange(function(e){
		ambLight.intensity = parseFloat(param1.getValue())
	})
	
	const param2 = gui.addColor(ambColor,'ambientLightColor')
	param2.onChange(function(e){
		ambLight.color.set(param2.getValue())
	})

	const param3 = gui.add(dirIntensity,'directionalLightIntensity',0,5,0.5)
	param3.onChange(function(e){
		dirLight.intensity = parseFloat(param3.getValue())
	})
	
	const param4 = gui.addColor(dirColor,'directionalLightColor')
	param4.onChange(function(e){
		dirLight.color.set(param4.getValue())
	})

	const param5 = gui.add(glitchFilter,'glitchFilter')
	param5.onChange(function(e){
		if (param5.getValue() == true){
			setGlitch()
		}
		else{
			deleteGlitch()
		}	
	})
	const param6 = gui.add(bloomFilter,'bloomFilter')
	param6.onChange(function(e){
		if (param6.getValue() == true){
			setBloom()
			addBloomParameters()
		}
		else{
			deleteBloom()
			deleteBloomParameters()
		}	
	})
	const param7 = gui.add(filmFilter,'filmFilter')
	param7.onChange(function(e){
		if (param7.getValue() == true){
			setFilm()
			addFilmParameters()
		}
		else{
			deleteFilm()
			deleteFilmParameters()		
		}	
	})
}
  

const setContent = () =>{
	const box = new THREE.Box3().setFromObject(object)
    const size = box.getSize(new THREE.Vector3()).length()
    const center = box.getCenter(new THREE.Vector3())

	controls.reset()

	object.position.x += (object.position.x - center.x)
    object.position.y += (object.position.y - center.y)
    object.position.z += (object.position.z - center.z)

	controls.maxDistance = size * 10
    camera.near = size / 100
    camera.far = size * 100
    camera.updateProjectionMatrix()

	camera.position.copy(center)

   // camera.position.x += size / 2.0
    camera.position.y += size / 5.0
    camera.position.z += (size / 2.0)*1.25
	camera.lookAt(center)


	controls.saveState()
}

const showStats = () => {
	stats.showPanel(0)
	Object.assign(stats.dom.style, {
		'position': 'fixed',
		'height': 'max-content',
		'left': 'auto',
		'right': 0,
		'top': 'auto',
		'bottom': '0'
})
document.body.appendChild( stats.dom )
}

//For form below

let dropZone = document.getElementById('drop-zone')
//let fileInput = document.getElementById('file-input')

dropZone.addEventListener('dragover', function(e) {
    e.stopPropagation()
    e.preventDefault()
}, false)

dropZone.addEventListener('dragleave', function(e) {
    e.stopPropagation()
    e.preventDefault()
  }, false)

dropZone.addEventListener('drop', function(e) {
    let allow_exts = new Array('glb')

    try{ 
        e.stopPropagation()
        e.preventDefault()
        let files = e.dataTransfer.files 
        let ext = getExt(e.dataTransfer.files[0].name).toLowerCase()

		//validate
        if (allow_exts.indexOf(ext) == -1){
            return alert('only a GLB file is supported now')
        }
        if (files.length > 1) return alert('only a GLB file is permitted now')
		if(Number(files[0].size) > 104857600){
			return alert('file size is more than 100MB')
		}
        
        //fileInput.files = files
		
        let list_element = document.getElementById("f1")
        list_element.remove()
        let a_element = document.createElement('canvas')
        a_element.id = "appCanvas"
        let list_element2 = document.getElementById("parent-div")
        list_element2.appendChild(a_element)

        let url = URL.createObjectURL(files[0])
        loadFunc(url)
        URL.revokeObjectURL(url)
    }catch{
        return alert("error happend")
    }
}, false)


const getExt = (filename)=>{
	var pos = filename.lastIndexOf('.')
	if (pos === -1) return ''
	return filename.slice(pos + 1)
}