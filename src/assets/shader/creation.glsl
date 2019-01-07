// http://www.pouet.net/prod.php?which=57245
// If you intend to reuse this shader, please add credits to 'Danilo Guanabara'
precision mediump float;

// https://www.shadertoy.com/view/MtlBDf

varying vec2 outTexCoord;

uniform float u_time;
uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform float u_fade;

#define t u_time
#define r u_resolution.xy

void main( void ) {
	vec3 c;
	float l,z=t;
	for(int i=0;i<3;i++) {
    vec2 uv,p=outTexCoord.xy;
		uv=p;
		p-=.5;
		p.x*=r.x/r.y;
		z+=.07;
		l=length(p);
		uv+=p/l*(sin(z)+1.)*abs(sin(l*9.-z*2.));
		c[i]=.01/length(abs(mod(uv,1.)-.5));
	}

	gl_FragColor=vec4(u_fade * c / l, t);
}