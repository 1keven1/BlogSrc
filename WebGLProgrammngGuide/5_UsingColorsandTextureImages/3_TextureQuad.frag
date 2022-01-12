precision mediump float;
uniform sampler2D u_Sampler;
varying vec2 v_TexCoord;
void main()
{
    gl_FragColor = texture2D(u_Sampler, v_TexCoord);
    //gl_FragColor = vec4(v_TexCoord.x, v_TexCoord.y, 0, 1);
}   