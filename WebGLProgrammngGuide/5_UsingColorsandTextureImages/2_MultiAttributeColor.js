var VSHADER_SOURCE = null;
var FSHADER_SOURCE = null;

var canvas;

function main()
{
    canvas = document.getElementById("webgl");
    var gl = getWebGLContext(canvas);
    if(!gl)
    {
        console.log("Get WebGL Render Context Failed");
        return;
    }  

    loadShaderFile(gl, '2_MultiAttributeColor.vert', gl.VERTEX_SHADER);
    loadShaderFile(gl, '2_MultiAttributeColor.frag', gl.FRAGMENT_SHADER);
}

function start(gl)
{
    if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE))
    {
        console.log("Load Shader Failed");
        return;
    }

    var n = initVertexBuffers(gl);
    if(n < 0)
    {
        console.log('Set Vertices Position Failed');
        return;
    }

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function initVertexBuffers(gl)
{
    var n = 3;
    var verticesColors = new Float32Array
    ([
        0.0, 0.5, 1, 0, 0, 
        -0.5, -0.5, 0, 1, 0, 
        0.5, -0.5, 0, 0, 1
    ]);

    // 创建 Buffer 对象
    var vertexColorBuffer = gl.createBuffer();
    if (!vertexColorBuffer)
    {
        console.log('Create Buffer Object Failed');
        return -1;
    }

    // 将 Buffer 对象绑定到目标
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);

    // 写入数据
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if (a_Position < 0 || a_Color < 0)
    {
        console.log('Get Attribute Failed');
        return -1;
    }

    var FSIZE = verticesColors.BYTES_PER_ELEMENT;

    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 5, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 5, FSIZE * 2);
    gl.enableVertexAttribArray(a_Color);

    return n;
}