var VSHADER_SOURCE = null;
var FSHADER_SOURCE = null;

var canvas;
var eyeX = 0, eyeY = 0, eyeZ = 0.25;
function main()
{
    canvas = document.getElementById("webgl");
    var gl = getWebGLContext(canvas);
    if (!gl)
    {
        console.log("Get WebGL Render Context Failed");
        return;
    }

    loadShaderFile(gl, '3_LookAtTrianglesWithKeys.vert', gl.VERTEX_SHADER);
    loadShaderFile(gl, '3_LookAtTrianglesWithKeys.frag', gl.FRAGMENT_SHADER);
}

function start(gl)
{
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE))
    {
        console.log("Load Shader Failed");
        return;
    }

    var n = initVertexBuffers(gl);
    if (n < 0)
    {
        console.log('Set Vertices Position Failed');
        return;
    }

    var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix)
    {
        console.log("Get Uniform Failed");
        return;
    }

    gl.clearColor(0, 0, 0, 1);
    var viewMatrix = new Matrix4();
    viewMatrix.setLookAt(eyeX, eyeY, eyeZ, 0, 0, 0, 0, 1, 0);

    // 注册按键按下事件
    document.onkeydown = function (event)
    {
        keydown(event, gl, n, u_ViewMatrix, viewMatrix);
    }

    draw(gl, n, u_ViewMatrix, viewMatrix);
}

function initVertexBuffers(gl)
{
    var verticesColors = new Float32Array
        ([
            0.0, 0.5, -0.4, 0.4, 1.0, 0.4,
            -0.5, -0.5, -0.4, 0.4, 1.0, 0.4,
            0.5, -0.5, -0.4, 1.0, 0.4, 0.4,

            0.5, 0.4, -0.2, 1.0, 0.4, 0.4,
            -0.5, 0.4, -0.2, 1.0, 1.0, 0.4,
            0.0, -0.6, -0.2, 1.0, 1.0, 0.4,

            0.0, 0.5, 0.0, 0.4, 0.4, 1.0,
            -0.5, -0.5, 0.0, 0.4, 0.4, 1.0,
            0.5, -0.5, 0.0, 1.0, 0.4, 0.4
        ]);
    var n = 9;
    var FSIZE = verticesColors.BYTES_PER_ELEMENT;

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

    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    gl.enableVertexAttribArray(a_Color);

    return n;
}

function keydown(event, gl, n, u_ViewMatrix, viewMatrix)
{
    // 按下左右改变摄像机X坐标
    if (event.keyCode == 39 && eyeX < 0.25)
    {
        eyeX += 0.01;
    }
    else if (event.keyCode == 37 && eyeX > -0.25)
    {
        eyeX -=0.01; 
    }
    // 按下上下改变摄像机Y坐标
    else if (event.keyCode == 38 && eyeY < 0.25)
    {
        eyeY +=0.01; 
    }
    else if (event.keyCode == 40 && eyeY > -0.25)
    {
        eyeY -=0.01; 
    }
    else { return; }
    viewMatrix.setLookAt(eyeX, eyeY, eyeZ, 0, 0, 0, 0, 1, 0)
    draw(gl, n, u_ViewMatrix, viewMatrix);
}

function draw(gl, n, u_ViewMatrix, viewMatrix)
{
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, n);
}