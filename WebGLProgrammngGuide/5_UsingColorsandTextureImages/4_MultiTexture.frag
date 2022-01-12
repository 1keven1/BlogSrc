precision mediump float;
uniform sampler2D u_Sampler_Base;
uniform sampler2D u_Sampler_Mask;
varying vec2 v_TexCoord;
void main()
{
    vec3 baseColor = texture2D(u_Sampler_Base,v_TexCoord).rgb;
    float mask = texture2D(u_Sampler_Mask, v_TexCoord).r;
    gl_FragColor = vec4(baseColor * mask, 1);
    //gl_FragColor = vec4(v_TexCoord.x, v_TexCoord.y, 0, 1);
}   