let camera = new Camera(new Transform(new Vector3([0.0, 2.0, 6.0]), new Vector3([-20, 0, 0])), 60, 0.1, 100);
let light = new Light(new Transform(new Vector3([0.0, 5.0, 0.0]), new Vector3([-45, 45, 0])), new Vector3([1.0, 1.0, 1.0]), 10);

let shadowCaster = new Shader('./DefaultShader/ShadowCaster.vert', './DefaultShader/ShadowCaster.frag');
let diffuseShader = new Shader('./DefaultShader/Diffuse.vert', './DefaultShader/Diffuse.frag');
let diffuseMaterial = new Material(diffuseShader, shadowCaster);
let texShader = new Shader('./DefaultShader/DiffuseTex.vert', './DefaultShader/DiffuseTex.frag');
let texMaterial = new Material(texShader, shadowCaster);

let cube = new Model('./Res/Model/Cube.obj');
let plane = new Model('./Res/Model/Plane.obj');
let sphere = new Model('./Res/Model/Sphere.obj')

let meshCube = new Mesh(new Transform(), cube, texMaterial);
let floor = new Mesh(new Transform(new Vector3([0, -1, 0])), plane, diffuseMaterial);

let texture = new Texture('./Res/Image/Test.jpg', gl.TEXTURE_2D);


this.bulidScene = (scene) =>
{
    scene.modelList = [cube, sphere, plane];
    scene.materialList = [diffuseMaterial, texMaterial];
    scene.textureList = [texture];
    scene.meshList = [meshCube, floor];
    scene.lightList = [light];
    scene.camera = camera;
}

this.customBeginPlay = () =>
{
    diffuseMaterial.setUniformVector3f('u_AmbientColor', 0.2, 0.2, 0.2);
    texMaterial.setUniformVector3f('u_AmbientColor', 0.2, 0.2, 0.2);
    texMaterial.setTexture('u_Tex', 0);
}

this.customTick = (deltaSecond) =>
{
    meshCube.addRotationOffset(new Vector3([0, 1.5, 0]).multiplyf(deltaSecond));
}

/*
document.onmousedown = () =>
{
    meshCube.material = diffuseMaterial;
    meshCube.model = sphere;
    floor.material = texMaterial;
}
document.onmouseup = () =>
{
    meshCube.material = texMaterial;
    meshCube.model = cube;
    floor.material = diffuseMaterial;
}
*/