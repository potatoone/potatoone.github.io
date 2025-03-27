// 确保THREE.js库已加载
if (typeof THREE === 'undefined') {
  console.error('THREE.js库未加载！');
}

// 创建一个基本的 Three.js 场景，包括 Scene（场景）、Camera（相机）和 WebGLRenderer（渲染器）。
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
  alpha: true,  // 透明背景
  antialias: true // 抗锯齿
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0); // 透明背景

// 将渲染器的canvas添加到DOM中
const fireworksContainer = document.createElement('div');
fireworksContainer.style.position = 'fixed';
fireworksContainer.style.top = '0';
fireworksContainer.style.left = '0';
fireworksContainer.style.width = '100%';
fireworksContainer.style.height = '100%';
fireworksContainer.style.zIndex = '0'; // 放在最底层
fireworksContainer.style.pointerEvents = 'none'; // 不拦截鼠标事件
fireworksContainer.appendChild(renderer.domElement);
document.body.appendChild(fireworksContainer);

// 调整相机位置和视野，让场景看起来更小
camera.position.z = 30;  // 减小Z轴距离，让视角更接近
camera.fov = 50;  // 调整视野角度，让场景更窄
camera.updateProjectionMatrix();  // 更新相机投影矩阵

// 添加后期处理（Bloom 效果）
const composer = new THREE.EffectComposer(renderer);
const renderPass = new THREE.RenderPass(scene, camera);
const bloomPass = new THREE.UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.2,  // 泛光强度
    0.5,  // 泛光半径
    0.85  // 泛光阈值
);
bloomPass.threshold = 0.1;
bloomPass.strength = 0.25; // 背景透明度
bloomPass.radius = 0.1;
composer.addPass(renderPass);
composer.addPass(bloomPass);

// 创建烟花粒子的几何体
const particleCount = 600;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);
const sizes = new Float32Array(particleCount);

// 修正粒子初始化代码
for (let i = 0; i < particleCount; i++) {
    // 确保正确设置位置数组（之前是用particleCount * 1，应该是* 3）
    positions[i * 3] = (Math.random() - 0.5) * 0.05;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 0.05;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
    
    // 随机颜色
    colors[i * 3] = Math.random();
    colors[i * 3 + 1] = Math.random();
    colors[i * 3 + 2] = Math.random();
    
    // 随机大小，稍微增大一点
    sizes[i] = Math.random() * 3 + 2;
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

// 使用 THREE.Points 来管理烟花粒子，并利用着色器 (ShaderMaterial) 实现更细腻的视觉效果。
const fireworkMaterial = new THREE.ShaderMaterial({
    uniforms: {
        color: { value: new THREE.Color(0xffffff) },
        pointTexture: { value: new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/disc.png') }
    },
    vertexShader: `
        attribute float size;
        attribute vec3 customColor;
        varying vec3 vColor;
        void main() {
            vColor = customColor;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (200.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
    fragmentShader: `
        uniform vec3 color;
        uniform sampler2D pointTexture;
        varying vec3 vColor;
        void main() {
            gl_FragColor = vec4(color * vColor, 1.0);
            gl_FragColor = gl_FragColor * texture2D(pointTexture, gl_PointCoord);
            if (gl_FragColor.a < 0.1) discard;
        }
    `,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true
});

// Firework 类用于模拟单个烟花的运动轨迹和爆炸效果。
class Firework {
    constructor() {
        // 深拷贝几何体，每个烟花使用独立的几何体
        const fireworkGeometry = geometry.clone();
        this.particles = new THREE.Points(fireworkGeometry, fireworkMaterial);
        
        // 进一步限制烟花的生成位置
        // 使用固定值而不是相对于屏幕尺寸的值
        this.particles.position.set(
            (Math.random() - 1) * 100,  // 限制X轴范围 (-5 到 5)
            -15,  // 从屏幕底部往上发射，保持固定值
            0  // 保持Z轴为0，使烟花平面化，避免深度问题
        );
        
        this.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.1,  // 进一步减小X轴速度
            Math.random() * 0.5 + 0.3,  // 减小向上的速度
            0  // 保持Z轴速度为0
        );
        
        this.age = 0;
        this.exploded = false;
        this.dead = false;
        scene.add(this.particles);
    }

    update() {
        this.age++;
        
        if (!this.exploded) {
            this.particles.position.add(this.velocity);
            this.velocity.y -= 0.01; // 减小重力作用
            
            // 检查是否达到最高点
            if (this.velocity.y < 0) {
                this.explode();
                this.exploded = true;
            }
            
            // 如果超出屏幕边界，立即爆炸
            if (Math.abs(this.particles.position.x) > 15 || 
                this.particles.position.y > 15 ||
                this.particles.position.y < -100) {
                this.explode();
                this.exploded = true;
            }
        } else {
            // 烟花爆炸后处理...
            const positions = this.particles.geometry.attributes.position.array;
            const velocities = this.velocities;
            
            for (let i = 0; i < positions.length; i += 3) {
                positions[i] += velocities[i];
                positions[i + 1] += velocities[i + 1] - 0.005; // 进一步减小重力效果，让粒子下落更慢
                positions[i + 2] += velocities[i + 2];
                
                // 限制粒子在屏幕内
                if (Math.abs(positions[i]) > 15) {
                    velocities[i] *= -0.5; // 碰撞时反弹，同时减速
                }
                if (Math.abs(positions[i+1]) > 15) {
                    velocities[i+1] *= -0.5; // 碰撞时反弹，同时减速
                }
            }
            
            this.particles.geometry.attributes.position.needsUpdate = true;
            
            // 减慢粒子尺寸缩小速度
            const sizes = this.particles.geometry.attributes.size.array;
            for (let i = 0; i < sizes.length; i++) {
                sizes[i] *= 0.97; // 从0.9改为0.995，让粒子缩小更慢
            }
            this.particles.geometry.attributes.size.needsUpdate = true;
            
            // 减少粒子生命周期
            if (this.age > 10000) {
                this.dead = true;
            }
        }
    }

    explode() {
        const positions = this.particles.geometry.attributes.position.array;
        this.velocities = new Float32Array(positions.length);
        
        // 大幅减小爆炸范围和速度
        for (let i = 0; i < positions.length; i += 3) {
            // 创建从中心向外的速度矢量，但速度更小
            const speed = Math.random() * 0.08 + 0.02;  // 更小的爆炸速度
            const randomDir = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 0.2  // 几乎没有Z轴扩散
            ).normalize();
            
            this.velocities[i] = randomDir.x * speed;
            this.velocities[i + 1] = randomDir.y * speed;
            this.velocities[i + 2] = randomDir.z * speed;
        }
        
        // 改变粒子颜色...（保持不变）
        const colors = this.particles.geometry.attributes.customColor.array;
        const baseColor = new THREE.Color(
            Math.random(),
            Math.random(),
            Math.random()
        );
        
        for (let i = 0; i < colors.length; i += 3) {
            const variation = 0.1;
            colors[i] = baseColor.r + (Math.random() - 0.5) * variation;
            colors[i + 1] = baseColor.g + (Math.random() - 0.5) * variation;
            colors[i + 2] = baseColor.b + (Math.random() - 0.5) * variation;
        }
        
        this.particles.geometry.attributes.customColor.needsUpdate = true;
    }
}

// 在 animate 函数中进一步减小生成频率
const fireworks = [];
function animate() {
    requestAnimationFrame(animate);
    
    // 降低生成频率到合理水平
    if (Math.random() < 0.2) {  // 从0.5改回0.005，否则会产生太多烟花
        fireworks.push(new Firework());
    }
    
    // 减小同时存在的烟花数量上限到合理值
    const maxFireworks = 100;  // 从100改为5，否则性能会受到很大影响
    if (fireworks.length > maxFireworks) {
        scene.remove(fireworks[0].particles);
        fireworks.shift();
    }
    
    // 更新烟花
    for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].update();
        
        if (fireworks[i].dead) {
            scene.remove(fireworks[i].particles);
            fireworks.splice(i, 1);
        }
    }
    
    composer.render();
}

// 窗口大小调整处理
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);

// 启动动画
animate();

// 提供一个方法来控制烟花的显示/隐藏
window.toggleFireworks = function(show) {
    fireworksContainer.style.display = show ? 'block' : 'none';
};
