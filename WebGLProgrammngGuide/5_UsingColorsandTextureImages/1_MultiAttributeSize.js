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

    loadShaderFile(gl, '1_MultiAttributeSize.vert', gl.VERTEX_SHADER);
    loadShaderFile(gl, '1_MultiAttributeSize.frag', gl.FRAGMENT_SHADER);
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

    gl.drawArrays(gl.POINTS, 0, 3);
}

function initVertexBuffers(gl)
{
    var n = 3;
    var verticesSize = new Float32Array
    ([
        0.0, 0.5, 10.0, 
        -0.5, -0.5, 20.0, 
        0.5, -0.5, 30.0
    ]);

    // 创建 Buffer 对象
    var vertexSizeBuffer = gl.createBuffer();
    if (!vertexSizeBuffer)
    {
        console.log('Create Buffer Object Failed');
        return -1;
    }

    // 将 Buffer 对象绑定到目标
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexSizeBuffer);

    // 写入数据
    gl.bufferData(gl.ARRAY_BUFFER, verticesSize, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    var a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
    if (a_Position < 0 || a_PointSize < 0)
    {
        console.log('Get Attribute Failed');
        return -1;
    }

    var FSIZE = verticesSize.BYTES_PER_ELEMENT;

    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 3, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, FSIZE * 3, FSIZE * 2);
    gl.enableVertexAttribArray(a_PointSize);

    return n;
}