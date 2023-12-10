precision mediump float;
uniform float time;
uniform vec2  mouse;
uniform vec2  resolution;

const float PI = 3.14159265;
const float angle = 60.0;
const float fov = angle * 0.5 * PI / 180.0;

const float sphereSize = 1.0;
const vec3 lightDir = vec3(-0.577, 0.577, 0.577);

float distanceFunc(vec3 p){
    return length(p) - sphereSize;
}

vec3 getNormal(vec3 p){
    float d = 0.0001;
    return normalize(vec3(
        distanceFunc(p + vec3(  d, 0.0, 0.0)) - distanceFunc(p + vec3( -d, 0.0, 0.0)),
        distanceFunc(p + vec3(0.0,   d, 0.0)) - distanceFunc(p + vec3(0.0,  -d, 0.0)),
        distanceFunc(p + vec3(0.0, 0.0,   d)) - distanceFunc(p + vec3(0.0, 0.0,  -d))
    ));
}

void main(void){
    // fragment position
    vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    
    // camera
    vec3 cPos = vec3(0.0,  0.0,  2.0);
    vec3 cDir = vec3(0.0,  0.0, -1.0);
    vec3 cUp  = vec3(0.0,  1.0,  0.0);
    vec3 cSide = cross(cDir, cUp);
    float targetDepth = 1.0;
    
    // ray
    vec3 ray = normalize(vec3(sin(fov) * p.x, sin(fov) * p.y, -cos(fov)));
    
    // marching loop
    float distance = 0.0; // レイとオブジェクト間の最短距離
    float rLen = 0.0;     // レイに継ぎ足す長さ
    vec3  rPos = cPos;    // レイの先端位置
    for(int i = 0; i < 16; i++){
        distance = distanceFunc(rPos);
        rLen += distance;
        rPos = cPos + ray * rLen;
    }
    
    // hit check
    if(abs(distance) < 0.001){
        vec3 normal = getNormal(rPos);
        float diff = clamp(dot(lightDir, normal), 0.1, 1.0);
        gl_FragColor = vec4(vec3(diff), 1.0);
    }else{
        gl_FragColor = vec4(vec3(0.0), 1.0);
    }
}
