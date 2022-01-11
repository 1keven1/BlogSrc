
// Load shader from file
function loadShaderFile(gl, fileName, shader) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status !== 404) {
            OnLoadShader(gl, request.responseText, shader);
        }
    }
    request.open('GET', fileName, true);
    request.send();
}

function OnLoadShader(gl, fileString, type) {
    if (type == gl.VERTEX_SHADER) {
        VSHADER_SOURCE = fileString;
    }
    else if (type == gl.FRAGMENT_SHADER) {
        FSHADER_SOURCE = fileString;
    }
    if (VSHADER_SOURCE && FSHADER_SOURCE) {
        // 开始渲染函数
        start(gl);
    }
}
