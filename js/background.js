class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(v) {
        return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    subtract(v) {
        return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    multiply(scalar) {
        return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    cross(v) {
        return new Vector3(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );
    }

    normalize() {
        const mag = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        if (mag === 0) return new Vector3(0, 0, 0);
        return new Vector3(this.x / mag, this.y / mag, this.z / mag);
    }
}

class Matrix4 {
    constructor() {
        this.m = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    }

    static rotationX(angle) {
        const matrix = new Matrix4();
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        matrix.m[5] = cos; matrix.m[6] = -sin;
        matrix.m[9] = sin; matrix.m[10] = cos;
        return matrix;
    }

    static rotationY(angle) {
        const matrix = new Matrix4();
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        matrix.m[0] = cos; matrix.m[2] = sin;
        matrix.m[8] = -sin; matrix.m[10] = cos;
        return matrix;
    }

    static rotationZ(angle) {
        const matrix = new Matrix4();
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        matrix.m[0] = cos; matrix.m[1] = -sin;
        matrix.m[4] = sin; matrix.m[5] = cos;
        return matrix;
    }

    static translation(x, y, z) {
        const matrix = new Matrix4();
        matrix.m[3] = x; matrix.m[7] = y; matrix.m[11] = z;
        return matrix;
    }

    multiply(other) {
        const result = new Matrix4();
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                result.m[row * 4 + col] = 0;
                for (let k = 0; k < 4; k++) {
                    result.m[row * 4 + col] += this.m[row * 4 + k] * other.m[k * 4 + col];
                }
            }
        }
        return result;
    }

    transformVector(v) {
        const x = v.x * this.m[0] + v.y * this.m[1] + v.z * this.m[2] + this.m[3];
        const y = v.x * this.m[4] + v.y * this.m[5] + v.z * this.m[6] + this.m[7];
        const z = v.x * this.m[8] + v.y * this.m[9] + v.z * this.m[10] + this.m[11];
        return new Vector3(x, y, z);
    }
}

class Triangle {
    constructor(v1, v2, v3) {
        this.vertices = [v1, v2, v3];
        this.normal = new Vector3();
        this.calculateNormal();
    }

    calculateNormal() {
        const edge1 = this.vertices[1].subtract(this.vertices[0]);
        const edge2 = this.vertices[2].subtract(this.vertices[0]);
        this.normal = edge1.cross(edge2).normalize();
    }

    getCenter() {
        return new Vector3(
            (this.vertices[0].x + this.vertices[1].x + this.vertices[2].x) / 3,
            (this.vertices[0].y + this.vertices[1].y + this.vertices[2].y) / 3,
            (this.vertices[0].z + this.vertices[1].z + this.vertices[2].z) / 3
        );
    }
}

class Mesh {
    constructor(triangles = [], position = new Vector3(), rotation = new Vector3()) {
        this.triangles = triangles;
        this.position = position;
        this.rotation = rotation;
        this.rotationSpeed = new Vector3(
            (Math.random() - 0.5) * 0.004,
            (Math.random() - 0.5) * 0.004,
            (Math.random() - 0.5) * 0.004
        );
        this.pulse = Math.random() * Math.PI * 2;

        const colors = [
            'rgba(148, 163, 184, 0.28)',
            'rgba(100, 116, 139, 0.25)',
            'rgba(59, 130, 246, 0.18)',
            'rgba(96, 165, 250, 0.2)',
            'rgba(147, 197, 253, 0.22)',
            'rgba(191, 219, 254, 0.26)',
            'rgba(226, 232, 240, 0.28)',
            'rgba(241, 245, 249, 0.32)'
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.strokeColor = 'rgba(71, 85, 105, 0.08)';
    }

    static createCube(size = 1) {
        const s = size / 2;
        const vertices = [
            new Vector3(-s, -s, -s), new Vector3(s, -s, -s), new Vector3(s, s, -s), new Vector3(-s, s, -s),
            new Vector3(-s, -s, s), new Vector3(s, -s, s), new Vector3(s, s, s), new Vector3(-s, s, s)
        ];

        const triangles = [
            new Triangle(vertices[0], vertices[1], vertices[2]), new Triangle(vertices[0], vertices[2], vertices[3]),
            new Triangle(vertices[4], vertices[6], vertices[5]), new Triangle(vertices[4], vertices[7], vertices[6]),
            new Triangle(vertices[0], vertices[4], vertices[5]), new Triangle(vertices[0], vertices[5], vertices[1]),
            new Triangle(vertices[2], vertices[6], vertices[7]), new Triangle(vertices[2], vertices[7], vertices[3]),
            new Triangle(vertices[0], vertices[3], vertices[7]), new Triangle(vertices[0], vertices[7], vertices[4]),
            new Triangle(vertices[1], vertices[5], vertices[6]), new Triangle(vertices[1], vertices[6], vertices[2])
        ];

        return new Mesh(triangles);
    }

    static createTetrahedron(size = 1) {
        const h = size * Math.sqrt(2/3);
        const vertices = [
            new Vector3(0, h/2, 0),
            new Vector3(-size/2, -h/2, size/2),
            new Vector3(size/2, -h/2, size/2),
            new Vector3(0, -h/2, -size/2)
        ];

        const triangles = [
            new Triangle(vertices[0], vertices[1], vertices[2]),
            new Triangle(vertices[0], vertices[2], vertices[3]),
            new Triangle(vertices[0], vertices[3], vertices[1]),
            new Triangle(vertices[1], vertices[3], vertices[2])
        ];

        return new Mesh(triangles);
    }

    static createOctahedron(size = 1) {
        const vertices = [
            new Vector3(0, size, 0), new Vector3(0, -size, 0),
            new Vector3(size, 0, 0), new Vector3(-size, 0, 0),
            new Vector3(0, 0, size), new Vector3(0, 0, -size)
        ];

        const triangles = [
            new Triangle(vertices[0], vertices[2], vertices[4]), new Triangle(vertices[0], vertices[4], vertices[3]),
            new Triangle(vertices[0], vertices[3], vertices[5]), new Triangle(vertices[0], vertices[5], vertices[2]),
            new Triangle(vertices[1], vertices[4], vertices[2]), new Triangle(vertices[1], vertices[3], vertices[4]),
            new Triangle(vertices[1], vertices[5], vertices[3]), new Triangle(vertices[1], vertices[2], vertices[5])
        ];

        return new Mesh(triangles);
    }

    update() {
        this.rotation = this.rotation.add(this.rotationSpeed);
        this.pulse += 0.01;
        this.position = new Vector3(this.position.x, this.position.y + Math.sin(this.pulse) * 0.02, this.position.z);
    }

    getTransformMatrix() {
        const rotX = Matrix4.rotationX(this.rotation.x);
        const rotY = Matrix4.rotationY(this.rotation.y);
        const rotZ = Matrix4.rotationZ(this.rotation.z);
        const trans = Matrix4.translation(this.position.x, this.position.y, this.position.z);

        return trans.multiply(rotX.multiply(rotY.multiply(rotZ)));
    }
}

class Camera {
    constructor(position = new Vector3(0, 0, -12)) {
        this.position = position;
        this.fov = 48;
        this.near = 0.1;
        this.far = 120;
    }

    project(point, canvas) {
        const fov = this.fov * Math.PI / 180;
        const f = 1 / Math.tan(fov / 2);
        const aspect = canvas.width / canvas.height;

        if (point.z <= this.near) return null;

        const x = (point.x * f / aspect) / point.z;
        const y = (point.y * f) / point.z;

        return {
            x: (x + 1) * canvas.width / 2,
            y: (-y + 1) * canvas.height / 2,
            z: point.z
        };
    }
}

class Renderer3D {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.camera = new Camera();
        this.meshes = [];
        this.lightDirection = new Vector3(0.2, -0.3, -1).normalize();
        this.mouse = { x: 0, y: 0 };

        this.setupCanvas();
        this.createScene();
        this.resizeCanvas();
        this.bindMouse();
    }

    setupCanvas() {
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);
    }

    bindMouse() {
        window.addEventListener('mousemove', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth - 0.5) * 2;
            this.mouse.y = (event.clientY / window.innerHeight - 0.5) * 2;
        });
    }

    createScene() {
        const shapes = [Mesh.createCube, Mesh.createTetrahedron, Mesh.createOctahedron];

        for (let i = 0; i < 20; i++) {
            const shapeFunction = shapes[Math.floor(Math.random() * shapes.length)];
            const mesh = shapeFunction(Math.random() * 1.6 + 1.1);

            mesh.position = new Vector3(
                (Math.random() - 0.5) * 48,
                (Math.random() - 0.5) * 36,
                Math.random() * 28 + 12
            );

            mesh.rotation = new Vector3(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );

            this.meshes.push(mesh);
        }
    }

    calculateLighting(normal) {
        const dot = Math.max(0.2, normal.dot(this.lightDirection.multiply(-1)));
        return 0.4 + 0.6 * dot;
    }

    drawTriangle(triangle, color, strokeColor) {
        const ctx = this.ctx;
        const v1 = this.camera.project(triangle.vertices[0], this.canvas);
        const v2 = this.camera.project(triangle.vertices[1], this.canvas);
        const v3 = this.camera.project(triangle.vertices[2], this.canvas);

        if (!v1 || !v2 || !v3) return;

        ctx.beginPath();
        ctx.moveTo(v1.x, v1.y);
        ctx.lineTo(v2.x, v2.y);
        ctx.lineTo(v3.x, v3.y);
        ctx.closePath();

        const lighting = this.calculateLighting(triangle.normal);
        const alpha = parseFloat(color.match(/[\d\.]+(?=\))/g).pop()) * lighting;
        const baseColor = color.replace(/[\d\.]+\)$/, `${alpha})`);

        ctx.fillStyle = baseColor;
        ctx.fill();

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 0.3;
        ctx.stroke();
    }

    render() {
        this.ctx.fillStyle = 'rgba(248, 250, 252, 0.08)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const trianglesToRender = [];

        for (const mesh of this.meshes) {
            mesh.update();
            const transform = mesh.getTransformMatrix();

            const parallax = new Matrix4();
            parallax.m[3] = this.mouse.x * 0.8;
            parallax.m[7] = this.mouse.y * 0.8;

            const combined = parallax.multiply(transform);

            for (const triangle of mesh.triangles) {
                const transformedTriangle = new Triangle(
                    combined.transformVector(triangle.vertices[0]),
                    combined.transformVector(triangle.vertices[1]),
                    combined.transformVector(triangle.vertices[2])
                );

                const center = transformedTriangle.getCenter();
                const viewDir = center.subtract(this.camera.position).normalize();
                if (transformedTriangle.normal.dot(viewDir) > 0) continue;

                trianglesToRender.push({
                    triangle: transformedTriangle,
                    color: mesh.color,
                    strokeColor: mesh.strokeColor,
                    depth: center.z
                });
            }
        }

        trianglesToRender.sort((a, b) => b.depth - a.depth);

        for (const item of trianglesToRender) {
            this.drawTriangle(item.triangle, item.color, item.strokeColor);
        }

        requestAnimationFrame(() => this.render());
    }
}

const canvas = document.getElementById('bgCanvas');
if (canvas) {
    const renderer = new Renderer3D(canvas);
    renderer.render();
}
