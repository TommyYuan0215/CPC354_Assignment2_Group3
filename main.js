// =============================================================================
// ======================= Splash Screen Init===================================
// =============================================================================

document.addEventListener("DOMContentLoaded", function () {
    // Select the splash screen element
    var splashScreen = document.getElementById("splash-screen");
    var amHome = document.getElementById("articulated-model-home");

    // Hide the splash screen after a delay (e.g., 2000 milliseconds or 2 seconds)
    setTimeout(function () {
        splashScreen.style.display = "none";
        // Additional logic or code can be added here for what should happen after the splash screen disappears
        amHome.style.display = "block";
    }, 1000);

})


// =============================================================================
// ======================= Variable Initialize==================================
// =============================================================================

// Disclaimer:
// 1. We use figure.js from angelChapter10 source code as the main source code for hierarchical model.
// 2. We also applied the phong shading code from the external website https://www.cs.toronto.edu/~jacobson/phong-demo/ 
//    as inspiration for the vertex shader and fragment shader.


var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;

var instanceMatrix;

var modelViewMatrixLoc;

var vertices = [
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0)
];

// Camera Function Init
var eye = vec3(0, 0, 10); // Initial camera position
var at = vec3(0, 0, 0);   // Look-at point
var up = vec3(0, 1, 0);   // Up vector

var torsoId = 0;
var headId = 1;
var head1Id = 1;
var head2Id = 10;
var leftUpperArmId = 2;
var leftLowerArmId = 3;
var rightUpperArmId = 4;
var rightLowerArmId = 5;
var leftUpperLegId = 6;
var leftLowerLegId = 7;
var rightUpperLegId = 8;
var rightLowerLegId = 9;

var GLOBAL_X_COORDINATE = 10;
var GLOBAL_Y_COORDINATE = 11;

var torsoHeight = 6.0;
var torsoWidth = 2.0;
var upperArmHeight = 3.0;
var lowerArmHeight = 2.0;
var upperArmWidth = 0.5;
var lowerArmWidth = 0.4;
var upperLegWidth = 0.5;
var lowerLegWidth = 0.4;
var lowerLegHeight = 2.0;
var upperLegHeight = 3.0;
var headHeight = 2.0;
var headWidth = 1.0;

var numNodes = 10;
var numAngles = 11;
var angle = 0;

// TorsoId, head1, left upper arm, left lower arm, right upper arm, right lower arm, left upper leg, left lower leg, 
// right upper leg, right lower leg, head2
var theta = [60, 0, -160, 60, 160, -60, -180, 10, 180, -10, 0];

var numVertices = 24;

var stack = [];

var figure = [];

for (var i = 0; i < numNodes; i++) figure[i] = createNode(null, null, null, null);

var vBuffer;
var modelViewLoc;

var pointsArray = [];

// Lighting Element
var ambientProduct;
var diffuseProduct;
var specularProduct;

// Set initial values for the light and material properties
var lightPosition = vec4(1.0, 2.0, 3.0, 1.0);
var lightAmbient = vec4(0.5, 0.5, 0.1, 1.0);
var lightDiffuse = vec4(0.7, 0.7, 0.1, 1.0);
var lightSpecular = vec4(0.5, 0.5, 0.1, 1.0);

// Variables used to link to vertex shader
var lightPositionLoc;
var KaLoc, KdLoc, KsLoc;

var Ka = 1.0;
var Kd = 1.0;
var Ks = 1.0;
var materialAmbient = vec4(0.0, 0.6, 1.0, 1.0);
var materialDiffuse = vec4(0.9, 0.5, 0.0, 1.0);
var materialSpecular = vec4(0.5, 0.5, 0.5, 1.0);
var materialShininess = 80.0;

// Variables used to link to vertex shader
var lightPositionLoc;
var ambientProductLoc, diffuseProductLoc, specularProductLoc;
var shininessLoc;

function updateLightSource() {
    gl.uniform3fv(lightPositionLoc, vec3(0.0, 0.0, 1.0));

    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));

    // Link to shininess of the material
    shininessLoc = gl.getUniformLocation(program, "shininess");

    // Link to coefficient of reflection
    KaLoc = gl.getUniformLocation(program, "Ka");
    KdLoc = gl.getUniformLocation(program, "Kd");
    KsLoc = gl.getUniformLocation(program, "Ks");

    render();
}


//-------------------------------------------

function scale4(a, b, c) {
    var result = mat4();
    result[0][0] = a;
    result[1][1] = b;
    result[2][2] = c;
    return result;
}

// =============================================================================
// =====================Hierarchical Model Initialize Phrase====================
// =============================================================================

function createNode(transform, render, sibling, child) {
    var node = {
        transform: transform,
        render: render,
        sibling: sibling,
        child: child,
    }
    return node;
}


function initNodes(Id) {

    var m = mat4();

    switch (Id) {

        case torsoId:
            m = rotate(theta[torsoId], 0, 1, 0);

            figure[torsoId] = createNode(m, torso, null, headId);
            break;

        case headId:
        case head1Id:
        case head2Id:


            m = translate(0.0, torsoHeight + 0.5 * headHeight, 0.0);
            m = mult(m, rotate(theta[head1Id], 1, 0, 0))
            m = mult(m, rotate(theta[head2Id], 0, 1, 0));
            m = mult(m, translate(0.0, -0.5 * headHeight, 0.0));
            figure[headId] = createNode(m, head, leftUpperArmId, null);
            break;


        case leftUpperArmId:

            m = translate(-(torsoWidth + upperArmWidth), 0.9 * torsoHeight, 0.0);
            m = mult(m, rotate(theta[leftUpperArmId], 1, 0, 0));
            figure[leftUpperArmId] = createNode(m, leftUpperArm, rightUpperArmId, leftLowerArmId);
            break;

        case rightUpperArmId:

            m = translate(torsoWidth + upperArmWidth, 0.9 * torsoHeight, 0.0);
            m = mult(m, rotate(theta[rightUpperArmId], 1, 0, 0));
            figure[rightUpperArmId] = createNode(m, rightUpperArm, leftUpperLegId, rightLowerArmId);
            break;

        case leftUpperLegId:

            m = translate(-(torsoWidth + upperLegWidth), 0.1 * upperLegHeight, 0.0);
            m = mult(m, rotate(theta[leftUpperLegId], 1, 0, 0));
            figure[leftUpperLegId] = createNode(m, leftUpperLeg, rightUpperLegId, leftLowerLegId);
            break;

        case rightUpperLegId:

            m = translate(torsoWidth + upperLegWidth, 0.1 * upperLegHeight, 0.0);
            m = mult(m, rotate(theta[rightUpperLegId], 1, 0, 0));
            figure[rightUpperLegId] = createNode(m, rightUpperLeg, null, rightLowerLegId);
            break;

        case leftLowerArmId:

            m = translate(0.0, upperArmHeight, 0.0);
            m = mult(m, rotate(theta[leftLowerArmId], 1, 0, 0));
            figure[leftLowerArmId] = createNode(m, leftLowerArm, null, null);
            break;

        case rightLowerArmId:

            m = translate(0.0, upperArmHeight, 0.0);
            m = mult(m, rotate(theta[rightLowerArmId], 1, 0, 0));
            figure[rightLowerArmId] = createNode(m, rightLowerArm, null, null);
            break;

        case leftLowerLegId:

            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(theta[leftLowerLegId], 1, 0, 0));
            figure[leftLowerLegId] = createNode(m, leftLowerLeg, null, null);
            break;

        case rightLowerLegId:

            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(theta[rightLowerLegId], 1, 0, 0));
            figure[rightLowerLegId] = createNode(m, rightLowerLeg, null, null);
            break;

    }

}

// =============================================================================
// =========================Hierarchical Model Function=========================
// =============================================================================

function traverse(Id) {

    if (Id == null) return;
    stack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
    figure[Id].render();
    if (figure[Id].child != null) traverse(figure[Id].child);
    modelViewMatrix = stack.pop();
    if (figure[Id].sibling != null) traverse(figure[Id].sibling);
}

function torso() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * torsoHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(torsoWidth, torsoHeight, torsoWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    }
}

function head() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(headWidth, headHeight, headWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    }
}

function leftUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    }
}

function leftLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    }
}

function rightUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    }
}

function rightLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    }
}

function leftUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    }
}

function leftLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    }
}

function rightUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    }
}

function rightLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth))
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    }
}

function quad(a, b, c, d) {
    pointsArray.push(vertices[a]);
    pointsArray.push(vertices[b]);
    pointsArray.push(vertices[c]);
    pointsArray.push(vertices[d]);
}


function cube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

// =============================================================================
// =========================Initialize Function=================================
// =============================================================================

window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);

    //  Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    instanceMatrix = mat4();

    projectionMatrix = ortho(-20.0, 20.0, -15.0, 15.0, -30.0, 30.0);
    modelViewMatrix = lookAt(eye, at, up);

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")

    cube();

    vBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);



    // Set the initial values for the uniforms in the shader
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(program, "Ka"), Ka);
    gl.uniform1f(gl.getUniformLocation(program, "Kd"), Kd);
    gl.uniform1f(gl.getUniformLocation(program, "Ks"), Ks);
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(mult(lightAmbient, materialAmbient)));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(mult(lightDiffuse, materialDiffuse)));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(mult(lightSpecular, materialSpecular)));
    gl.uniform1i(gl.getUniformLocation(program, "mode"), 1);  // Default mode is 1
    gl.uniform4fv(lightPositionLoc, flatten(lightPosition));
    gl.uniform1f(shininessLoc, materialShininess);
    gl.uniform1f(KaLoc, Ka);
    gl.uniform1f(KdLoc, Kd);
    gl.uniform1f(KsLoc, Ks);

    // =============================================================================
    // ======================Output Bubble Initialize Value=========================
    // =============================================================================

    // Initial State for each of the output value 
    document.getElementById("head1_output").textContent = 0;
    document.getElementById("head2_output").textContent = 0;
    document.getElementById("leftupperarm_output").textContent = -160;
    document.getElementById("leftlowerarm_output").textContent = 60;
    document.getElementById("rightupperarm_output").textContent = 160;
    document.getElementById("rightlowerarm_output").textContent = -60;
    document.getElementById("leftupperleg_output").textContent = 180;
    document.getElementById("leftlowerleg_output").textContent = 10;
    document.getElementById("rightupperleg_output").textContent = 180;
    document.getElementById("rightlowerleg_output").textContent = -10;
    document.getElementById("positionX_output").textContent = 0;
    document.getElementById("positionY_output").textContent = 0;
    document.getElementById("ambientReflectionValue").textContent = 1.0;
    document.getElementById("diffuseReflectionValue").textContent = 1.0;
    document.getElementById("specularReflectionValue").textContent = 1.0;
    document.getElementById("shininessValue").textContent = 80;
    document.getElementById("lightxValue").textContent = 1;
    document.getElementById("lightyValue").textContent = 1;
    document.getElementById("lightzValue").textContent = -1;
    document.getElementById("ambientLightValue").textContent = 0.5
    document.getElementById("diffuseLightValue").textContent = 0.7;
    document.getElementById("specularLightValue").textContent = 0.5;
    document.getElementById("cameraXValue").textContent = 0;
    document.getElementById("cameraYValue").textContent = 0;
    document.getElementById("cameraZValue").textContent = 10;

    document.getElementById("bgBrightnessOutput").textContent = 50;


    // =============================================================================
    // ======================Hierarchical Event Listener============================
    // =============================================================================

    document.getElementById("slider1").oninput = function () {
        SliderValue = event.srcElement.value;
        theta[head1Id] = SliderValue;
        document.getElementById("head1_output").textContent = SliderValue;
        initNodes(head1Id);
    };

    document.getElementById("slider2").oninput = function () {
        SliderValue = event.srcElement.value;
        theta[leftUpperArmId] = SliderValue;
        document.getElementById("leftupperarm_output").textContent = SliderValue;
        initNodes(leftUpperArmId);
    };

    document.getElementById("slider3").oninput = function () {
        SliderValue = event.srcElement.value;
        theta[leftLowerArmId] = SliderValue;
        document.getElementById("leftlowerarm_output").textContent = SliderValue;
        initNodes(leftLowerArmId);
    };

    document.getElementById("slider4").oninput = function () {
        SliderValue = event.srcElement.value;
        theta[rightUpperArmId] = SliderValue;
        document.getElementById("rightupperarm_output").textContent = SliderValue;
        initNodes(rightUpperArmId);
    };

    document.getElementById("slider5").oninput = function () {
        SliderValue = event.srcElement.value;
        theta[rightLowerArmId] = SliderValue;
        document.getElementById("rightlowerarm_output").textContent = SliderValue;
        initNodes(rightLowerArmId);
    };

    document.getElementById("slider6").oninput = function () {
        SliderValue = event.srcElement.value;
        theta[leftUpperLegId] = SliderValue;
        document.getElementById("leftupperleg_output").textContent = SliderValue;
        initNodes(leftUpperLegId);
    };

    document.getElementById("slider7").oninput = function () {
        SliderValue = event.srcElement.value;
        theta[leftLowerLegId] = SliderValue;
        document.getElementById("leftlowerleg_output").textContent = SliderValue;
        initNodes(leftLowerLegId);
    };

    document.getElementById("slider8").oninput = function () {
        SliderValue = event.srcElement.value;
        theta[rightUpperLegId] = SliderValue;
        document.getElementById("rightupperleg_output").textContent = SliderValue;
        initNodes(rightUpperLegId);
    };

    document.getElementById("slider9").oninput = function () {
        SliderValue = event.srcElement.value;
        theta[rightLowerLegId] = SliderValue;
        document.getElementById("rightlowerleg_output").textContent = SliderValue;
        initNodes(rightLowerLegId);
    };

    document.getElementById("slider10").oninput = function () {
        SliderValue = event.srcElement.value;
        theta[head2Id] = SliderValue;
        document.getElementById("head2_output").textContent = SliderValue;
        initNodes(head2Id);
    };

    document.getElementById("slider11").oninput = function () {
        SliderValue = event.srcElement.value - 400;
        theta[GLOBAL_X_COORDINATE] = SliderValue;
        gl.viewport(0 + theta[GLOBAL_X_COORDINATE], 0 + theta[GLOBAL_Y_COORDINATE], canvas.width, canvas.height);
        document.getElementById("positionX_output").textContent = SliderValue;
        initNodes(torsoId);
    };

    document.getElementById("slider12").oninput = function () {
        SliderValue = event.srcElement.value - 400;
        theta[GLOBAL_Y_COORDINATE] = SliderValue;
        gl.viewport(0 + theta[GLOBAL_X_COORDINATE], 0 + theta[GLOBAL_Y_COORDINATE], canvas.width, canvas.height);
        document.getElementById("positionY_output").textContent = SliderValue;
        initNodes(torsoId);
    };


    // =============================================================================
    // =======================Light Source Event Listener===========================
    // =============================================================================
    document.getElementById("ambientLightSlider").addEventListener("input", function () {
        // Get the current value of the slider
        var sliderValue = this.value;
        // Update the content of the output element with the slider value
        var x = document.getElementById("ambientLightValue").textContent = sliderValue;

        lightAmbient = vec4(x, x, 0.1, 1.0);
        ambientProduct = mult(lightAmbient, materialAmbient);
        gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
        updateLightSource();
    });

    document.getElementById("diffuseLightSlider").addEventListener("input", function () {
        // Get the current value of the slider
        var sliderValue = this.value;

        // Update the content of the output element with the slider value
        var x = document.getElementById("diffuseLightValue").textContent = sliderValue;
        lightDiffuse = vec4(x, x, 0.1, 1.0);
        diffuseProduct = mult(lightDiffuse, materialDiffuse);
        gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
        updateLightSource();
    });

    document.getElementById("specularLightSlider").addEventListener("input", function () {
        // Get the current value of the slider
        var sliderValue = this.value;

        // Update the content of the output element with the slider value
        var x = document.getElementById("specularLightValue").textContent = sliderValue;
        lightSpecular = vec4(x, x, 0.1, 1.0);
        specularProduct = mult(lightSpecular, materialSpecular);
        gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
        updateLightSource();
    });

    document.getElementById("brightnessSlider").oninput = function () {
        const brightnessValue = this.value;
        var brightnessLevel = brightnessValue / 100;
        var canvasContainer = document.getElementById("canvasContainer");

        canvasContainer.style.setProperty('--brightness-level', brightnessLevel);
        document.getElementById("bgBrightnessOutput").textContent = brightnessValue;
    };

    document.getElementById("ambientReflectionSlider").addEventListener("input", function () {
        // Get the current value of the slider
        var sliderValue = this.value;

        // Update the content of the output element with the slider value
        document.getElementById("ambientReflectionValue").textContent = sliderValue;

        // Update Ka with the slider value
        Ka = sliderValue;

        // Use the updated Ka value in your rendering logic
        gl.uniform1f(gl.getUniformLocation(program, "Ka"), Ka);
    });

    document.getElementById("diffuseReflectionSlider").addEventListener("input", function () {
        // Get the current value of the slider
        var sliderValue = this.value;

        // Update the content of the output element with the slider value
        document.getElementById("diffuseReflectionValue").textContent = sliderValue;

        // Update Ka with the slider value
        Kd = sliderValue;

        // Use the updated Ka value in your rendering logic
        gl.uniform1f(gl.getUniformLocation(program, "Kd"), Kd);
    });

    document.getElementById("specularReflectionSlider").addEventListener("input", function () {
        // Get the current value of the slider
        var sliderValue = this.value;

        // Update the content of the output element with the slider value
        document.getElementById("specularReflectionValue").textContent = sliderValue;

        // Update Ka with the slider value
        Ks = sliderValue;

        // Use the updated Ka value in your rendering logic
        gl.uniform1f(gl.getUniformLocation(program, "Ks"), Ks);
    });

    // =============================================================================
    // ======================Material Properties Event Listener=====================
    // =============================================================================

    document.getElementById("colorSelectorAmbient").addEventListener("input", function () {
        var colorValue = this.value;
        materialAmbient = hexToRgb(colorValue);
        ambientProduct = mult(lightAmbient, materialAmbient);
        gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    });

    document.getElementById("colorSelectorDiffuse").addEventListener("input", function () {
        var colorValue = this.value;
        materialDiffuse = hexToRgb(colorValue);
        diffuseProduct = mult(lightAmbient, materialDiffuse);
        gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
    });

    document.getElementById("colorSelectorSpecular").addEventListener("input", function () {
        var colorValue = this.value;
        materialSpecular = hexToRgb(colorValue);
        specularProduct = mult(lightAmbient, materialSpecular);
        gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
    });



    document.getElementById("shininessSlider").addEventListener("input", function () {
        // Get the current value of the slider
        var sliderValue = this.value;
        materialShininess = sliderValue;

        // Update the content of the output element with the slider value
        document.getElementById("shininessValue").textContent = sliderValue;
    });

    document.getElementById("lightX").addEventListener("input", function () {
        // Get the current value of the slider
        var sliderValue = this.value;

        // Update the content of the output element with the slider value
        document.getElementById("lightxValue").textContent = sliderValue;
        lightPosition[0] = parseFloat(this.value);
        updateLightSource();
    });

    document.getElementById("lightY").addEventListener("input", function () {
        // Get the current value of the slider
        var sliderValue = this.value;

        // Update the content of the output element with the slider value
        document.getElementById("lightyValue").textContent = sliderValue;
        lightPosition[0] = parseFloat(this.value);
        updateLightSource();
    });

    document.getElementById("lightZ").addEventListener("input", function () {
        // Get the current value of the slider
        var sliderValue = this.value;

        // Update the content of the output element with the slider value
        document.getElementById("lightzValue").textContent = sliderValue;
        lightPosition[0] = parseFloat(this.value);
        updateLightSource();
    });

    // =============================================================================
    // ======================View & Shading Event Listener==========================
    // =============================================================================

    document.getElementById("cameraXSlider").addEventListener("input", function () {
        // Get the current value of the slider
        var sliderValue = this.value;
        eye[0] = parseFloat(this.value);
        updateCamera();

        // Update the content of the output element with the slider value
        document.getElementById("cameraXValue").textContent = sliderValue;
    });

    document.getElementById("cameraYSlider").addEventListener("input", function () {
        // Get the current value of the slider
        var sliderValue = this.value;
        eye[1] = parseFloat(this.value);
        updateCamera();

        // Update the content of the output element with the slider value
        document.getElementById("cameraYValue").textContent = sliderValue;
    });


    document.getElementById("cameraZSlider").addEventListener("input", function () {
        // Get the current value of the slider
        var sliderValue = this.value;
        eye[2] = parseFloat(this.value);
        updateCamera();

        // Update the content of the output element with the slider value
        document.getElementById("cameraZValue").textContent = sliderValue;
    });

    for (i = 0; i < numNodes; i++) initNodes(i);

    render();
}

// =============================================================================
// ======================Helper Function for Assignment=========================
// =============================================================================

// Function to update the camera and trigger a re-render
function updateCamera() {
    modelViewMatrix = lookAt(eye, at, up);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix));
    render();
}

// Function to convert hex color to RGB
function hexToRgb(hex) {
    var r = parseInt(hex.substring(1, 3), 16) / 255;
    var g = parseInt(hex.substring(3, 5), 16) / 255;
    var b = parseInt(hex.substring(5, 7), 16) / 255;
    return vec4(r, g, b, 1.0);
}

// =============================================================================
// =============================Rendering Function==============================
// =============================================================================

var render = function () {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    traverse(torsoId);
    requestAnimFrame(render);

}

// =============================================================================