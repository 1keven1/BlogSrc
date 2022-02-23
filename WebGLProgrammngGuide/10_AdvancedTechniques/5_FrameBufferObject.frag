#version 100

#ifdef GL_ES
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
#endif

uniform mat4 u_Matrix_M_I;
uniform mat4 u_Matrix_MVP;
uniform vec4 u_LightPos;
uniform vec4 u_LightColor;

uniform sampler2D u_Sampler_Tex;

varying vec4 v_TexCoord;
varying vec3 v_WorldNormal;
void main()
{
    vec3 finalColor = texture2D(u_Sampler_Tex, v_TexCoord.xy).rgb;
    gl_FragColor = vec4(finalColor, 1.0);
}