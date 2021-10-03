#version 300 es

// fragment shaders don't have a default precision so we need to pick one
// mediump is a good default; it means "medium precision"
precision mediump float;

// a uniform can be seen as a constant that you set once
uniform vec3 u_color;

// with webgl 2, we now have to define an out that will be the color of the fragment
out vec4 fragColor;

void main(void) {

    fragColor = vec4(u_color, 1.0);

}
