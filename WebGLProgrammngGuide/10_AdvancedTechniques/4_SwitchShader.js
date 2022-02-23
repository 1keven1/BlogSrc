'use strict';
// 材质和模型
let materialFlat = new Object();
materialFlat.VSHADER_SOURCE = null;
materialFlat.FSHADER_SOURCE = null;
materialFlat.shaderReadOver = false;
materialFlat.program = null;

let materialTex = new Object();
materialTex.VSHADER_SOURCE = null;
materialTex.FSHADER_SOURCE = null;
materialTex.shaderReadOver = false;
materialTex.program = null;

let modelCube = new Object();
modelCube.vertexBuffer = null;
modelCube.texCoordBuffer = null;
modelCube.normalBuffer = null;
modelCube.indexBuffer = null;
modelCube.indexNum = -1;

let canvas;
let rotateSpeed = 20;

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
    readShaderFile(gl, '4_SwitchShader.vert', '4_SwitchShader_Flat.frag', materialFlat);
    readShaderFile(gl, '4_SwitchShader.vert', '4_SwitchShader_Tex.frag', materialTex);
}

// 都读完了之后开始渲染
function shaderReadOver(gl, material)
{
    material.shaderReadOver = true;

    if (materialFlat.shaderReadOver && materialTex.shaderReadOver) start(gl);
}

function start(gl)
{
    // 创建shaderProgram
    materialFlat.program = createProgram(gl, materialFlat.VSHADER_SOURCE, materialFlat.FSHADER_SOURCE);
    materialTex.program = createProgram(gl, materialTex.VSHADER_SOURCE, materialTex.FSHADER_SOURCE);
    if (!materialFlat.program || !materialTex.program)
    {
        console.log('Create Program fail');
        return;
    }

    // 初始化材质 获取默认shader变量位置
    initMaterialFlat(gl, materialFlat.program);
    initMaterialFlat(gl, materialTex.program);
    // 获取并给自定义变量赋值
    gl.useProgram(materialFlat.program);
    materialFlat.program.u_ambientColor = gl.getUniformLocation(materialFlat.program, 'u_ambientColor');
    gl.uniform3f(materialFlat.program.u_ambientColor, 0.2, 0.2, 0.2);
    gl.useProgram(materialTex.program);
    materialTex.program.u_Sampler_Tex = gl.getUniformLocation(materialTex.program, 'u_Sampler_Tex');
    // 绑定到TexUnit0
    gl.uniform1i(materialTex.program.u_Sampler_Tex, 0);
    gl.useProgram(null);
    
    // 读取并初始化模型
    if (!initModelBuffers(gl, modelCube))
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
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        // 开始绘制
        draw(gl, modelCube, materialFlat, vpMatrix, -1.2, currentAngle);
        draw(gl, modelCube, materialTex, vpMatrix, 1.2, currentAngle);

        requestAnimationFrame(tick);
    }
    tick();
}

function initMaterialFlat(gl, flatProgram)
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

function initModelBuffers(gl, model)
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


function draw(gl, model, material, vpMatrix, transform, currentAngle)
{
    // 使用对应shader
    gl.useProgram(material.program);
    gl.enable(gl.DEPTH_TEST);

    // 绑定Vertex Buffer
    bindAttributeToBuffer(gl, material.program.a_Position, model.vertexBuffer);
    bindAttributeToBuffer(gl, material.program.a_TexCoord, model.texCoordBuffer);
    bindAttributeToBuffer(gl, material.program.a_Normal, model.normalBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);

    // 传入默认变量
    if(material.program.u_LightPos) gl.uniform4f(materialFlat.program.u_LightPos, 1, 1, 1, 0.0);
    if(material.program.u_LightColor) gl.uniform4f(materialFlat.program.u_LightColor, 1.0, 1.0, 1.0, 1.0);


    // 计算各种矩阵
    let mMatrix = new Matrix4().setTranslate(transform, 0, 0).scale(0.7, 0.7, 0.7).rotate(currentAngle, 0, 1, 0);
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