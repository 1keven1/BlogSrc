function main() {
    //获取<canvas>元素
    var canvas = document.getElementById('webgl');
    if(!canvas)
    {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }
    
    //获取WebGl绘图上下文
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    //清空canvas
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}
