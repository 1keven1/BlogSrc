#version 100

#ifdef GL_ES
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
#endif

//Lighting
uniform vec3 u_LightColor;
uniform vec3 u_LightPos;
uniform vec3 u_AmibientColor;

varying vec4 v_Color;
varying vec3 v_WorldNormal;
varying vec3 v_WorldPos;

void main()
{
    vec3 worldNormal = normalize(v_WorldNormal);
    vec3 lightDir = normalize(u_LightPos - v_WorldPos);

    float nDotL = max(0.0, dot(worldNormal, lightDir));
    vec3 diffuse = v_Color.rgb * nDotL * u_LightColor;
    vec3 ambient = u_AmibientColor * v_Color.rgb;

    vec3 finalColor = diffuse + ambient;
    gl_FragColor = vec4(finalColor, 1);
}