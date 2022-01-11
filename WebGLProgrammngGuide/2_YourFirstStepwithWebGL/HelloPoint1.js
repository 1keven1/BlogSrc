// Vertex Shader
var VSHADER_SOURCE = null;
//Fragment Shader
var FSHADER_SOURCE = null;

function main()
{
    // 获取Canvas
    var canvas = document.getElementById('webgl');

    // 获取WebGL
    var gl = getWebGLContext(canvas);
    if(!gl)
    {
        console.log("Failed to get rendering context for WebGL");
        return;
    }

    // 加载Shader
    loadShaderFile(gl, 'HelloPoint1.vert', gl.VERTEX_SHADER);
    loadShaderFile(gl, 'HelloPoint1.frag', gl.FRAGMENT_SHADER);
}

// 开始渲染
function start(gl) {
    // 初始化Shader
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders.');
        return;
    }

    //设置清屏颜色
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 绘制点
    gl.drawArrays(gl.POINTS, 0, 1);
}