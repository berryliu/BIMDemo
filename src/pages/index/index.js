/* eslint-disable */
import '../../common/css/com.less';
import './index.less';

import {addCar} from './js/car'
import {addFire} from './js/fire'

const viewToken = 'ca7ee9cc63d94379859405953a3643f8';

export const ready = new Promise(resolve => {
  const loaderConfig = new BimfaceSDKLoaderConfig();
  loaderConfig.dataEnvType = BimfaceEnvOption.Local;
  loaderConfig.sdkPath = '../../jssdk';
  loaderConfig.path = '../../viewToken.json';
  BimfaceSDKLoader.load(loaderConfig, viewMetaData => resolve(viewMetaData), (err) => console.log(err));
}).then(successCallback)
  .then(initEvents)

function initEvents () {
  addCar('car-' + +new Date(), new THREE.Vector3(-18000, 12000, 0), new THREE.Vector3(1.5, 1.5, 1.5), new THREE.Vector3(0, 0, 0))
  addFire('fire-' + +new Date(), new THREE.Vector3(-24000, 0, 5000))
  // document.getElementById("btnLoadObj").addEventListener("click",  _ => {
  //   return addCar('car-' + +new Date(), new THREE.Vector3(-16000, 0, 0), new THREE.Vector3(2, 2, 2), new THREE.Vector3(0, 0, 0))
  // }, false)
}

// 加载成功回调函数
function successCallback (viewMetaData) {
  const dom4Show = document.getElementById('domId');
  const webAppConfig = new Glodon.Bimface.Application.WebApplication3DConfig();
  webAppConfig.domElement = dom4Show;
  window.app = new Glodon.Bimface.Application.WebApplication3D(webAppConfig);
  // app.addView(viewToken);
  window.viewer3D = app.getViewer();
  window.viewer3D.addModel(viewMetaData);

  return new Promise(resolve => {
    // 增加加载完成监听事件
    window.viewer3D.addEventListener(Glodon.Bimface.Viewer.Viewer3DEvent.ViewAdded, () => {
      //自适应屏幕大小
      window.onresize = () => {
        window.viewer3D.resize(document.documentElement.clientWidth, document.documentElement.clientHeight - 40)
      }
      // 渲染场景
      viewer3D.render();
      resolve()
    });

  })

}

