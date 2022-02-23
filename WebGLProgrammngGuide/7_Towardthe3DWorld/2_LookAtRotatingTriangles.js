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

    loadShaderFile(gl, '2_LookAtRotatingTriangles.vert', gl.VERTEX_SHADER);
    loadShaderFile(gl, '2_LookAtRotatingTriangles.frag', gl.FRAGMENT_SHADER);
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

    var u_Matrix_MV = gl.getUniformLocation(gl.program, 'u_Matrix_MV');
    if(!u_Matrix_MV)
    {
        console.log("Get Uniform Failed");
        return;
    }

    gl.clearColor(0, 0, 0, 1);
    var viewMatrix = new Matrix4();
    var modelMatrix = new Matrix4();
    var currentAngle = 0;

    var tick = function(){
        currentAngle = animate(currentAngle);

        viewMatrix.setLookAt(0.2, 0.25, 0.25, 0, 0, 0, 0, 1, 0);
        modelMatrix.setRotate(currentAngle, 0, 0, 1);
        var modelViewMatrix = viewMatrix.multiply(modelMatrix);
        gl.uniformMatrix4fv(u_Matrix_MV, false, modelViewMatrix.elements);
        
        draw(gl, n);
        requestAnimationFrame(tick);
    }
    tick()
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
    if(!vertexColorBuffer)
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
    if(a_Position < 0 || a_Color < 0)
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