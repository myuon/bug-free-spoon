precision mediump float;
uniform float time;
uniform vec2  mouse;
uniform vec2  resolution;

const float PI = 3.14159265;
const float angle = 60.0;
const float fov = angle * 0.5 * PI / 180.0;

float rand(vec2 p){
    return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453);
}

vec3 randOnHemisphere(vec3 n){
    vec3 u = normalize(cross(n, vec3(0.0, 1.0, 0.0)));
    vec3 v = normalize(cross(u, n));
    float r1 = rand(vec2(float(n.x), 0.0));
    float r2 = rand(vec2(float(n.y), 0.0));
    float r = sqrt(r1);
    float theta = 2.0 * PI * r2;
    float x = r * cos(theta);
    float y = r * sin(theta);
    float z = sqrt(1.0 - r1);
    return u * x + v * y + n * z;
}

struct Circle {
    vec3 center;
    float radius;
    vec3 emission;
};

const Circle[] objects = Circle[](
    Circle(vec3(-0.577, 0.577, 0.577), 0.1, vec3(10.0, 0.2, 0.2)),
    Circle(vec3(0.577, 0.577, 0.577), 0.1, vec3(0.2, 0.2, 10.0)),
    Circle(vec3(0.0, 0.0, -2.0), 1.0, vec3(0.0, 0.1, 0.0)),
    Circle(vec3(0.0, 0.0, 0.0), 0.0, vec3(0.0, 0.0, 0.0))
);

struct Hit {
    float dist;
    int index;
    vec3 normal;
    vec3 point;
};

Hit intersect(vec3 origin, vec3 ray){
    Hit hit = Hit(10000.0, -1, vec3(0.0), vec3(0.0));
    for(int i = 0; i < objects.length(); i++){
        Circle obj = objects[i];
        float b = dot(ray, origin - obj.center);
        float c = dot(origin - obj.center, origin - obj.center) - obj.radius * obj.radius;
        float d = b * b - c;
        if(d > 0.001){
            float t1 = -b - sqrt(d);
            if(t1 > 0.001 && t1 < hit.dist){
                hit.dist = t1;
                hit.index = i;
                hit.point = origin + ray * t1;
                hit.normal = randOnHemisphere(normalize(hit.point - obj.center));
            }

            float t2 = -b + sqrt(d);
            if(t2 > 0.001 && t2 < hit.dist){
                hit.dist = t2;
                hit.index = i;
                hit.point = origin + ray * t2;
                hit.normal = randOnHemisphere(normalize(hit.point - obj.center));
            }
        }
    }

    return hit;
}

vec3 raytrace(vec3 ray, vec3 cPos, int count) {
    vec3 color = vec3(0.0);

    while (true) {
        Hit hit = intersect(cPos, ray);

        if(hit.index != -1 && count < 5){
            // return hit.normal;
            color += vec3(objects[hit.index].emission * pow(2.0, float(count)));

            if(rand(vec2(float(hit.point.x), float(hit.point.y))) < 0.5){
                ray = hit.normal;
                cPos = hit.point;
                count += 1;
                continue;
            }
        }

        return color;
    }
}

void main(void){
    // camera
    vec3 cPos = vec3(0.0,  0.0,  2.0);
    vec3 cDir = vec3(0.0,  0.0, -1.0);
    vec3 cUp  = vec3(0.0,  1.0,  0.0);
    vec3 cSide = cross(cDir, cUp);
    float targetDepth = 1.0;
    
    int count = 0;
    int spp = 16;
    vec3 color = vec3(0.0);
    for (int i = 0; i < spp; i++) {
        vec2 dp = vec2(rand(gl_FragCoord.xy + vec2(i,0)), rand(gl_FragCoord.xy + vec2(0,i)));
        vec2 p = ((gl_FragCoord.xy + dp) * 2.0 - resolution) / min(resolution.x, resolution.y);
        vec3 ray = normalize(vec3(sin(fov) * p.x, sin(fov) * p.y, -cos(fov)));

        color += raytrace(ray, cPos, count);
    }

    gl_FragColor = vec4(color / float(spp), 1.0);
}
