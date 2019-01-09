precision mediump float;

varying vec2 outTexCoord;

uniform sampler2D u_texture;
uniform vec2 u_cloud_offset;
uniform vec2 u_resolution;
uniform float u_dayProgress;
uniform float u_brightness;

float random(in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))
                 * 43758.5453123);
}

// 2D Noise based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise(in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f * f * (3.0 - 2.0 * f);

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  vec2 pos = vec2(st * 2.0);

  float n = noise(pos + u_cloud_offset);
  float steppedNoise = max(smoothstep(0.5, 1.0, n), 0.35);

  vec3 color = texture2D(u_texture, outTexCoord).rgb;

  // Apply contrast and brigthness.
  color = ((color - 0.5) * max(1.0, 0.0)) + 0.5;
  color.rgb += 0.1;

  color.r += color.r * u_dayProgress;
  color.g += color.g * u_dayProgress * 0.2;
  color.b += color.b * u_dayProgress * 0.2;

  gl_FragColor = vec4(color * steppedNoise, 1.0);
}