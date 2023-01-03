import * as THREE from 'three';
import * as CANNON from 'cannon-es'
import { Box2 } from 'three';
//init renderer/scene /camera/lights

const backgroundmusicurl = new URL('../sounds/DeadFeelings.mp3', import.meta.url);
const backgroundimageurl = new URL('../images/stars.png', import.meta.url);
const brickimageurl = new URL('../images/brick.jpg', import.meta.url);

//init the physics
const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, 0, 0), // m/s²
})
//init the scene
const scene = new THREE.Scene();
//const backgroundurl = new URL('../brick.png', import.meta.url);
//camera
//##########################################
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 500);//camera config
camera.position.set(0, 0, 15);//camera position
camera.lookAt(0, 0, 0);//camera rotation
//###########################################
//lights
const sun = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
scene.add(sun);

//renderer and linking it to the html

const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({ canvas });

//paddle
const paddlegeometry = new THREE.PlaneGeometry(5, 0.4);
const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
//init the paddles in plane form
const paddle = new THREE.Mesh(paddlegeometry, material);
paddle.position.set(0, -8.5, 0);//8.5 max in y
scene.add(paddle);

//init the ball
const ballgeometry = new THREE.CircleGeometry(0.2, 32);
const ball = new THREE.Mesh(ballgeometry, material);
ball.position.set(0, 0, 0);
scene.add(ball);

//init the bricks
const brickgeometry = new THREE.PlaneGeometry(2.5, 1.0);
const bricktexture = new THREE.TextureLoader().load(brickimageurl.href);
const brickmaterial = new THREE.MeshLambertMaterial({ map: bricktexture });

const paddlebody = new CANNON.Body({
    Shape: new CANNON.Box(new CANNON.Vec3(2.5, 0.2, 0.1))

})

const ballbody = new CANNON.Body({
    Shape: new CANNON.Box(new CANNON.Vec3(0.1, 0.1, 0.1))
})

paddlebody.position.set(0, -8.5, 0);
//code for adding brick to the brick to the scene
/*
const brick =new THREE.Mesh(brickgeometry,brickmaterial);
brick.position.set(0,0,0);
scene.add(brick);
*/
//init the paddles in plane form
//const paddle = new THREE.Mesh(paddlegeometry, material);
//paddle.position.set(0, -8.5, 0);//8.5 max in y
//scene.add(paddle);

//adding background music
const listener = new THREE.AudioListener();
camera.add(listener);

// create a global audio source
const sound = new THREE.Audio(listener);

// load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load(backgroundmusicurl.href, function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.7);
});


//setting the background picture to the pong background
const backgroundtexture = new THREE.TextureLoader().load(backgroundimageurl.href);
scene.background = backgroundtexture

brickarray = []
brickbodyarray=[]
//init the variables 
let ballx = 0;
let bally = 0;
let balldx = 0;
let balldy = 0;
let paddledirection = 0;
let score = 0;
let state = 0;

function buildbrick() {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 9; j++) {
            //build mesh brick and added to the scene and the array
            let brick = new THREE.Mesh(brickgeometry, brickmaterial);
            let bricky = 0 + (2 * i)
            let brickx = -15 + (4 * j)
            brick.position.set(brickx, bricky, 0);
            scene.add(brick);
            brickarray.push(brick);
            //make the aabb
            let brickbody = new CANNON.Body({
                Shape: new CANNON.Box(new CANNON.Vec3(2.5, 1, 0.1))
            })
            brickbody.position.set(brickx, bricky, 0);
            brickbody.aabb.lowerBound = new CANNON.Vec3(brickx - (2.5 / 2), bricky - (1 / 2), -0.1);
            brickbody.aabb.upperBound = new CANNON.Vec3(brickx + (2.5 / 2), bricky + (1 / 2), 0.1);
            world.addBody(brickbody);
            brickbodyarray.push(brickbody)
        }
    }
}
buildbrick();


//this function is called every frame to recalculate bouding boxes
function updateAABb() {
    //ball
    ballbody.aabb.lowerBound = new CANNON.Vec3(ballbody.position.x - 0.1, ballbody.position.y - 0.1, -0.1);
    ballbody.aabb.upperBound = new CANNON.Vec3(ballbody.position.x + 0.1, ballbody.position.y - 0.1, 0.1);
    //paddle
    paddlebody.aabb.lowerBound = new CANNON.Vec3(paddlebody.position.x - 2.5, paddlebody.position.y - 0.2, -0.1);
    paddlebody.aabb.upperBound = new CANNON.Vec3(paddlebody.position.x + 2.5, paddlebody.position.y + 0.2, 0.1);

};

//###############################
//this function is called to render every frame during runtime and to adjust screensize in case something changed
function render() {
    
    updateAABb()
    game();


    //console.log(paddle1box)

    //window resizing
    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = 19 / 9;
        camera.updateProjectionMatrix();
    }
    //request for next frame
    renderer.render(scene, camera);
    requestAnimationFrame(render);
    world.fixedStep()
}

//function to check if we need to resize the screen pixels height and width
function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}


//updating game meshes
function update_meshes() {
    paddle.position.copy(paddlebody.position)
    ball.position.copy(ballbody.position)
}

//is called every frame to check if the game on to update the ball position and check if new dx or dy need to be assigned based on any collisions
function ball_update() {
    if ((paddledirection == 1) && (paddlebody.position.x < 19.5)) {

        paddlebody.position.x += 0.2
    }
    else if ((paddledirection == -1) && (paddlebody.position.x > -19.5)) {
        paddlebody.position.x -= 0.2
    }
    //check for ball and brick collision
    brickbodyarray.forEach((element, index) => {
        if (element.aabb.overlaps(ballbody.aabb)) {
            if ((ballbody.position.x > element.position.x + 1) || (ballbody.position.x < element.position.x - 1)) {
                balldx = -balldx;
            }
            else {
                balldy = -balldy;
            }
            
            brickbodyarray.splice(index, 1);
            let e =brickarray[index];
            scene.remove(e);
            e.geometry.dispose();
            e.material.dispose();
            brickarray.splice(index, 1);
            score++;
        }
    });
    //console.log(ballbody.position.y);
    if(ballbody.position.x>20)
    {
        balldx=-ballx
    }
    else if(ballbody.position.x<-20)
    {
        balldx=ballx
    }
    if(ballbody.position.y>9)
    {
        balldy=-bally
    }
    if(ballbody.aabb.overlaps(paddlebody.aabb))
    {
        balldy=bally
    }
    if(ballbody.position.y <-9.5)
    {
        alert('Game Over')
        window.location.reload();
        state=0
          
    }
    ballbody.position.x += balldx
    ballbody.position.y += balldy
    //console.log(brickbodyarray.length)
    if(brickbodyarray.length==0)
    {
        state=2
    }
    
}

function game() {
    if (state == 0)//game starting
    {
        ballbody.position.set(0, -6, 0);
        ball.position.set(0, 0, 0);
        ballx =0.1 //(Math.random() * 0.4) - 0.2;
        bally =0.1// (Math.random() * 0.3) ;
        balldx=Math.abs(ballx)
        balldy=Math.abs(bally)
        

    }
    else if (state == 1) {
        
        ball_update();
        update_meshes();

    }
    else if (state == 2) {
        alert('WELL PLAYED');
        window.location.reload();
    }
    update_meshes();
}

document.addEventListener('keydown', (event) => {

    //paddle2 controls main player
    if (event.key == 'a') {
        paddledirection = -1
    }
    if (event.key == 'd') {
        paddledirection = 1
    }

}, false);

document.addEventListener('keyup', (event) => {
    //paddle2 controls main player
    if (event.key == 'a'&& paddledirection!=1)
    {
        paddledirection = 0
    }
    if(event.key == 'd' && paddledirection!=-1) {
        paddledirection = 0
    }
    if (event.key == 's' ) {
        state = 1
    }

    if (event.key == 'm') {
        if (sound.isPlaying)
            sound.stop();
        else {
            sound.play();
        }
    }

}, false);

//to start requestion animation frame loop like while(1)
requestAnimationFrame(render);





