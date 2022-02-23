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

    loadShaderFile(gl, '2_PointLightedCube.vert', gl.VERTEX_SHADER);
    loadShaderFile(gl, '2_PointLightedCube.frag', gl.FRAGMENT_SHADER);
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

    var u_Matrix_M = gl.getUniformLocation(gl.program, 'u_Matrix_M');
    var u_Matrix_M_IT = gl.getUniformLocation(gl.program, 'u_Matrix_M_IT');
    var u_Matrix_MVP = gl.getUniformLocation(gl.program, 'u_Matrix_MVP');
    var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
    var u_LightPos = gl.getUniformLocation(gl.program, 'u_LightPos');
    var u_AmibientColor = gl.getUniformLocation(gl.program, 'u_AmibientColor');
    if (!u_Matrix_M || 
        !u_Matrix_M_IT ||
        !u_Matrix_MVP || 
        !u_LightColor || 
        !u_LightPos || 
        !u_AmibientColor)
    {
        console.log("Get Uniform Failed");
        return;
    }

    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);
    var mMatrix = new Matrix4();
    var mITMatrix = new Matrix4();
    var mvpMatrix = new Matrix4();
    var lightPos = new Vector3([2.0, 1.7, 2.0]);

    gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
    gl.uniform3fv(u_LightPos, lightPos.elements);
    gl.uniform3f(u_AmibientColor, 0.1, 0.1, 0.1);

    currentAngle = 0;
    var tick = function ()
    {
        currentAngle = animate(currentAngle, rotateSpeed);

        mvpMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);
        mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
        mvpMatrix.rotate(currentAngle, 0, 1, 0);
        mMatrix.setRotate(currentAngle, 0, 1, 0);
        mITMatrix.setInverseOf(mMatrix);
        mITMatrix.transpose();

        gl.uniformMatrix4fv(u_Matrix_M, false, mMatrix.elements);
        gl.uniformMatrix4fv(u_Matrix_M_IT, false, mITMatrix.elements);
        gl.uniformMatrix4fv(u_Matrix_MVP, false, mvpMatrix.elements);

        draw(gl, n);
        requestAnimationFrame(tick);
    }
    tick()
}

function initVertexBuffers(gl)
{
    // 顶点坐标、颜色、法线
    var vertices = new Float32Array([   // Coordinates
        1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, // v0-v1-v2-v3 front
        1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, // v0-v3-v4-v5 right
        1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
        -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, // v1-v6-v7-v2 left
        -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, // v7-v4-v3-v2 down
        1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0  // v4-v7-v6-v5 back
    ]);

    var colors = new Float32Array([    // Colors
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v0-v1-v2-v3 front
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v0-v3-v4-v5 right
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v0-v5-v6-v1 up
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v1-v6-v7-v2 left
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v7-v4-v3-v2 down
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0　    // v4-v7-v6-v5 back
    ]);

    var normals = new Float32Array([    // Normal
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
        0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,  // v7-v4-v3-v2 down
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0   // v4-v7-v6-v5 back
    ]);

    // 顶点编号
    var indices = new Uint8Array([
        0, 1, 2, 0, 2, 3,    // front
        4, 5, 6, 4, 6, 7,    // right
        8, 9, 10, 8, 10, 11,    // up
        12, 13, 14, 12, 14, 15,    // left
        16, 17, 18, 16, 18, 19,    // down
        20, 21, 22, 20, 22, 23     // back
    ]);

    // 向Array Buffer中写入数据
    if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)) return -1;
    if (!initArrayBuffer(gl, 'a_Color', colors, 3, gl.FLOAT)) return -1;
    if (!initArrayBuffer(gl, 'a_Normal', normals, 3, gl.FLOAT)) return -1;

    // 写入顶点索引
    var indexBuffer = gl.createBuffer();
    if (!indexBuffer)
    {
        console.log('Failed to create the buffer object');
        return false;
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}

function initArrayBuffer(gl, attribute, data, num, type)
{
    // 创建Buffer
    var buffer = gl.createBuffer();
    if (!buffer)
    {
        console.log('Failed to create the buffer object');
        return false;
    }

    // 写入数据
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    var a_attribute = gl.getAttribLocation(gl.program, attribute);
    if (a_attribute < 0)
    {
        console.log('Failed to get the storage location of ' + attribute);
        return false;
    }

    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return true;
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