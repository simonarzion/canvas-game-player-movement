const canvas = document.querySelector('canvas')

canvas.width = 1024
canvas.height = 576

const c = canvas.getContext('2d')

class Sprite {
    constructor({ position, imageSrc, frames = 1, buffer = 10 }) {
        this.position = position
        this.frames = frames
        this.buffer = buffer
        this.imageSrc = imageSrc
        this.currentFrame = 0
        this.elapsedFrames = 0
        this.image = new Image()
        this.image.src = this.imageSrc
        this.frameWidth = this.image.width / this.frames
    }

    draw() {
        const currentFrameBox = {
            position: {
                x: this.currentFrame * this.frameWidth,
                y: 0
            },
            width: this.frameWidth,
            height: this.image.height 
        }

        c.drawImage(
            this.image,
            currentFrameBox.position.x,
            currentFrameBox.position.y,
            currentFrameBox.width,
            currentFrameBox.height,
            this.position.x,
            this.position.y,
            this.frameWidth,
            this.image.height
        )

        this.elapsedFrames++
        
        if (this.elapsedFrames % this.buffer === 0) {
            if (this.currentFrame < this.frames - 1) this.currentFrame++
            else this.currentFrame = 0
            
        }
    
    }
}

class Player extends Sprite {
    constructor({ position, velocity, animations, imageSrc, frames }) {
        super({ position, imageSrc, frames })
        this.position = position
        this.velocity = velocity
        this.animations = animations
        this.currentAnimation = ''
        this.lastDirection = 'right'

        this.speed = 1
        this.weight = 5
        this.gravity = 1

        for (const animation in animations) {
            const animationImage = new Image() 
            animationImage.src = animations[animation].imageSrc
            this.animations[animation].image = animationImage
        }
    
    }

    update(input) {
        this.draw()
        this.handleMovement(input)
    }

    changeSprite(animation) {
        this.image = this.animations[animation].image
        this.buffer = this.animations[animation].buffer
        this.frames = this.animations[animation].frames
        this.currentAnimation = animation
    }

    isTouchingTheGround() {
        return this.position.y + this.image.height >= canvas.height
    }

    
    changeSpriteWithDirection(sprite, extension = 'Left') {
        if (this.lastDirection === 'right') {
            this.changeSprite(sprite);
        } else {
            this.changeSprite(`${sprite}${extension}`);
        }
    }

    handleControls() {
        const isMovingLeft = input.keys.includes('KeyA')
        const isMovingRight = input.keys.includes('KeyD')
        const isJumping = input.keys.includes('KeyW')

        if (isMovingLeft) {
            this.velocity.x = -5;
            this.changeSprite('RunLeft');
            this.lastDirection = 'left'
        } else if (isMovingRight) {
            this.velocity.x = 5;
            this.changeSprite('Run');
            this.lastDirection = 'right'
        } else {
            this.changeSpriteWithDirection('Idle')
            this.velocity.x = 0;
        }
        
        if (isJumping && this.isTouchingTheGround()) {
            this.velocity.y -= 50
        }
    }

    handleGravity() {
        if (!this.isTouchingTheGround()) {
            // handle gravity
            this.velocity.y += this.gravity
            
            // change jump animations
            if (this.velocity.y < 0) {
                this.changeSpriteWithDirection('Jump')
            } else {
                this.changeSpriteWithDirection('Fall')
            }
        } else {
            this.velocity.y = 0

            // clean jump animation
            if (this.currentAnimation === 'Jump') {
                this.changeSpriteWithDirection('Idle')
            }
        }
    }

    handleMovement(input) {
        this.handleControls(input)

        // handle horizontal movemente
        this.position.x += this.velocity.x * this.speed

        // handle vertical movement
        this.position.y += this.velocity.y / this.weight

        this.handleGravity()
    }
}

class Input {
    constructor() {
        this.keys = []
        this.validKeys = ['KeyA', 'KeyW', 'KeyD']


        window.addEventListener('keydown', e => {
            if (this.validKeys.includes(e.code) && !this.keys.includes(e.code)) {
                this.keys.push(e.code)
            }
        })
        window.addEventListener('keyup', e => {
            if (this.validKeys.includes(e.code)) {
                this.keys.splice(this.keys.indexOf(e.code), 1)
            }
        })
    }
}

const input = new Input()

const player = new Player({
    position: { x: 1, y: 0 },
    velocity: { x: 0, y: 0 },
    imageSrc: './assets/hero/sprites/Idle.png',
    frames: 8,
    animations: {
        IdleLeft: {
            imageSrc: './assets/hero/sprites/IdleLeft.png',
            frames: 8,
            buffer: 10
        },
        Idle: {
            imageSrc: './assets/hero/sprites/Idle.png',
            frames: 8,
            buffer: 10
        },
        RunLeft: {
            imageSrc: './assets/hero/sprites/RunLeft.png',
            frames: 8,
            buffer: 10
        },
        Run: {
            imageSrc: './assets/hero/sprites/Run.png',
            frames: 8,
            buffer: 10
        },
        Jump: {
            imageSrc: './assets/hero/sprites/Jump.png',
            frames: 2,
            buffer: 10
        },
        JumpLeft: {
            imageSrc: './assets/hero/sprites/JumpLeft.png',
            frames: 2,
            buffer: 10
        },
        Fall: {
            imageSrc: './assets/hero/sprites/Fall.png',
            frames: 2,
            buffer: 10
        },
        FallLeft: {
            imageSrc: './assets/hero/sprites/FallLeft.png',
            frames: 2,
            buffer: 10
        }
    }
})

function animate() {
    c.clearRect(0, 0, canvas.width, canvas.height)

    c.fillStyle = '#000'
    c.fillRect(0, 0, canvas.width, canvas.height)

    player.update(input)

    window.requestAnimationFrame(animate)
}

animate()
