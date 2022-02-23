// Vertex Attribute
attribute vec4 a_Position;
attribute vec4 a_Color;
attribute vec4 a_Normal;
// Matrix
uniform mat4 u_Matrix_M;
uniform mat4 u_Matrix_MVP;
//Lighting
uniform vec3 u_LightColor;
uniform vec3 u_LightDir;
uniform vec3 u_AmibientColor;

varying vec4 v_Color;
void main()
{
    gl_Position = u_Matrix_MVP * a_Position;
    vec3 worldNormal = normalize(u_Matrix_M * vec4(a_Normal.xyz, 0.0)).xyz;
    float nDotL = max(0.0, dot(u_LightDir, worldNormal));
    vec3 diffuse = u_LightColor * a_Color.xyz * nDotL;
    vec3 ambient = u_AmibientColor * a_Color.rgb;

    vec3 finalColor = diffuse + ambient;
    v_Color = vec4(finalColor, a_Color.a);
}