// 创建需要用到的东西
let simpleCamera = new SimpleRotateCamera(new Vector3([0, 1, 0]));
simpleCamera.yawSpeed = 10;
simpleCamera.pitchSpeed = 10;
simpleCamera.zoomSpeed = 1;
// 光源
let light = new Light(
    new Transform(new Vector3([0.0, 5.0, 0.0]), new Vector3([-45, 45, 0])), new Vector3([1.0, 1.0, 1.0]),
    1,
    LIGHT_TYPE.DIRECTIONAL
);
// Shader
let sDiffuse = new Shader('./DefaultShader/DefaultVert.vert', './DefaultShader/SpecularColor.frag');
let sShadowCaster1 = new Shader('./DefaultShader/ShadowCaster.vert', './DefaultShader/ShadowCaster.frag');
let sSpecularBCN = new Shader('./DefaultShader/DefaultVert.vert', './Res/ShowCase/SimpleDemo/Floor.frag');
let sShadowCaster2 = new Shader('./DefaultShader/ShadowCaster.vert', './DefaultShader/ShadowCaster.frag');
// 材质
let mLove = new Material(sDiffuse, sShadowCaster1, MATERIAL_TYPE.OPAQUE, 0);
let mFloor = new Material(sSpecularBCN, sShadowCaster2, MATERIAL_TYPE.OPAQUE, 0);
// 模型
let smLove = new Model('./Res/Model/Love.obj', 1);
let smFloor = new Model('./Res/Model/Plane.obj', 1);
// Mesh(Actor)
let love = new Mesh(new Transform(new Vector3([0, 1.001, 0]), new Vector3([0, 0, 0]), new Vector3([0.2, 0.2, 0.2])), smLove, mLove, true);
let floor = new Mesh(new Transform(), smFloor, mFloor, true);
// 贴图
let tFloor = new Texture('./Res/Material/SpanishPavement_BC.jpg');
let tFloorN = new Texture('./Res/Material/SpanishPavement_N.jpg');

// 想编辑的Shader列表
this.codeEditor.editableShaderList = [
    sDiffuse.FS.bind(sDiffuse),
    sSpecularBCN.FS.bind(sSpecularBCN)
];

this.clearColor = [0.1, 0.1, 0.11, 1];

// 传入所有需要初始化的资源
this.bulidScene = (scene) => {
    scene.modelList = [smLove, smFloor];
    scene.materialList = [mLove, mFloor];
    scene.textureList = [tFloor, tFloorN];
    scene.meshList = [love, floor];
    scene.lightList = [light];
    scene.camera = simpleCamera;
    scene.ambientColor = [0.1, 0.1, 0.11];
}

// 在运行前执行一次
this.customBeginPlay = () => {
    mLove.setVector3f('u_Color', 1, 0.2, 0.2);

    mFloor.setTexture('u_TexBC', tFloor);
    mFloor.setTexture('u_TexN', tFloorN);
    mFloor.setCullMode(CULL_MODE.OFF);
}

let t = 0;

this.customTick = (deltaSecond) => {
    // ❤琛❤ 旋转 跳跃 我闭着眼~
    love.setLocation(new Vector3([0, Math.abs(Math.sin(t * 3)) * 0.5, 0]));
    love.addRotationOffset(new Vector3([0, 15, 0]).multiplyf(deltaSecond));
    t += deltaSecond;
}