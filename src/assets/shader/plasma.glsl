precision mediump float;

uniform sampler2D uMainSampler;
uniform vec2 u_resolution;
uniform float u_time;

varying vec2 outTexCoord;
varying vec4 outTint;

vec4 plasma()
{
  vec2 pixelPos = outTexCoord * 40.0;
  float freq = 0.8;
  float value =
      sin(u_time + pixelPos.x * freq) +
      sin(u_time + pixelPos.y * freq) +
      sin(u_time + (pixelPos.x + pixelPos.y) * freq) +
      cos(u_time + sqrt(length(pixelPos - 0.5)) * freq * 2.0);

  vec4 outColor = vec4(
      cos(value),
      sin(value),
      sin(value * 3.14 * 2.0),
      cos(value)
  );

  return clamp(outColor, vec4(0.2, 0.2, 0.2, 0.2), vec4(1.0, 1.0, 1.0, 1.0));
}

void main()
{
  vec4 texel = texture2D(uMainSampler, outTexCoord);
  texel *= vec4(outTint.rgb * outTint.a, outTint.a);
  gl_FragColor = texel * plasma();
}