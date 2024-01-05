var canvas;
var gl;
var program;
var modelViewMatrixLoc;

// Base colors
var baseColors = [
    vec4(1.0, 0.0, 0.0, 1.0),  // Red for car
    vec4(1.0, 0.0, 0.0, 1.0),  // Red for body
    vec4(1.0, 0.0, 0.0, 1.0),  // Red for roof
    vec4(0.0, 0.0, 0.0, 1.0),  // Black for wheels
];

// Hierarchical model parts
var car, body, roof, wheel1, wheel2, wheel3, wheel4;

// Transformation parameters
var angleCar = 0.0;
var angleBody = 0.0;
var angleRoof = 0.0;
var angleWheel1 = 0.0;
var angleWheel2 = 0.0;
var angleWheel3 = 0.0;
var angleWheel4 = 0.0;

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);

    if (!gl) {
        alert("WebGL isn't available");
    }

    // Define global variables for the camera
    var eye = vec3(0.0, 0.0, 5.0);  // Initial position of the camera
    var at = vec3(0.0, 0.0, 0.0);   // Point the camera is looking at
    var up = vec3(0.0, 1.0, 0.0);   // Up direction for the camera

    var viewMatrix, projectionMatrix;
    var fovy = 60.0;  // Field of view angle in degrees
    var aspect = canvas.width / canvas.height;
    var near = 0.1;
    var far = 100.0;

    // Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    if (!program) {
        console.error("Shader program failed to initialize");
        return;
    } else {
        console.log("Shader program initialized successfully");
    }
    gl.useProgram(program);

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    // Set up the view and projection matrices
    viewMatrix = lookAt(eye, at, up);
    projectionMatrix = perspective(fovy, aspect, near, far);

    // Pass the view and projection matrices to the shaders
    var viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
    var projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    
    gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    // Create the hierarchical model - car
    car = createPart(2.5, 1.2, 0.8); // length, width, depth
    body = createPart(2.0, 1.0, 0.5);
    roof = createPart(2.0, 0.6, 0.8);
    wheel1 = createPart(0.4, 0.4, 0.4);
    wheel2 = createPart(0.4, 0.4, 0.4);
    wheel3 = createPart(0.4, 0.4, 0.4);
    wheel4 = createPart(0.4, 0.4, 0.4);

    // Define hierarchical relationships
    car.children = [body, roof, wheel1, wheel2, wheel3, wheel4];
    body.parent = car;
    roof.parent = car;
    wheel1.parent = car;
    wheel2.parent = car;
    wheel3.parent = car;
    wheel4.parent = car;

    body.children = []; // No further children for the body
    roof.children = []; // No further children for the roof
    wheel1.children = [];
    wheel2.children = [];
    wheel3.children = [];
    wheel4.children = [];

    // Attach event listeners to sliders
    document.getElementById("carRotation").addEventListener("input", function () {
        angleCar = parseFloat(this.value);
        render();
    });

    document.getElementById("bodyRotation").addEventListener("input", function () {
        angleBody = parseFloat(this.value);
        render();
    });

    document.getElementById("roofRotation").addEventListener("input", function () {
        angleRoof = parseFloat(this.value);
        render();
    });

    document.getElementById("wheel1Rotation").addEventListener("input", function () {
        angleWheel1 = parseFloat(this.value);
        render();
    });

    document.getElementById("wheel2Rotation").addEventListener("input", function () {
        angleWheel2 = parseFloat(this.value);
        render();
    });

    document.getElementById("wheel3Rotation").addEventListener("input", function () {
        angleWheel3 = parseFloat(this.value);
        render();
    });

    document.getElementById("wheel4Rotation").addEventListener("input", function () {
        angleWheel4 = parseFloat(this.value);
        render();
    });

    // initializeWebGL();

    render();


};

function createPart(length, width, depth) {
    return {
        length: length,
        width: width,
        depth: depth,
        transform: mat4(),
        children: [],
    };
}

function updateTransformations() {
    var transformations = {};

    transformations["Car"] = rotate(angleCar, 0, 1, 0);
    transformations["Body"] = mult(translate(car.length / 2, 0, 0), rotate(angleBody, 0, 1, 0));
    transformations["Roof"] = mult(translate(0, body.width / 2, 0), rotate(angleRoof, 0, 0, 1));
    transformations["Wheel1"] = mult(translate(-car.length / 2, -car.width / 2, -car.depth / 2), rotate(angleWheel1, 0, 0, 1));
    transformations["Wheel2"] = mult(translate(-car.length / 2, -car.width / 2, car.depth / 2), rotate(angleWheel2, 0, 0, 1));
    transformations["Wheel3"] = mult(translate(car.length / 2, -car.width / 2, -car.depth / 2), rotate(angleWheel3, 0, 0, 1));
    transformations["Wheel4"] = mult(translate(car.length / 2, -car.width / 2, car.depth / 2), rotate(angleWheel4, 0, 0, 1));

    // Apply transformations to each part of the car model
    car.transform = transformations["Car"];
    body.transform = transformations["Body"];
    roof.transform = transformations["Roof"];
    wheel1.transform = transformations["Wheel1"];
    wheel2.transform = transformations["Wheel2"];
    wheel3.transform = transformations["Wheel3"];
    wheel4.transform = transformations["Wheel4"];

    return transformations;
}



function createBuffer(vertices, colors) {
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(interleaveArrays(vertices, colors)), gl.STATIC_DRAW);
    return buffer;
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Update transformations
    updateTransformations();

    // Render the entire hierarchical model starting from the root (car)
    renderPart(car, mat4());

    // initializeWebGL();

    // requestAnimationFrame(render);
}

function renderPart(part, parentModelViewMatrix) {
    if (!part) {
        return; // Add a check for undefined part
    }

    var vertices = getBoxVertices(part.length, part.width, part.depth);
    var colors = getRandomColors(vertices.length / 3);

    // Combine buffer creation and setup into the renderPart function
    const buffer = createBuffer(vertices, colors);
    if (!buffer) {
        return;  // Return if buffer creation fails
    }

    // Set up attribute pointers and enable them
    var vPosition = gl.getAttribLocation(program, "vPosition");
    var vColor = gl.getAttribLocation(program, "vColor");

    if (vPosition < 0 || vColor < 0) {
        console.error("Failed to get attribute locations.");
        return;
    }

    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 28, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 28, 12);
    gl.enableVertexAttribArray(vColor);

    // Apply transformations
    if (!part.transform) {
        part.transform = mat4(); // Add a check for undefined transform
    }

    var modelViewMatrix = mult(parentModelViewMatrix, part.transform);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    // Draw the part using gl.TRIANGLES
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);

    // Render children by using recursive function
    for (var i = 0; i < part.children.length; i++) {
        renderPart(part.children[i], modelViewMatrix);
    }
}

function initializeWebGL() {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Vertices for the root cube
    const rootCubeVertices = new Float32Array([
        -0.5, -0.5, -0.5,
         0.5, -0.5, -0.5,
         0.5,  0.5, -0.5,
        -0.5,  0.5, -0.5,
    ]);

    gl.bufferData(gl.ARRAY_BUFFER, rootCubeVertices, gl.STATIC_DRAW);

    const positionAttributeLocation = gl.getAttribLocation(program, 'vPosition');
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttributeLocation);

    const modelViewMatrix = mat4();
    const modelViewMatrixLocation = gl.getUniformLocation(program, 'modelViewMatrix');
    gl.uniformMatrix4fv(modelViewMatrixLocation, false, flatten(modelViewMatrix));

    gl.clearColor(0.8, 0.8, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);

    // Render the root cube
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, rootCubeVertices.length / 3);
}


// Helper functions for creating and rendering a box
function getBoxVertices(length, width, depth) {
    var vertices = [
        vec3(-length / 2, -width / 2, -depth / 2),
        vec3(length / 2, -width / 2, -depth / 2),
        vec3(length / 2, width / 2, -depth / 2),
        vec3(-length / 2, width / 2, -depth / 2),
        vec3(-length / 2, -width / 2, depth / 2),
        vec3(length / 2, -width / 2, depth / 2),
        vec3(length / 2, width / 2, depth / 2),
        vec3(-length / 2, width / 2, depth / 2),
    ];

    return vertices;
}

function getRandomColors(numVertices) {
    var colors = [];
    for (var i = 0; i < numVertices; i++) {
        colors.push(baseColors[i % baseColors.length]);
    }
    return colors;
}

function interleaveArrays(arr1, arr2) {
    var interleaved = [];
    var length = Math.max(arr1.length, arr2.length);

    for (var i = 0; i < length; i++) {
        var vertex = arr1[i] || [0, 0, 0];
        var color = arr2[i] || [0, 0, 0, 0];
        interleaved.push(vertex[0], vertex[1], vertex[2], color[0], color[1], color[2], color[3]);
    }

    return interleaved;
}