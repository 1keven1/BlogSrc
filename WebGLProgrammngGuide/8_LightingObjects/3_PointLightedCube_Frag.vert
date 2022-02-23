// Vertex Attribute
attribute vec4 a_Position;
attribute vec4 a_Color;
attribute vec4 a_Normal;
// Matrix
uniform mat4 u_Matrix_M;
uniform mat4 u_Matrix_M_IT;
uniform mat4 u_Matrix_MVP;

//Lighting
uniform vec3 u_LightColor;
uniform vec3 u_LightPos;
uniform vec3 u_AmibientColor;

varying vec4 v_Color;
varying vec3 v_WorldNormal;
varying vec3 v_WorldPos;
void main()
{
    gl_Position = u_Matrix_MVP * a_Position;
    vec3 worldPos = (u_Matrix_M * a_Position).xyz;
    vec3 worldNormal = normalize(u_Matrix_M_IT * vec4(a_Normal.xyz, 0.0)).xyz;

    v_Color = a_Color;
    v_WorldPos = worldPos;
    v_WorldNormal = worldNormal;
}