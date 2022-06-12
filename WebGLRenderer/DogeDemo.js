// 创建需要用到的东西
let simpleCamera = new SimpleRotateCamera(new Vector3([0, 2, 0]));
simpleCamera.yawSpeed = 10;
simpleCamera.pitchSpeed = 10;
simpleCamera.zoomSpeed = 1;
// 光源
let light = new Light(
    new Transform(new Vector3([0.0, 5.0, 0.0]), new Vector3([-45, 45, 0])), new Vector3([1.0, 1.0, 1.0]), 
    10, 
    LIGHT_TYPE.DIRECTIONAL
    );
// Shader
let dogeShader = new Shader('./DefaultShader/DefaultVert.vert', './Res/ShowCase/StartDoge/Doge.frag');
let floorShader = new Shader('./DefaultShader/DefaultVert.vert', './DefaultShader/S_BCNRAO.frag');
let shadowCaster1 = new Shader('./DefaultShader/ShadowCaster.vert', './DefaultShader/ShadowCaster.frag');
let shadowCaster2 = new Shader('./DefaultShader/ShadowCaster.vert', './DefaultShader/ShadowCaster.frag');
// 材质
let mDoge = new Material(dogeShader, shadowCaster1);
let mFloor = new Material(floorShader, shadowCaster2);
// 模型
let smDoge = new Model('./Res/ShowCase/StartDoge/Doge.obj');
let smPlane = new Model('./Res/Model/Plane.obj');
// Mesh(Actor)
let doge = new Mesh(new Transform(new Vector3([0, 0, 0]), new Vector3([0,0,0]), new Vector3([0.4, 0.4, 0.4])), smDoge, mDoge);
let floor = new Mesh(new Transform(), smPlane, mFloor);
// 贴图
let tFloorBC = new Texture('./Res/Material/Floor_BC.jpg', gl.TEXTURE_2D);
let tFloorN = new Texture('./Res/Material/Floor_N.jpg', gl.TEXTURE_2D);
let tFloorR = new Texture('./Res/Material/Floor_R.jpg', gl.TEXTURE_2D);
let tFloorAO = new Texture('./Res/Material/Floor_AO.jpg', gl.TEXTURE_2D);
let tDogeBC = new Texture('./Res/ShowCase/StartDoge/Doge_BC.png');
let tDogeN = new Texture('./Res/ShowCase/StartDoge/Doge_N.png');

// 想编辑的Shader列表
this.codeEditor.editableShaderList = [
    floorShader.VS.bind(floorShader), 
    floorShader.FS.bind(floorShader), 
    dogeShader.FS.bind(dogeShader)
]; 

this.clearColor = [0.1, 0.1, 0.11, 1.0];

// 传入所有需要初始化的资源
this.bulidScene = (scene) =>
{
    scene.modelList = [smDoge, smPlane];
    scene.materialList = [mDoge, mFloor];
    scene.textureList = [tFloorBC, tFloorN, tFloorR, tFloorAO, tDogeBC, tDogeN];
    scene.meshList = [floor, doge];
    scene.lightList = [light];
    scene.camera = simpleCamera;
    scene.ambientColor = [0.1, 0.1, 0.11];
}

// 在运行前执行一次
this.customBeginPlay = () =>
{
    mFloor.setTexture('u_Texture', tFloorBC);
    mFloor.setTexture('u_Normal', tFloorN);
    mFloor.setTexture('u_Roughness', tFloorR);
    mFloor.setTexture('u_AO', tFloorAO);

    mDoge.setTexture('u_TexBC', tDogeBC);
    mDoge.setTexture('u_TexN', tDogeN);

    doge.setRotation(new Vector3([0, 0, 0]));
}

// 在运行时逐帧执行
this.customTick = (deltaSecond) =>
{
    doge.addRotationOffset(new Vector3([0, 15, 0]).multiplyf(deltaSecond));
}