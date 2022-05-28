const PROPERTY = {
	ambIntensity:{
		'ambientLightIntensity' : 2
	},
	ambColor:{
		'ambientLightColor': 0xaaaaaa
	},
	dirIntensity:{
		'directionalLightIntensity' : 2
	},
	dirColor:{
		'directionalLightColor': 0xffffff
	},
	glitchFilter:{
		'glitchFilter': false
	},
	bloomFilter:{
		'bloomFilter': false
	},
	filmFilter:{
		'filmFilter': false
	}
}

const BLOOM = {
	exposure:{
		'exposure':1,
	},
	bloomStrength:
	{
		'bloomStrength':0.25
	},
	radius:{
		'radius':0
	},
	bloomThreshold:
	{
		'bloomThreshold':0.3
	}
}

const FILM = {
	noiseIntensity:{
		'noiseIntensity':0.5
	},
	scanlinesIntensity:
	{
		'scanlinesIntensity':0.5
	},
	scanlinesCount:{
		'scanlinesCount':2048
	},
	grayscale:
	{
		'grayscale':false
	}
}


export {PROPERTY,BLOOM,FILM}