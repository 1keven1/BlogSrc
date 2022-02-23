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

    loadShaderFile(gl, '5_PerspectiveView.vert', gl.VERTEX_SHADER);
    loadShaderFile(gl, '5_PerspectiveView.frag', gl.FRAGMENT_SHADER);
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

    var u_Matrix_P = gl.getUniformLocation(gl.program, 'u_Matrix_P');
    var u_Matrix_V = gl.getUniformLocation(gl.program, 'u_Matrix_V');
    if (!u_Matrix_P || !u_Matrix_V)
    {
        console.log("Get Uniform Failed");
        return;
    }

    gl.clearColor(0, 0, 0, 1);
    var projMatrix = new Matrix4();
    var viewMatrix = new Matrix4();

    viewMatrix.setLookAt(0, 0, 5, 0, 0, 0, 0, 1, 0);
    projMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);
    gl.uniformMatrix4fv(u_Matrix_V, false, viewMatrix.elements);
    gl.uniformMatrix4fv(u_Matrix_P, false, projMatrix.elements);

    draw(gl, n);
}

function initVertexBuffers(gl)
{
    var verticesColors = new Float32Array
        ([
            0.75, 1.0, -4.0, 0.4, 1.0, 0.4, 
            0.25, -1.0, -4.0, 0.4, 1.0, 0.4, 
            1.25, -1.0, -4.0, 1.0, 0.4, 0.4, 

            0.75, 1.0, -2.0, 1.0, 1.0, 0.4, 
            0.25, -1.0, -2.0, 1.0, 1.0, 0.4, 
            1.25, -1.0, -2.0, 1.0, 0.4, 0.4, 

            0.75, 1.0, 0.0, 0.4, 0.4, 1.0, 
            0.25, -1.0, 0.0, 0.4, 0.4, 1.0, 
            1.25, -1.0, 0.0, 1.0, 0.4, 0.4,
            
            -0.75, 1.0, -4.0, 0.4, 1.0, 0.4, 
            -1.25, -1.0, -4.0, 0.4, 1.0, 0.4, 
            -0.25, -1.0, -4.0, 1.0, 0.4, 0.4, 

            -0.75, 1.0, -2.0, 1.0, 1.0, 0.4, 
            -1.25, -1.0, -2.0, 1.0, 1.0, 0.4, 
            -0.25, -1.0, -2.0, 1.0, 0.4, 0.4, 

            -0.75, 1.0, -0.0, 0.4, 0.4, 1.0, 
            -1.25, -1.0, -0.0, 0.4, 0.4, 1.0, 
            -0.25, -1.0, -0.0, 1.0, 0.4, 0.4, 
        ]);
    var n = 18;
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

function draw(gl, n)
{
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, n);
}