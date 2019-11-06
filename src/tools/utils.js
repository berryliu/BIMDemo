/* eslint-disable */

const OBJLOADERURL = 'https://static.bimface.com/attach/341bb8bde7bf4a5898ecdf58c2a476fb_TDSLoader.js'
var ISOBJLOADERLOADED = false

export const loadScript = (url) => {
  return new Promise(resolve => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url;
    document.head.appendChild(script);
    script.onload = () => resolve()
  })
}

export const loadObj = (url) => {
  var objLoaderPromise = ISOBJLOADERLOADED ? Promise.resolve() : loadScript(OBJLOADERURL)
    .then(_ => ISOBJLOADERLOADED = true)

  return objLoaderPromise.then(_ => {
    return new Promise(resolve => {
      var loader = new THREE.TDSLoader()
      loader.load(url, object => resolve(object))
    })
  })
}

export const setTransform = (name, pos, scale, rotation) => {
  const object = window.viewer3D.getExternalObjectByName(name)
  if (object) {
    if (pos) {
      object.position.x = pos.x
      object.position.y = pos.y
      object.position.z = pos.z
    }
    if (scale) {
      object.scale.x = scale.x
      object.scale.y = scale.y
      object.scale.z = scale.z
    }
    if (rotation) {
      object.rotation.x = rotation.x
      object.rotation.y = rotation.y
      object.rotation.z = rotation.z
    }
    object.updateMatrixWorld()
    window.viewer3D.render()
  }
}

