'use strict';
// 材质和模型

let materialPlane = new Object();
materialPlane.VSHADER_SOURCE = null;
materialPlane.FSHADER_SOURCE = null;
materialPlane.shaderReadOver = false;
materialPlane.program = null;

let modelPlane = new Object();
modelPlane.vertexBuffer = null;
modelPlane.texCoordBuffer = null;
modelPlane.normalBuffer = null;
modelPlane.indexBuffer = null;
modelPlane.indexNum = -1;

let modelCube = new Object();
modelCube.vertexBuffer = null;
modelCube.texCoordBuffer = null;
modelCube.normalBuffer = null;
modelCube.indexBuffer = null;
modelCube.indexNum = -1;

let canvas;
let rotateSpeed = 20;

let bufferWidth = 256;
let bufferHeight = 256;

function main()
{
    canvas = document.getElementById("webgl");
    var gl = getWebGLContext(canvas);
    if (!gl)
    {
        console.log("Get WebGL Render Context Failed");
        return;
    }

    // 读取shader文件到material中
    readShaderFile(gl, '5_FrameBufferObject.vert', '5_FrameBufferObject.frag', materialPlane);
}

// 都读完了之后开始渲染
function shaderReadOver(gl, material)
{
    material.shaderReadOver = true;
    start(gl);
}

function start(gl)
{
    // 创建shaderProgram
    materialPlane.program = createProgram(gl, materialPlane.VSHADER_SOURCE, materialPlane.FSHADER_SOURCE);
    if (!materialPlane.program)
    {
        console.log('Create Program fail');
        return;
    }

    // 初始化材质 获取默认shader变量位置
    initMaterial(gl, materialPlane.program);

    // 获取并给自定义变量赋值
    gl.useProgram(materialPlane.program);
    materialPlane.program.u_Sampler_Tex = gl.getUniformLocation(materialPlane.program, 'u_Sampler_Tex');
    // 绑定到TexUnit0
    gl.uniform1i(materialPlane.program.u_Sampler_Tex, 0);

    // 读取并初始化模型
    if (!initPlaneBuffers(gl, modelPlane))
    {
        console.log('init model buffers fail');
        return;
    }
    if (!initCubeBuffers(gl, modelCube))
    {
        console.log('init model buffers fail');
        return;
    }

    // 读取贴图并存到Texture unit0
    let texture0 = initTexture(gl, '../../res/Image/test.jpg', gl.TEXTURE0, gl.TEXTURE_2D);
    if (!texture0)
    {
        console.log('Failed to intialize the texture.');
        return;
    }
    // let texture1 = initTexture(gl, '../resource/sky.jpg', gl.TEXTURE1, gl.TEXTURE_2D);
    // if (!texture1)
    // {
    //     console.log('Failed to intialize the texture.');
    //     return;
    // }

    let fbo = initFrameBufferObject(gl);


    // 准备开始渲染
    gl.clearColor(0, 0, 0, 1);

    // 摄像机相关
    var vpMatrix = new Matrix4();
    vpMatrix.setPerspective(45, 1, 0.1, 100);
    vpMatrix.lookAt(0, 2, 6, 0, 0, 0, 0, 1, 0);
    let currentAngle = 0;

    var tick = function ()
    {
        currentAngle = animate(currentAngle, rotateSpeed);
  
        // 绘制Framebuffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.viewport(0, 0, bufferWidth, bufferHeight);
        gl.clearColor(0.2, 0.2, 0.2, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.uniform1i(materialPlane.program.u_Sampler_Tex, 0);
        draw(gl, modelCube, materialPlane, vpMatrix, 1, currentAngle);

        // 绘制Colorbuffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.uniform1i(materialPlane.program.u_Sampler_Tex, 1);
        draw(gl, modelPlane, materialPlane, vpMatrix, 1.7, currentAngle * 0.5);

        requestAnimationFrame(tick);
    }
    tick();
}

function initFrameBufferObject(gl)
{
    let framebuffer, texture, depthBuffer;
    // 错误返回函数
    var error = function ()
    {
        if (framebuffer) gl.deleteFramebuffer(framebuffer);
        if (texture) gl.deleteTexture(texture);
        if (depthBuffer) gl.deleteRenderbuffer(depthBuffer);
        return null;
    }

    // 创建
    framebuffer = gl.createFramebuffer();
    if(!framebuffer){
        console.log("Create Framebuffer Fail");
        error();
    }

    // 创建贴图，设置大小和参数
    texture = gl.createTexture();
    if(!texture){
        console.log("Create Framebuffer texture Fail");
        error();
    }

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, bufferWidth, bufferHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    framebuffer.texture = texture;

    // 创建renderbuffer
    depthBuffer = gl.createRenderbuffer();
    if(!depthBuffer){
        console.log('Create Framebuffer Renderbuffer Fail');
        error();
    }
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, bufferWidth, bufferHeight);

    // 把贴图和renderbuffer绑到FrameBuffer上
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

    // 检查FrameBuffer是否完善
    let e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if(e !== gl.FRAMEBUFFER_COMPLETE){
        console.log('Framebuffer is not complete: '+e.toString());
        error();
    }

    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return framebuffer;
}

function initMaterial(gl, flatProgram)
{
    flatProgram.a_Position = gl.getAttribLocation(flatProgram, 'a_Position');
    flatProgram.a_TexCoord = gl.getAttribLocation(flatProgram, 'a_TexCoord');
    flatProgram.a_Normal = gl.getAttribLocation(flatProgram, 'a_Normal');

    flatProgram.u_Matrix_MVP = gl.getUniformLocation(flatProgram, 'u_Matrix_MVP');
    flatProgram.u_Matrix_M_I = gl.getUniformLocation(flatProgram, 'u_Matrix_M_I');
    flatProgram.u_LightPos = gl.getUniformLocation(flatProgram, 'u_LightPos');
    flatProgram.u_LightColor = gl.getUniformLocation(flatProgram, 'u_LightColor');

    if (!flatProgram.u_Matrix_MVP || !flatProgram.u_Matrix_M_I || !flatProgram.u_LightColor || !flatProgram.u_LightPos ||
        flatProgram.a_Position < 0 || flatProgram.a_TexCoord < 0 || flatProgram.a_Normal < 0)
    {
        console.log('get variable fail');
        // return;
    }
}

function initCubeBuffers(gl, model)
{
    let vertices = new Float32Array([   // Vertex coordinates
        1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,    // v0-v1-v2-v3 front
        1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0,    // v0-v3-v4-v5 right
        1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
        -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0,    // v1-v6-v7-v2 left
        -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,    // v7-v4-v3-v2 down
        1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0     // v4-v7-v6-v5 back
    ]);

    let texCoords = new Float32Array([   // Texture coordinates
        1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,    // v0-v1-v2-v3 front
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,    // v0-v3-v4-v5 right
        1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,    // v0-v5-v6-v1 up
        1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,    // v1-v6-v7-v2 left
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,    // v7-v4-v3-v2 down
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0     // v4-v7-v6-v5 back
    ]);

    let normals = new Float32Array([    // Normal
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
        0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,  // v7-v4-v3-v2 down
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0   // v4-v7-v6-v5 back
    ]);

    // Indices of the vertices
    let indices = new Uint16Array([
        0, 1, 2, 0, 2, 3,    // front
        4, 5, 6, 4, 6, 7,    // right
        8, 9, 10, 8, 10, 11,    // up
        12, 13, 14, 12, 14, 15,    // left
        16, 17, 18, 16, 18, 19,    // down
        20, 21, 22, 20, 22, 23     // back
    ]);

    model.vertexBuffer = createModelBuffers(gl, gl.ARRAY_BUFFER, vertices, 3, gl.FLOAT, gl.STATIC_DRAW);
    model.texCoordBuffer = createModelBuffers(gl, gl.ARRAY_BUFFER, texCoords, 2, gl.FLOAT, gl.STATIC_DRAW);
    model.normalBuffer = createModelBuffers(gl, gl.ARRAY_BUFFER, normals, 3, gl.FLOAT, gl.STATIC_DRAW);
    model.indexBuffer = createModelBuffers(gl, gl.ELEMENT_ARRAY_BUFFER, indices, 3, gl.UNSIGNED_SHORT, gl.STATIC_DRAW);
    if (!model.vertexBuffer || !model.normalBuffer || !model.texCoordBuffer || !model.indexBuffer) return false;

    model.indexNum = indices.length;

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    return true;
}

function initPlaneBuffers(gl, model)
{
    // Vertex coordinates
    let vertices = new Float32Array([
        1.0, 1.0, 0.0, -1.0, 1.0, 0.0, -1.0, -1.0, 0.0, 1.0, -1.0, 0.0    // v0-v1-v2-v3
    ]);

    // Texture coordinates
    let texCoords = new Float32Array([1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0]);

    let normals = new Float32Array([
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0
    ])

    // Indices of the vertices
    let indices = new Uint16Array([0, 1, 2, 0, 2, 3]);

    // Write vertex information to buffer object
    model.vertexBuffer = createModelBuffers(gl, gl.ARRAY_BUFFER, vertices, 3, gl.FLOAT, gl.STATIC_DRAW);
    model.texCoordBuffer = createModelBuffers(gl, gl.ARRAY_BUFFER, texCoords, 2, gl.FLOAT, gl.STATIC_DRAW);
    model.normalBuffer = createModelBuffers(gl, gl.ARRAY_BUFFER, normals, 3, gl.FLOAT, gl.STATIC_DRAW);
    model.indexBuffer = createModelBuffers(gl, gl.ELEMENT_ARRAY_BUFFER, indices, 3, gl.UNSIGNED_SHORT, gl.STATIC_DRAW);

    if (!model.vertexBuffer || !model.normalBuffer || !model.texCoordBuffer || !model.indexBuffer) return false;

    model.indexNum = indices.length;

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    return true;
}

function createModelBuffers(gl, bufferTarget, data, dataNum, dataType, usage)
{
    let buffer = gl.createBuffer();
    if (!buffer)
    {
        console.log('Create Buffer Fail');
        return null;
    }

    gl.bindBuffer(bufferTarget, buffer);
    gl.bufferData(bufferTarget, data, usage);

    buffer.dataNum = dataNum;
    buffer.dataType = dataType;
    return buffer;
}

function initArrayBuffer(gl, data, num, type, attribute)
{
    // Create a buffer object
    var buffer = gl.createBuffer();
    if (!buffer)
    {
        console.log('Failed to create the buffer object');
        return false;
    }
    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    // Assign the buffer object to the attribute variable
    var a_attribute = gl.getAttribLocation(gl.program, attribute);
    if (a_attribute < 0)
    {
        console.log('Failed to get the storage location of ' + attribute);
        return false;
    }
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    // Enable the assignment to a_attribute variable
    gl.enableVertexAttribArray(a_attribute);

    return true;
}

function initTexture(gl, texSrc, texUnit, texType = gl.TEXTURE_2D)
{
    var texture = gl.createTexture();   // Create a texture object
    if (!texture)
    {
        console.log('Failed to create the texture object');
        return null;
    }

    var image = new Image();  // Create a image object
    if (!image)
    {
        console.log('Failed to create the image object');
        return null;
    }

    // 当图片加载好时
    image.onload = function ()
    {
        // Write the image data to texture object
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);  // Flip the image Y coordinate

        gl.activeTexture(texUnit);
        gl.bindTexture(texType, texture);
        gl.texParameteri(texType, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texImage2D(texType, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        // gl.activeTexture(null);
    };

    // Tell the browser to load an Image
    image.src = texSrc;

    return texture;
}


function draw(gl, model, material, vpMatrix, scale, currentAngle)
{
    // 使用对应shader
    gl.useProgram(material.program);
    gl.enable(gl.DEPTH_TEST);

    // 绑定Vertex Buffer
    if (material.program.a_Position >= 0) bindAttributeToBuffer(gl, material.program.a_Position, model.vertexBuffer);
    if (material.program.a_TexCoord >= 0) bindAttributeToBuffer(gl, material.program.a_TexCoord, model.texCoordBuffer);
    if (material.program.a_Normal >= 0) bindAttributeToBuffer(gl, material.program.a_Normal, model.normalBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);

    // 传入默认变量
    if (material.program.u_LightPos) gl.uniform4f(materialFlat.program.u_LightPos, 1, 1, 1, 0.0);
    if (material.program.u_LightColor) gl.uniform4f(materialFlat.program.u_LightColor, 1.0, 1.0, 1.0, 1.0);


    // 计算各种矩阵
    let mMatrix = new Matrix4().setTranslate(0, 0, 0).scale(scale, scale, scale).rotate(currentAngle, 0, 1, 0);
    let mIMatrix = new Matrix4().setInverseOf(mMatrix);
    let mvpMatrix = new Matrix4().set(vpMatrix).multiply(mMatrix);

    gl.uniformMatrix4fv(material.program.u_Matrix_MVP, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(material.program.u_Matrix_M_I, false, mIMatrix.elements);

    // 绘制
    gl.drawElements(gl.TRIANGLES, model.indexNum, model.indexBuffer.dataType, 0);
}

function bindAttributeToBuffer(gl, a_attribute, buffer)
{
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(a_attribute, buffer.dataNum, buffer.dataType, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);
}

let lastTime = Date.now();
function animate(angle, speed)
{
    var deltaTime = Date.now() - lastTime;
    lastTime = Date.now();

    var newAngle = angle + (speed * deltaTime) / 1000.0;
    return newAngle % 360;
}