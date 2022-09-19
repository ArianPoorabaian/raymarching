varying vec2 vUv;
varying vec3 vNormal;

uniform vec4 uResolution;
uniform vec2 uMouse;
uniform float uTime;
uniform float uNumber;
uniform sampler2D uTexture;


float PI=3.14159265359;

vec2 getMatcap(vec3 eye, vec3 normal) {
  vec3 reflected = reflect(eye, normal);
  float m = 2.8284271247461903 * sqrt( reflected.z+1.0 );
  return reflected.xy / m + 0.5;
}

mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
	mat4 m = rotationMatrix(axis, angle);
	return (m * vec4(v, 1.0)).xyz;
}

// polynomial smooth min 1 (k=0.1)
float smin( float a, float b, float k )
{
    float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
    return mix( b, a, h ) - k*h*(1.0-h);
}


float sdBox( vec3 p, vec3 b )
{
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float sdSphere( vec3 p, float s )
{
  return length(p)-s;
}


float sdfMesh(vec3 p){
    vec3 newP = rotate(p,vec3(1.0),uTime / 2.0);

    //Mouse
    vec3 mouseDot= vec3(uMouse.x * 2.0 ,uMouse.y , 0.0);
    float mouseSphere= sdSphere(p - mouseDot , 0.075);

    //Cube
    float cube = sdBox(newP,vec3(0.2));

    //Sphere
    float sphere = sdSphere(newP,0.4);

    //Mixing cube and sphere 
    float result = mix(cube , sphere , uNumber);
    return smin(result,mouseSphere,0.5);
}


vec3 calcNormal( in vec3 p ) // for function f(p)
{
    const float eps = 0.0001; // or some other value
    const vec2 h = vec2(eps,0);
    return normalize( vec3(sdfMesh(p+h.xyy) - sdfMesh(p-h.xyy),
                           sdfMesh(p+h.yxy) - sdfMesh(p-h.yxy),
                           sdfMesh(p+h.yyx) - sdfMesh(p-h.yyx) ) );
}


void main(){
    float distToCenter =  length(vUv - vec2(0.5)); //distance to center
    vec3 backGround = mix(vec3(0.3),vec3(0.0),distToCenter);
    vec2 newUV =uResolution.zw * (vUv - vec2(0.5));
    vec3 cameraPosition = vec3(0.0 , 0.0 , 2.0);
    vec3 ray = normalize(vec3 ( newUV, -1.0));
    
    float v = 0.0;

    for(int i=0 ; i<256 ; i++){
        vec3 position = v*ray + cameraPosition;
        float circleR = sdfMesh(position);
        if(circleR<0.0001) break;
        if(v>10.0) break;
        v+=circleR;
    }
    
    vec3 color = backGround;
    if(10.0>v){
        vec3 position = v*ray + cameraPosition;
        vec3 normal = calcNormal(position);
        vec2 matcapUV=getMatcap(ray,normal);
        color = texture2D(uTexture,matcapUV).rgb;

        float fresnel = pow( 1.0 + dot(ray,normal) , 4.0);
        color = mix(color,backGround ,fresnel); 
    }

    gl_FragColor=vec4(color, 1.);
}