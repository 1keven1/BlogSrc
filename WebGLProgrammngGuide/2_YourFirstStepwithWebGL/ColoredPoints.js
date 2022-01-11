// Vertex Shader
var VSHADER_SOURCE = null;
//Fragment Shader
var FSHADER_SOURCE = null;

var canvas;

function main()
{
    // 获取Canvas
    canvas = document.getElementById('webgl');

    // 获取WebGL
    var gl = getWebGLContext(canvas);
    if(!gl)
    {
        console.log("Failed to get rendering context for WebGL");
        return;
    }

    // 加载Shader
    loadShaderFile(gl, 'ColoredPoints.vert', gl.VERTEX_SHADER);
    loadShaderFile(gl, 'ColoredPoints.frag', gl.FRAGMENT_SHADER);
}

// 开始渲染
function start(gl) {
    // 初始化Shader
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders.');
        return;
    }

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    var u_PointColor = gl.getUniformLocation(gl.program, 'u_PointColor');
    if(a_Position < 0 || !u_PointColor)
    {
        console.log('Get Attribute failed');
        return;
    }

    // 绑定点击事件
    canvas.onmousedown = function(event){ click(event, gl, a_Position, u_PointColor); };

    //设置清屏颜色
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_Points = [];

// 点的结构体
function Point(x, y)
{
    this.x = x;
    this.y = y;
    var color = [];
}

function click(event, gl, a_Position, u_PointColor)
{

    var x = event.clientX;
    var y = event.clientY;
    var rect = event.target.getBoundingClientRect();

    // 映射坐标到WebGL坐标系
    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    var point = new Point(x, y);
    var r = x / 2 + 0.5;
    var g = y / 2 + 0.5;
    var b = 1 - x - y;
    point.color = [r, g, b, 1];
    g_Points.push(point);

    gl.clear(gl.COLOR_BUFFER_BIT);

    // 绘制循环
    for(var i = 0; i < g_Points.length; i++)
    {
        gl.vertexAttrib3f(a_Position, g_Points[i].x, g_Points[i].y, 0.0);
        var color = g_Points[i].color;
        gl.uniform4f(u_PointColor, color[0], color[1], color[2], color[3]);
        gl.drawArrays(gl.POINTS, 0, 1);
    }
}