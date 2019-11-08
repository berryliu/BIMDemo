import * as dat from 'dat.gui'
import {loadScript, setTransform} from '../../../tools/utils';

var FIREOBJECT = null;
const FIREDATAMAP = {}

export const addFire = (fireID, position, scale, rotation) => {
  FIREDATAMAP[ fireID ] = { id: fireID }
  return renderFire(fireID, position, scale, rotation)
}

export const renderFire = (id, position, scale, rotation) => {
  return Promise.resolve()
    .then(_ => {
      if (FIREOBJECT) {
        return Promise.resolve(FIREOBJECT.clone())
      }
      let scriptUrl = 'https://static.bimface.com/attach/cd1ad412b4894fe29622c7cdd64e101d_Fire.js'
      return loadScript(scriptUrl)
        .then(object => {
          let plane = new THREE.PlaneBufferGeometry(9000, 9000)
          let fire = new THREE.Fire(plane, {
            texttureWidth: 500,
            texttureHeight: 500,
            debug: false
          })
          setFireParams(fire)
          FIREOBJECT = fire
          return fire
        })
    })
    .then(object => {
      window.viewer3D.addExternalObject(id, object, true)
      setTransform(id, position, scale, rotation)
      let controlPosition = function () {
        this.x = 0
        this.y = 0
        this.z = 0
      }
      let gui = new dat.GUI()
      let controls = new controlPosition()
      gui.add(controls, 'x', -20000, 20000)
      gui.add(controls, 'y', -20000, 20000)
      gui.add(controls, 'z', -20000, 20000)
      gui.open()

      animation()

      function animation () {
        requestAnimationFrame(animation)
        let cameraPosition = window.viewer3D.getCameraStatus().position
        object.lookAt(cameraPosition)
        object.updateMatrixWorld()
        setTransform(id, new THREE.Vector3(controls.x, controls.y, controls.z))
        window.viewer3D.render()
      }
    })
}

function initControl (id) {
}

function setFireParams (fire) {
  fire.color1.set(0xffffff);//火中心颜色
  fire.color2.set(0xffa000);//火焰颜色
  fire.color3.set(0x000000);//烟颜色
  fire.windX = 0.0;
  fire.windY = 0.75;
  fire.colorBias = 0.8;//色偏
  fire.burnRate = 1.2;//火焰燃烧程度
  fire.diffuse = 5.0;//火焰弥漫程度
  fire.viscosity = 0.25;
  fire.expansion = -0;
  fire.swirl = 35;
  fire.drag = 0.1;
  fire.airSpeed = 8.0;
  fire.speed = 400.0;
  fire.massConservation = false;
  fire.clearSources();
  fire.addSource(0.5, 0.1, 0.1, 1.0, 0.0, 1.0);
  //调整参数效果可以参考这个链接（https://threejs.org/examples/?q=fire#webgl_fire）
  fire.up = new THREE.Vector3(0, 0, 1);
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
  let carData = FIREDATAMAP[ carId ]
  let $menu = $(menuTemplate)

  if (FIREDATAMAP[ carId ]) {
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


