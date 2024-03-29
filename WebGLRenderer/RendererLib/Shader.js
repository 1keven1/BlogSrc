'use strict';
class Shader
{
    /**
     * 着色器 由顶点着色器和片元着色器文件组成
     * @param {String} vShaderFile 顶点着色器路径
     * @param {String} fShaderFile 片元着色器路径
     */
    constructor(vShaderFile, fShaderFile)
    {
        this.vShaderFile = vShaderFile;
        this.fShaderFile = fShaderFile;
        this.vShaderSource = null;
        this.fShaderSource = null;
        this.program = null;
        this.bLoaded = false;

        this.vShaderName = vShaderFile.split('/')[vShaderFile.split('/').length - 1];
        this.fShaderName = fShaderFile.split('/')[fShaderFile.split('/').length - 1];

        this.a_Position = -1;
        this.a_TexCoord = -1;
        this.a_Normal = -1;
        this.a_Tangent = -1;
        this.u_Matrix_MVP = null;
        this.u_Matrix_M_I = null;
        this.u_LightPos = null;
        this.u_LightColor = null;
        this.u_CameraPos = null;
        this.u_Matrix_Light = null;
        this.u_ShadowMap = null;
    }

    load()
    {
        this.bLoaded = true;
        this.readShaderFile()
    }

    loadOver() { }

    readShaderFile()
    {
        let vRequest = new XMLHttpRequest();
        let fRequest = new XMLHttpRequest();

        vRequest.onreadystatechange = () =>
        {
            if (vRequest.readyState === 4 && vRequest.status !== 404)
            {
                this.vShaderSource = vRequest.responseText;
                if (this.vShaderSource && this.fShaderSource) this.compileShader();
            }
        }
        fRequest.onreadystatechange = () =>
        {
            if (fRequest.readyState === 4 && fRequest.status !== 404)
            {
                this.fShaderSource = fRequest.responseText;
                if (this.vShaderSource && this.fShaderSource) this.compileShader();
            }
        }

        vRequest.open('GET', this.vShaderFile, true);
        vRequest.send();
        fRequest.open('GET', this.fShaderFile, true);
        fRequest.send();
    }

    compileShader()
    {
        this.program = createProgram(gl, this.vShaderSource, this.fShaderSource);
        if (!this.program)
        {
            console.error(this.vShaderFile + '：编译失败');
        }
        this.initProperties();
        if (this.loadOver) this.loadOver();
    }

    initProperties()
    {
        // 初始化必要Shader变量
        this.a_Position = gl.getAttribLocation(this.program, 'a_Position');
        this.a_TexCoord = gl.getAttribLocation(this.program, 'a_TexCoord');
        this.a_Normal = gl.getAttribLocation(this.program, 'a_Normal');
        this.a_Tangent = gl.getAttribLocation(this.program, 'a_Tangent');

        this.u_Matrix_MVP = gl.getUniformLocation(this.program, 'u_Matrix_MVP');
        this.u_Matrix_M_I = gl.getUniformLocation(this.program, 'u_Matrix_M_I');
        this.u_Matrix_M = gl.getUniformLocation(this.program, 'u_Matrix_M');
        this.u_LightPos = gl.getUniformLocation(this.program, 'u_LightPos');
        this.u_LightColor = gl.getUniformLocation(this.program, 'u_LightColor');
        this.u_CameraPos = gl.getUniformLocation(this.program, 'u_CameraPos');
        this.u_Matrix_Light = gl.getUniformLocation(this.program, 'u_Matrix_Light');
        this.u_ShadowMap = gl.getUniformLocation(this.program, 'u_ShadowMap');
        this.u_ShadowMap_TexelSize = gl.getUniformLocation(this.program, 'u_ShadowMap_TexelSize');

        this.u_AmbientColor = gl.getUniformLocation(this.program, 'u_AmbientColor');
        this.u_AmbientCubeMap = gl.getUniformLocation(this.program, 'u_AmbientCubeMap');
        this.u_AmbientCubeMap_TexelSize = gl.getUniformLocation(this.program, 'u_AmbientCubeMap_TexelSize');
    }

    VS(){
        let o = new Object();
        o.target = this;
        o.type = CODE_TYPE.VSHADER;
        o.shaderName = this.vShaderName;
        o.shaderSource = this.vShaderSource;
        return o;
    }

    FS(){
        let o = new Object();
        o.target = this;
        o.type = CODE_TYPE.FSHADER;
        o.shaderName = this.fShaderName;
        o.shaderSource = this.fShaderSource;
        return o;
    }

    applyChange(vSource, fSource)
    {
        this.vShaderSource = vSource;
        this.fShaderSource = fSource;

        this.compileShader();
    }
}