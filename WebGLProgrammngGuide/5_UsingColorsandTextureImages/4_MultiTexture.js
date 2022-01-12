var VSHADER_SOURCE = null;
var FSHADER_SOURCE = null;

var canvas;

function main() {
    canvas = document.getElementById("webgl");
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log("Get WebGL Render Context Failed");
        return;
    }

    loadShaderFile(gl, '4_MultiTexture.vert', gl.VERTEX_SHADER);
    loadShaderFile(gl, '4_MultiTexture.frag', gl.FRAGMENT_SHADER);
}

function start(gl) {
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log("Load Shader Failed");
        return;
    }

    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Set Vertices Position Failed');
        return;
    }

    if (!initAndLoadTexture(gl, n)) {
        return;
    }

}

function initVertexBuffers(gl) {
    var n = 4;
    // 顶点坐标和 UV 值
    var verticesTexCoord = new Float32Array
        ([
            -0.7, 0.7, 0.0, 1.0,
            -0.7, -0.7, 0.0, 0.0,
            0.7, 0.7, 1.0, 1.0,
            0.7, -0.7, 1.0, 0.0
        ]);

    // 创建 Buffer 对象
    var vertexTexCoordBuffer = gl.createBuffer();
    if (!vertexTexCoordBuffer) {
        console.log('Create Buffer Object Failed');
        return -1;
    }

    // 将 Buffer 对象绑定到目标
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);

    // 写入
    gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoord, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
    if (a_Position < 0 || a_TexCoord < 0) {
        console.log('Get Attribute Failed');
        return -1;
    }

    var FSIZE = verticesTexCoord.BYTES_PER_ELEMENT;

    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
    gl.enableVertexAttribArray(a_TexCoord);

    return n;
}

function initAndLoadTexture(gl, n) {
    // 创建 Texture 对象
    var textureBase = gl.createTexture();
    var textureMask = gl.createTexture();
    if (!textureBase || !textureMask) {
        console.log('Create Texture Failed');
        return false;
    }

    var u_Sampler_Base = gl.getUniformLocation(gl.program, 'u_Sampler_Base');
    var u_Sampler_Mask = gl.getUniformLocation(gl.program, 'u_Sampler_Mask');
    if (!u_Sampler_Base || !u_Sampler_Mask) {
        console.log('Get Uniform Failed');
        return false;
    }

    // 创建 Image 对象并加载
    var imageBase = new Image();
    var imageMask = new Image();
    imageBase.onload = function () {
        loadTexture(gl, n, textureBase, u_Sampler_Base, imageBase, 0);
    }
    imageMask.onload = function () {
        loadTexture(gl, n, textureMask, u_Sampler_Mask, imageMask, 1);
    }
    imageBase.src = '../resource/test.jpg';
    imageMask.src = '../resource/Drop.png';
    return true;
}

// 是否加载完贴图
var g_texUnit0 = false, g_texUnit1 = false;
// 处理 Texture 对象
function loadTexture(gl, n, texture, u_Sampler, image, texUnit) {
    var thisTextureUnit;
    switch (texUnit) {
        case 0:{
            thisTextureUnit = gl.TEXTURE0;
            g_texUnit0 = true;
            break;
        }
        case 1: {
            thisTextureUnit = gl.TEXTURE1;
            g_texUnit1 = true;
            break;
        }
        default: {
            console.log("TexUnit错误")
            return;
        }
    }
    // 翻转 Y 轴
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    // 开启 0 号纹理单元
    gl.activeTexture(thisTextureUnit);
    // 指定贴图对象为 2D 贴图
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // 设定贴图属性（缩小采样为线性）
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // 为贴图对象指定图片
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    // 把 0 号纹理单元指定给变量
    gl.uniform1i(u_Sampler, texUnit);

    if (g_texUnit0 && g_texUnit1){
        StartRender(gl, n);
    }
}

function StartRender(gl, n) {
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
}