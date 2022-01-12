var VSHADER_SOURCE = null;
var FSHADER_SOURCE = null;

var canvas;
var angleSpeed = 45;
var lastTime = Date.now();

function main()
{
    canvas = document.getElementById("webgl");
    var gl = getWebGLContext(canvas);
    if(!gl)
    {
        console.log("Get WebGL Render Context Failed");
        return;
    }

    loadShaderFile(gl, '3_RotatingTriangle.vert', gl.VERTEX_SHADER);
    loadShaderFile(gl, '3_RotatingTriangle.frag', gl.FRAGMENT_SHADER);
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
    var currentAngle = 0;
    var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    var modelMartrix = new Matrix4();

    var tick = function()
    {
        currentAngle = animate(currentAngle);
        modelMartrix.setRotate(currentAngle, 0, 0, 1);
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMartrix.elements);
        draw(gl, n);
        requestAnimationFrame(tick);
    }
    tick();
}

function initVertexBuffers(gl)
{
    var vertices = new Float32Array
    ([
        0.0, 0.3, 
        -0.3, -0.3,
        0.3, -0.3
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

function animate(angle)
{
    var deltaTime = Date.now() - lastTime;
    lastTime = Date.now();

    var newAngle = angle + (angleSpeed * deltaTime) / 1000.0;
    return newAngle % 360;
}

function draw(gl, n)
{
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, n);
}