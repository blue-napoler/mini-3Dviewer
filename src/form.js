import { loadFunc } from "./index.js"

let dropZone = document.getElementById('drop-zone')
let fileInput = document.getElementById('file-input')

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
        if (allow_exts.indexOf(ext) == -1){
            return alert('only a GLB file is supported now')
        }
        if (files.length > 1) return alert('only a GLB file is permitted now')
        
        fileInput.files = files
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