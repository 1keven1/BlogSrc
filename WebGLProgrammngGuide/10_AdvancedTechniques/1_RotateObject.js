var VSHADER_SOURCE = null;
var FSHADER_SOURCE = null;

var canvas;
rotateSpeed = 20;

var currentAngle = 0;
function main()
{
    canvas = document.getElementById("webgl");
    var gl = getWebGLContext(canvas);
    if (!gl)
    {
        console.log("Get WebGL Render Context Failed");
        return;
    }

    loadShaderFile(gl, '1_RotateObject.vert', gl.VERTEX_SHADER);
    loadShaderFile(gl, '1_RotateObject.frag', gl.FRAGMENT_SHADER);
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

    if (!initAndLoadTexture(gl))
    {
        console.log("Load Texture Fail")
        return;
    }

    var u_Matrix_MVP = gl.getUniformLocation(gl.program, 'u_Matrix_MVP');
    if (!u_Matrix_MVP)
    {
        console.log("Get Uniform Failed");
        return;
    }

    initEventHandler(canvas);

    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);
    var mvpMatrix = new Matrix4();

    var tick = function ()
    {
        mvpMatrix.setPerspective(45, 1, 0.1, 100);
        mvpMatrix.lookAt(0, 2, 6, 0, 0, 0, 0, 1, 0);
        mvpMatrix.rotate(currentAngle, 0, 1, 0);
        gl.uniformMatrix4fv(u_Matrix_MVP, false, mvpMatrix.elements);

        draw(gl, n);
        requestAnimationFrame(tick);
    }
    tick();
}

function initVertexBuffers(gl)
{
    var vertices = new Float32Array([   // Vertex coordinates
        1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,    // v0-v1-v2-v3 front
        1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0,    // v0-v3-v4-v5 right
        1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
        -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0,    // v1-v6-v7-v2 left
        -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,    // v7-v4-v3-v2 down
        1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0     // v4-v7-v6-v5 back
    ]);

    var texCoords = new Float32Array([   // Texture coordinates
        1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,    // v0-v1-v2-v3 front
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,    // v0-v3-v4-v5 right
        1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,    // v0-v5-v6-v1 up
        1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,    // v1-v6-v7-v2 left
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,    // v7-v4-v3-v2 down
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0     // v4-v7-v6-v5 back
    ]);

    // Indices of the vertices
    var indices = new Uint16Array([
        0, 1, 2, 0, 2, 3,    // front
        4, 5, 6, 4, 6, 7,    // right
        8, 9, 10, 8, 10, 11,    // up
        12, 13, 14, 12, 14, 15,    // left
        16, 17, 18, 16, 18, 19,    // down
        20, 21, 22, 20, 22, 23     // back
    ]);

    // Create a buffer object
    var indexBuffer = gl.createBuffer();
    if (!indexBuffer) return -1;

    // Write vertex information to buffer object
    if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position')) return -1; // Vertex coordinates
    if (!initArrayBuffer(gl, texCoords, 2, gl.FLOAT, 'a_TexCoord')) return -1;// Texture coordinates

    // Unbind the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Write the indices to the buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}

function initArrayBuffer(gl, data, num, type, attribute)
{
    // Create a buffer object
    var buffer = gl.createBuffer();
    if (!buffer)
    {
        console.log('Failed to create the buffer object');
        return false;
    }
    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    // Assign the buffer object to the attribute variable
    var a_attribute = gl.getAttribLocation(gl.program, attribute);
    if (a_attribute < 0)
    {
        console.log('Failed to get the storage location of ' + attribute);
        return false;
    }
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    // Enable the assignment to a_attribute variable
    gl.enableVertexAttribArray(a_attribute);

    return true;
}

function initAndLoadTexture(gl)
{
    var image = new Image();
    image.onload = function ()
    {
        loadTexture(gl, image);
    }
    image.src = '../../res/Image/test.jpg';
    return true;
}

function loadTexture(gl, image)
{
    var texture = gl.createTexture();
    if (!texture)
    {
        console.log('create texture fail');
        return false;
    }
    var u_Sampler_Tex = gl.getUniformLocation(gl.program, 'u_Sampler_Tex');
    if (!u_Sampler_Tex)
    {
        console.log("get sampler fail");
        return false;
    }

    // 翻转 Y 轴
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    // 开启 0 号纹理单元
    gl.activeTexture(gl.TEXTURE0);
    // 指定贴图对象为 2D 贴图
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // 设定贴图属性（缩小采样为线性）
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // 为贴图对象指定图片
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    // 把 0 号纹理单元指定给变量
    gl.uniform1i(u_Sampler_Tex, 0);
}

function initEventHandler(canvas)
{
    var drag = false;
    var lastX = -1;
    var lastY = -1;

    canvas.onmousedown = function (event)
    {
        var x = event.clientX;
        var y = event.clientY;
        drag = true;
        lastX = x;
        lastY = y;
    };

    canvas.onmouseup = function (event) { drag = false; };
    canvas.onmouseout = function (event) { drag = false; };

    canvas.onmousemove = function (event)
    {
        if (drag)
        {
            var x = event.clientX;
            var y = event.clientY;
            var factor = 100 / canvas.height;
            var dx = (x - lastX) * factor;
            var dy = (y - lastY) * factor;
            currentAngle += dx;
            lastX = x;
            lastY = y;
        }
    }
}

function draw(gl, n)
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
}