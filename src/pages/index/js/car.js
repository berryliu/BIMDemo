// 加载成功回调函数
import {loadObj, setTransform} from '../../../tools/utils';

var CAROBJECT = null;
const CARDATAMAP = {}

export const addCar = (carId, position, scale, rotation) => {
  return fetchCarData(carId)
    .then(carData => {
      CARDATAMAP[ carData.id ] = carData
    })
    .then(_ => renderCar(carId, position, scale, rotation))
}

export const renderCar = (id, position, scale, rotation) => {
  return Promise.resolve()
    .then(_ => {
      if (CAROBJECT) {
        return CAROBJECT.clone()
      }
      initCarMenuEvents()
      let objUrl = 'https://static.bimface.com/attach/6db9d5bcf88640f997b23be61e870ee8_%E6%B1%BD%E8%BD%A6.3DS';
      return loadObj(objUrl)
        .then(object => {
          CAROBJECT = object
          return object
        })
    }).then(object => {
      var line = createLine()
      window.viewer3D.addExternalObject('line', line)
      window.viewer3D.addExternalObject(id, object)
      setTransform(id, position, scale, rotation)
      window.viewer3D.render()
    })
}

export const fetchCarData = (carId) => {
  return Promise.resolve({
    id: carId,
    status: "unlock"
  })
}

function initCarMenuEvents () {
  viewer3D.addEventListener(Glodon.Bimface.Viewer.Viewer3DEvent.ContextMenu, function (objectData) {
    addContextMenu(objectData)
  });
}

const menuTemplate =
  `<div class="bf-sub-menu" id="car">
    <div class="bf-menu">
      <div class="bf-menu-item user-item lock">停机</div>
      <div class="bf-menu-item user-item unlock">开机</div>
      <div class="bf-menu-item user-item run">运行</div>
    </div>
    <div class="bf-menu-item user-item">车辆状态</div>
   </div>
  `

function addContextMenu (objectData) {
  let carId = objectData.objectId
  let carData = CARDATAMAP[ carId ]
  let $menu = $(menuTemplate)

  if (CARDATAMAP[ carId ]) {
    if (carData.status === "lock") {  // 停机
      $menu.find(".lock").addClass("bf-disabled")
      $menu.find(".run").addClass("bf-disabled")

      $("body").on("click.car", '.unlock', function () {
        if (carData.status !== "lock") {
          return
        }
        carData.status = "unlock"
        app.getViewer().restoreComponentsColorById([carId]);
        app.getViewer().render();
        $('.bf-menu.bf-menu-right').hide();
      });
    }
    if (carData.status === "unlock") { // 开机
      $menu.find(".unlock").addClass("bf-disabled")
      $("body").on("click.car", '.lock', function () {
        if (carData.status !== "unlock") {
          return
        }
        carData.status = "lock"
        let lockColor = new Glodon.Web.Graphics.Color(128, 0, 0, 1);
        app.getViewer().overrideComponentsColorById([carId], lockColor);
        app.getViewer().render();
        $('.bf-menu.bf-menu-right').hide();
      });
      $("body").on("click.car", '.run', function () {
        if (carData.status !== "unlock") {
          return
        }
        carData.status = "run"
        animation(carId)
        $('.bf-menu.bf-menu-right').hide();
      });
    }
    if (carData.status === "run") { // 运行
      $menu.find(".run").addClass("bf-disabled")
      $menu.find(".unlock").addClass("bf-disabled")
      $("body").on("click.car", '.lock', function () {
        if (carData.status !== "run") {
          return
        }
        cancelAnimationFrame(carData.animationId)
        setTransform(carId, new THREE.Vector3(-18000, 12000, 0), null, new THREE.Vector3(0, 0, 0))
        carData.status = "lock"
        let lockColor = new Glodon.Web.Graphics.Color(128, 0, 0, 1);
        app.getViewer().overrideComponentsColorById([carId], lockColor);
        app.getViewer().render();
        $('.bf-menu.bf-menu-right').hide();
      });
    }

    if ($('.bf-menu.bf-menu-right')[ 0 ]) {
      $('.bf-menu.bf-menu-right').append($menu);
    } else {
      $('.bf-menu.bf-menu-left').append($menu);
    }
  }
}

function createLine () {
  var geo = new THREE.Geometry()
  geo.vertices.push(new THREE.Vector3(-18000, 12000, 0))
  geo.vertices.push(new THREE.Vector3(-18000, 0, 0))
  geo.vertices.push(new THREE.Vector3(-18000, -16000, 0))
  var meterial = new THREE.LineBasicMaterial({ color: 0x32D3A6 })
  return new THREE.Line(geo, meterial)
}

function animation (carId) {
  const step = 0.001
  const path = createCurve()
  let pos = 0
  let position
  let direction = 'forward'

  function animate () {
    let animationId = requestAnimationFrame(animate)
    CARDATAMAP[ carId ].animationId = animationId
    if (pos <= 0) {
      pos = 0
      direction = 'forward'
    }
    if (pos >= 1) {
      pos = 1
      direction = 'back'

    }
    if (direction === 'forward') {
      pos += step
    } else {
      pos -= step
    }
    position = path.getPointAt(pos)
    if (direction === 'forward') {
      setTransform(carId, position, null, new THREE.Vector3(0, 0, 0))
    } else {
      setTransform(carId, position, null, new THREE.Vector3(0, 0, Math.PI))
    }
  }

  animate()
}

function createCurve () {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(-18000, 12000, 0),
    new THREE.Vector3(-18000, 0, 0),
    new THREE.Vector3(-18000, -16000, 0)
  ])
}

