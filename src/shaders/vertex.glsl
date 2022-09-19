varying vec2 vUv;
varying vec3 vNormal;

uniform float uTime;

void main(){
    vec4 modelPosition=modelMatrix*vec4(position,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    gl_Position=projectionMatrix*viewPosition;

    vUv=uv;
    vNormal=normal;
}