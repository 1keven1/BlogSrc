attribute vec4 a_Position;
attribute vec4 a_TexCoord;
uniform mat4 u_Matrix_MVP;

varying vec4 v_TexCoord;
void main()
{
    gl_Position = u_Matrix_MVP * a_Position;
    v_TexCoord = a_TexCoord;
}