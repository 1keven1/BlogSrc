var VSHADER_SOURCE = null;
var FSHADER_SOURCE = null;

var canvas;
rotateSpeed = 20;

function main()
{
    canvas = document.getElementById("webgl");
    var gl = getWebGLContext(canvas);
    if (!gl)
    {
        console.log("Get WebGL Render Context Failed");
        return;
    }

    loadShaderFile(gl, '6_HelloCube.vert', gl.VERTEX_SHADER);
    loadShaderFile(gl, '6_HelloCube.frag', gl.FRAGMENT_SHADER);
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

    var u_Matrix_MVP = gl.getUniformLocation(gl.program, 'u_Matrix_MVP');
    if (!u_Matrix_MVP)
    {
        console.log("Get Uniform Failed");
        return;
    }

    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);
    var mvpMatrix = new Matrix4();


    currentAngle = 0;
    var tick = function(){
        currentAngle = animate(currentAngle, rotateSpeed);

        mvpMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);
        mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
        mvpMatrix.rotate(currentAngle, 0, 1, 0);

        gl.uniformMatrix4fv(u_Matrix_MVP, false, mvpMatrix.elements);
        
        draw(gl, n);
        requestAnimationFrame(tick);
    }
    tick()
}

function initVertexBuffers(gl)
{
    // 所有的顶点坐标
    var verticesColors = new Float32Array
        ([
            1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
            -1.0, 1.0, 1.0, 1.0, 0.0, 1.0,
            -1.0, -1.0, 1.0, 1.0, 0.0, 0.0,
            1.0, -1.0, 1.0, 1.0, 1.0, 0.0,
            1.0, -1.0, -1.0, 0.0, 1.0, 0.0,
            1.0, 1.0, -1.0, 0.0, 1.0, 1.0,
            -1.0, 1.0, -1.0, 0.0, 0.0, 1.0,
            -1.0, -1.0, -1.0, 0.0, 0.0, 0.0,
        ]);
    var FSIZE = verticesColors.BYTES_PER_ELEMENT;

    // 所有的三角形顶点索引值
    var indices = new Uint8Array([
        0, 1, 2, 0, 2, 3,
        0, 3, 4, 0, 4, 5,
        0, 5, 6, 0, 6, 1,
        1, 6, 7, 1, 7, 2,
        7, 4, 3, 7, 3, 2,
        4, 7, 6, 4, 6, 5
    ])

    // 创建顶点坐标和颜色buffer对象
    var vertexColorBuffer = gl.createBuffer();
    if (!vertexColorBuffer)
    {
        console.log('Create Buffer Object Failed');
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
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

    // 将顶点索引写入Element Buffer
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}

function draw(gl, n)
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

lastTime = Date.now();
function animate(angle, speed)
{
    var deltaTime = Date.now() - lastTime;
    lastTime = Date.now();

    var newAngle = angle + (speed * deltaTime) / 1000.0;
    return newAngle % 360;
}