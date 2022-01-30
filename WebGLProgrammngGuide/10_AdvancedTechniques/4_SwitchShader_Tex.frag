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
varying vec3 v_WorldNormal;

void main()
{
    
    gl_FragColor = texture2D(u_Sampler_Tex, v_TexCoord.xy);
}