var canvas;
var gl;
var program;
var modelViewMatrix = mat4();  // Model-view matrix
var theta = [0, 0, 0];  // Initial angles for rotation
var BASE_HEIGHT = 2.0;  // Adjust as needed
var LOWER_ARM_HEIGHT = 5.0;  // Adjust as needed

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    // Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Set up event listeners for rotation controls, if any

    // Call the render function
    render();
};

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw the base
    modelViewMatrix = rotate(theta[0], 0, 1, 0);
    base(modelViewMatrix);

    // Draw the lower arm
    var lowerArmTransform = mult(translate(0.0, BASE_HEIGHT, 0.0), rotate(theta[1], 0, 0, 1));
    modelViewMatrix = mult(modelViewMatrix, lowerArmTransform);
    lowerArm(modelViewMatrix);

    // Draw the upper arm
    var upperArmTransform = mult(translate(0.0, LOWER_ARM_HEIGHT, 0.0), rotate(theta[2], 0, 0, 1));
    modelViewMatrix = mult(modelViewMatrix, upperArmTransform);
    upperArm(modelViewMatrix);

    // Request the next animation frame
    requestAnimFrame(render);
}

function base(modelViewMatrix) {
    // Define vertices for a simple rectangular base
    var vertices = [
        vec4(-1.0, -0.1, -1.0, 1.0),
        vec4(1.0, -0.1, -1.0, 1.0),
        vec4(1.0, -0.1, 1.0, 1.0),
        vec4(-1.0, -0.1, 1.0, 1.0)
    ];

    // Create a buffer and put the vertices in it
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Associate shader variables with buffer data
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Set the model-view matrix uniform in the shader
    var modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    // Draw the base
    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length);
}

function lowerArm(modelViewMatrix) {
    // Define vertices for a simple rectangular lower arm
    var vertices = [
        vec4(-0.5, 0.0, -0.5, 1.0),
        vec4(0.5, 0.0, -0.5, 1.0),
        vec4(0.5, -2.0, -0.5, 1.0),
        vec4(-0.5, -2.0, -0.5, 1.0)
    ];

    // Create a buffer and put the vertices in it
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Associate shader variables with buffer data
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Set the model-view matrix uniform in the shader
    var modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    // Draw the lower arm
    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length);
}

function upperArm(modelViewMatrix) {
    // Define vertices for a simple rectangular upper arm
    var vertices = [
        vec4(-0.3, 0.0, -0.3, 1.0),
        vec4(0.3, 0.0, -0.3, 1.0),
        vec4(0.3, -4.0, -0.3, 1.0),
        vec4(-0.3, -4.0, -0.3, 1.0)
    ];

    // Create a buffer and put the vertices in it
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Associate shader variables with buffer data
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Set the model-view matrix uniform in the shader
    var modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    // Draw the upper arm
    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length);
}









// function figure() {
//     mvStack.push(modelViewMatrix);
//     torso();
//     modelviewMatrix  =  mult(modelViewMatrix,  translate); modelViewMatrix  =  mult(modelViewMatrix,  rotate); head();
//     modelViewMatrix  =  mvStack.pop(); mvStack.push(modelViewMatrix); modelviewMatrix  =  mult(modelViewMatrix,  translate); modelViewMatrix  =  mult(modelViewMatrix,  rotate); leftUpperArm();
//     modelViewMatrix  =  mvStack.pop(); mvStack.push(modelViewMatrix); modelviewMatrix  =  mult(modelViewMatrix,  translate); modelViewMatrix  =  mult(modelViewMatrix,  rotate); leftLowerArm();
//     modelViewMatrix  =  mvStack.pop(); mvStack.push(modelViewMatrix); modelview  =  mult(modelViewMatrix,  translate); modelViewMatrix  =  mult(modelViewMatrix,  rotate); rightUpperArm();
//     modelViewMatrix = stack.pop(); mvStack.push(modelViewMatrix);
// }

// function torso() {
//     instanceMatrix  =  mult(modelViewMatrix,
//     translate(0.0,  0.5*torsoHeight,  0.0)); instanceMatrix  =  mult(instanceMatrix,
//     scale4(torsoWidth,  torsoHeight,  torsoWidth)); gl.uniformMatrix4fv(modelViewMatrixLoc,  false,  flatten(instance));
//     for  (var  i  =  0;  i  <  6;  ++i)  {
//         gl.drawArrays(gl.TRIANGLE_FAN,  4*i,  4);
//     }
// }
