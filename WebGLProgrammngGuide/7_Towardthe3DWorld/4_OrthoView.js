var VSHADER_SOURCE = null;
var FSHADER_SOURCE = null;

var canvas;
var near = 0.0, far = 0.5;
function main()
{
    canvas = document.getElementById("webgl");
    var gl = getWebGLContext(canvas);
    if (!gl)
    {
        console.log("Get WebGL Render Context Failed");
        return;
    }

    loadShaderFile(gl, '4_OrthoView.vert', gl.VERTEX_SHADER);
    loadShaderFile(gl, '4_OrthoView.frag', gl.FRAGMENT_SHADER);
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

    // 获取文字位置
    var textNF = document.getElementById('nearFar');
    var u_Matrix_P = gl.getUniformLocation(gl.program, 'u_Matrix_P');
    if (!u_Matrix_P)
    {
        console.log("Get Uniform Failed");
        return;
    }

    gl.clearColor(0, 0, 0, 1);
    var projMatrix = new Matrix4();

    // 注册按键按下事件
    document.onkeydown = function (event)
    {
        keydown(event, gl, n, u_Matrix_P, projMatrix, textNF);
    }

    textNF.innerHTML = 'near: ' + Math.round(near * 100) / 100 + ", Far: " + Math.round(far * 100) / 100;
    draw(gl, n, u_Matrix_P, projMatrix);
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

function keydown(event, gl, n, u_Matrix_P, projMatrix, text)
{
    // 按键改变远近剪裁平面
    switch (event.keyCode)
    {
        case 39: // right arrow
            near += 0.01;
            break;
        case 37: // left arrow
            near -= 0.01;
            break;
        case 38: // up arrow
            far += 0.01;
            break;
        case 40: // down arrow
            far -= 0.01;
            break;
        default:
            return;
    }

    text.innerHTML = 'near: ' + Math.round(near * 100) / 100 + ", Far: " + Math.round(far * 100) / 100;
    projMatrix.setOrtho(-1, 1, -1, 1, near, far);
    draw(gl, n, u_Matrix_P, projMatrix);
}

function draw(gl, n, u_Matrix_P, projMatrix)
{
    gl.uniformMatrix4fv(u_Matrix_P, false, projMatrix.elements);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, n);
}