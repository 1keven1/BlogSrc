var VSHADER_SOURCE = null;
var FSHADER_SOURCE = null;

var canvas;
var angle = 45;

function main()
{
    canvas = document.getElementById("webgl");
    var gl = getWebGLContext(canvas);
    if(!gl)
    {
        console.log("Get WebGL Render Context Failed");
        return;
    }

    loadShaderFile(gl, '1_RotateTriangle.vert', gl.VERTEX_SHADER);
    loadShaderFile(gl, '1_RotateTriangle.frag', gl.FRAGMENT_SHADER);
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

    var transformMatrix = new Matrix4();
    transformMatrix.setRotate(angle, 0, 0, 1);

    var u_TransformMatrix = gl.getUniformLocation(gl.program, 'u_TransformMatrix');
    gl.uniformMatrix4fv(u_TransformMatrix, false, transformMatrix.elements);

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl)
{
    var vertices = new Float32Array
    ([
        0.0, 0.5, 
        -0.5, -0.5,
        0.5, -0.5
    ]);
    var n = 3;

    // 创建 Buffer 对象
    var vertexBuffer = gl.createBuffer();
    if(!vertexBuffer)
    {
        console.log('Create Buffer Object Failed');
        return -1;
    }

    // 将 Buffer 对象绑定到目标
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // 写入数据
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if(a_Position < 0)
    {
        console.log('Get Attribute a_Position Failed');
        return -1;
    }

    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    return n;
}