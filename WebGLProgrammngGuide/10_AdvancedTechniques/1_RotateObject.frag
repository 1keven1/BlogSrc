#version 100

#ifdef GL_ES
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
#endif

uniform sampler2D u_Sampler_Tex;

varying vec4 v_TexCoord;
void main()
{
    gl_FragColor = texture2D(u_Sampler_Tex, v_TexCoord.xy);
    // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}